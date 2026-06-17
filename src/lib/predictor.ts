import { Team, WORLD_CUP_AVG_GOALS } from '@/data/teams';

export interface ScoreProb {
  home: number;
  away: number;
  probability: number;
}

export interface MatchPrediction {
  homeTeam: Team;
  awayTeam: Team;
  homeXG: number;
  awayXG: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  // Goal markets
  over15Prob: number;
  under15Prob: number;
  over25Prob: number;
  under25Prob: number;
  over35Prob: number;
  under35Prob: number;
  // BTTS
  bttsYesProb: number;
  bttsNoProb: number;
  // Double chance
  homeOrDrawProb: number;
  awayOrDrawProb: number;
  homeOrAwayProb: number;
  // Asian handicap
  ahHome05Prob: number;   // Home -0.5 (home wins by 1+)
  ahAway05Prob: number;   // Away -0.5 (away wins by 1+)
  ahHomeLevel: number;    // Asian handicap 0 (home wins or refund on draw)
  ahAwayLevel: number;    // Asian handicap 0 (away wins or refund on draw)
  // Correct scores
  topScores: ScoreProb[];
  // Derived odds
  predictedScore: { home: number; away: number };
  // Confidence
  confidenceScore: number; // 0-100
  // Key factors
  eloAdvantage: { team: string; diff: number };
  attackAdvantage: { team: string; ratio: number };
  formAdvantage: { team: string; diff: number };
}

function factorial(n: number): number {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function poisson(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

// Dixon-Coles low-score adjustment (improves accuracy on 0-0 and 1-1 results)
function dixonColesRho(homeGoals: number, awayGoals: number, lambdaHome: number, lambdaAway: number, rho: number): number {
  if (homeGoals === 0 && awayGoals === 0) return 1 - lambdaHome * lambdaAway * rho;
  if (homeGoals === 0 && awayGoals === 1) return 1 + lambdaHome * rho;
  if (homeGoals === 1 && awayGoals === 0) return 1 + lambdaAway * rho;
  if (homeGoals === 1 && awayGoals === 1) return 1 - rho;
  return 1;
}

export function predictMatch(home: Team, away: Team, neutralVenue: boolean = true): MatchPrediction {
  const avgGoals = WORLD_CUP_AVG_GOALS;

  // ── Step 1: Base expected goals from team attack × opponent defense ──
  let homeXG = home.attackStrength * away.defenseStrength * avgGoals;
  let awayXG = away.attackStrength * home.defenseStrength * avgGoals;

  // ── Step 2: Elo adjustment ──────────────────────────────────────────
  const eloDiff = home.eloRating - away.eloRating;
  // Elo win probability for home team (standard formula)
  const eloHomeWinProb = 1 / (1 + Math.pow(10, -eloDiff / 400));
  // Scale factor: sqrt to avoid over-adjusting xG
  const eloScale = Math.sqrt(eloHomeWinProb / 0.5);
  homeXG *= eloScale;
  awayXG /= eloScale;

  // ── Step 3: Home venue adjustment ──────────────────────────────────
  if (!neutralVenue) {
    homeXG *= 1.10;
    awayXG *= 0.92;
  }

  // ── Step 4: Recent form adjustment ─────────────────────────────────
  const homeFormFactor = 0.82 + 0.36 * home.recentForm;  // range 0.82–1.18
  const awayFormFactor = 0.82 + 0.36 * away.recentForm;
  homeXG *= homeFormFactor;
  awayXG *= awayFormFactor;

  // Clamp to reasonable bounds (0.3 – 4.0)
  homeXG = Math.max(0.30, Math.min(4.0, homeXG));
  awayXG = Math.max(0.30, Math.min(4.0, awayXG));

  // ── Step 5: Build score probability matrix (0–6 goals each) ────────
  const maxGoals = 7;
  const rho = -0.10; // Dixon-Coles correlation correction
  const scoreMatrix: number[][] = [];
  let totalProb = 0;

  for (let h = 0; h < maxGoals; h++) {
    scoreMatrix[h] = [];
    for (let a = 0; a < maxGoals; a++) {
      const p = poisson(h, homeXG) * poisson(a, awayXG) * dixonColesRho(h, a, homeXG, awayXG, rho);
      scoreMatrix[h][a] = Math.max(0, p);
      totalProb += Math.max(0, p);
    }
  }

  // Normalize
  for (let h = 0; h < maxGoals; h++) {
    for (let a = 0; a < maxGoals; a++) {
      scoreMatrix[h][a] /= totalProb;
    }
  }

  // ── Step 6: Aggregate markets ───────────────────────────────────────
  let homeWin = 0, draw = 0, awayWin = 0;
  let over15 = 0, over25 = 0, over35 = 0;
  let bttsYes = 0;
  const scoreProbs: ScoreProb[] = [];

  for (let h = 0; h < maxGoals; h++) {
    for (let a = 0; a < maxGoals; a++) {
      const p = scoreMatrix[h][a];
      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;

      const totalGoals = h + a;
      if (totalGoals > 1.5) over15 += p;
      if (totalGoals > 2.5) over25 += p;
      if (totalGoals > 3.5) over35 += p;
      if (h > 0 && a > 0) bttsYes += p;

      scoreProbs.push({ home: h, away: a, probability: p });
    }
  }

  scoreProbs.sort((a, b) => b.probability - a.probability);
  const topScores = scoreProbs.slice(0, 10);

  // Most likely score
  const mostLikely = topScores[0];
  const predictedScore = { home: mostLikely.home, away: mostLikely.away };

  // ── Step 7: Derived markets ─────────────────────────────────────────
  const homeOrDraw = homeWin + draw;
  const awayOrDraw = awayWin + draw;
  const homeOrAway = homeWin + awayWin;

  // Asian handicap -0.5 = outright win needed
  const ahHome05 = homeWin;
  const ahAway05 = awayWin;
  // Level handicap = win or half-stake refund on draw
  const ahHomeLevel = homeWin + draw * 0.5;
  const ahAwayLevel = awayWin + draw * 0.5;

  // ── Step 8: Confidence score based on Elo gap ──────────────────────
  const eloDiffAbs = Math.abs(eloDiff);
  const confidenceScore = Math.min(95, Math.round(50 + eloDiffAbs * 0.04));

  // ── Step 9: Key factors ─────────────────────────────────────────────
  const eloAdvantage = {
    team: home.eloRating >= away.eloRating ? home.name : away.name,
    diff: Math.abs(eloDiff),
  };
  const attackRatio = home.attackStrength / away.attackStrength;
  const attackAdvantage = {
    team: attackRatio >= 1 ? home.name : away.name,
    ratio: Math.max(attackRatio, 1 / attackRatio),
  };
  const formDiff = home.recentForm - away.recentForm;
  const formAdvantage = {
    team: formDiff >= 0 ? home.name : away.name,
    diff: Math.abs(formDiff),
  };

  return {
    homeTeam: home,
    awayTeam: away,
    homeXG,
    awayXG,
    homeWinProb: homeWin,
    drawProb: draw,
    awayWinProb: awayWin,
    over15Prob: over15,
    under15Prob: 1 - over15,
    over25Prob: over25,
    under25Prob: 1 - over25,
    over35Prob: over35,
    under35Prob: 1 - over35,
    bttsYesProb: bttsYes,
    bttsNoProb: 1 - bttsYes,
    homeOrDrawProb: homeOrDraw,
    awayOrDrawProb: awayOrDraw,
    homeOrAwayProb: homeOrAway,
    ahHome05Prob: ahHome05,
    ahAway05Prob: ahAway05,
    ahHomeLevel,
    ahAwayLevel,
    topScores,
    predictedScore,
    confidenceScore,
    eloAdvantage,
    attackAdvantage,
    formAdvantage,
  };
}

export function probToDecimalOdds(prob: number): string {
  if (prob <= 0 || prob >= 1) return '-';
  return (1 / prob).toFixed(2);
}

export function probToAmerican(prob: number): string {
  if (prob <= 0 || prob >= 1) return '-';
  if (prob >= 0.5) {
    return `-${Math.round((prob / (1 - prob)) * 100)}`;
  } else {
    return `+${Math.round(((1 - prob) / prob) * 100)}`;
  }
}
