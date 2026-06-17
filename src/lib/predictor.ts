import { Team, WORLD_CUP_AVG_GOALS, WC_AVG_CORNERS_PER_TEAM, WC_AVG_CARDS_PER_TEAM } from '@/data/teams';
import { Player } from '@/data/players';

export interface ScoreProb { home: number; away: number; probability: number; }
export interface PlayerScorerOdds { player: Player; anytimeProb: number; firstGoalProb: number; }

export interface MatchPrediction {
  homeTeam: Team; awayTeam: Team;
  homeXG: number; awayXG: number;
  homeWinProb: number; drawProb: number; awayWinProb: number;
  over15Prob: number; under15Prob: number;
  over25Prob: number; under25Prob: number;
  over35Prob: number; under35Prob: number;
  over45Prob: number; under45Prob: number;
  bttsYesProb: number; bttsNoProb: number;
  homeOrDrawProb: number; awayOrDrawProb: number; homeOrAwayProb: number;
  ahHome05Prob: number; ahAway05Prob: number;
  ahHomeLevel: number; ahAwayLevel: number;
  ahHome15Prob: number; ahAway15Prob: number;
  topScores: ScoreProb[];
  predictedScore: { home: number; away: number };
  htHomeWinProb: number; htDrawProb: number; htAwayWinProb: number;
  homeCleanSheetProb: number; awayCleanSheetProb: number;
  homeWinToNilProb: number; awayWinToNilProb: number;
  over05FirstHalfProb: number; over15FirstHalfProb: number; bttsFirstHalfProb: number;
  homeExpectedCorners: number; awayExpectedCorners: number; totalExpectedCorners: number;
  cornersOver75Prob: number; cornersOver85Prob: number; cornersOver95Prob: number;
  cornersOver105Prob: number; cornersOver115Prob: number;
  homeCorners45Prob: number; awayCorners35Prob: number;
  homeExpectedCards: number; awayExpectedCards: number; totalExpectedCards: number;
  cardsOver25Prob: number; cardsOver35Prob: number; cardsOver45Prob: number;
  homeCardsOver15Prob: number; awayCardsOver15Prob: number;
  homeScorers: PlayerScorerOdds[]; awayScorers: PlayerScorerOdds[];
  confidenceScore: number;
  eloAdvantage: { team: string; diff: number };
  attackAdvantage: { team: string; ratio: number };
  formAdvantage: { team: string; diff: number };
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
}
function poisson(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}
function dixonColes(h: number, a: number, lH: number, lA: number, rho: number): number {
  if (h === 0 && a === 0) return 1 - lH * lA * rho;
  if (h === 0 && a === 1) return 1 + lH * rho;
  if (h === 1 && a === 0) return 1 + lA * rho;
  if (h === 1 && a === 1) return 1 - rho;
  return 1;
}
function poissonOver(threshold: number, lambda: number): number {
  let under = 0;
  for (let k = 0; k <= Math.floor(threshold); k++) under += poisson(k, lambda);
  return 1 - under;
}

export function predictMatch(
  home: Team, away: Team, neutralVenue: boolean,
  homePlayers: Player[], awayPlayers: Player[]
): MatchPrediction {
  // xG
  let homeXG = home.attackStrength * away.defenseStrength * WORLD_CUP_AVG_GOALS;
  let awayXG  = away.attackStrength * home.defenseStrength * WORLD_CUP_AVG_GOALS;
  const eloDiff = home.eloRating - away.eloRating;
  const eloScale = Math.sqrt((1 / (1 + Math.pow(10, -eloDiff / 400))) / 0.5);
  homeXG *= eloScale; awayXG /= eloScale;
  if (!neutralVenue) { homeXG *= 1.10; awayXG *= 0.92; }
  homeXG *= 0.82 + 0.36 * home.recentForm;
  awayXG  *= 0.82 + 0.36 * away.recentForm;
  homeXG = Math.max(0.30, Math.min(4.0, homeXG));
  awayXG  = Math.max(0.30, Math.min(4.0, awayXG));

  // Score matrix
  const maxG = 7, rho = -0.10;
  const matrix: number[][] = [];
  let total = 0;
  for (let h = 0; h < maxG; h++) {
    matrix[h] = [];
    for (let a = 0; a < maxG; a++) {
      const p = Math.max(0, poisson(h, homeXG) * poisson(a, awayXG) * dixonColes(h, a, homeXG, awayXG, rho));
      matrix[h][a] = p; total += p;
    }
  }
  for (let h = 0; h < maxG; h++) for (let a = 0; a < maxG; a++) matrix[h][a] /= total;

  let homeWin = 0, draw = 0, awayWin = 0;
  let over15 = 0, over25 = 0, over35 = 0, over45 = 0, btts = 0;
  let ahHome15 = 0, ahAway15 = 0;
  const scores: ScoreProb[] = [];
  for (let h = 0; h < maxG; h++) {
    for (let a = 0; a < maxG; a++) {
      const p = matrix[h][a];
      if (h > a) homeWin += p; else if (h === a) draw += p; else awayWin += p;
      const t = h + a;
      if (t > 1.5) over15 += p;
      if (t > 2.5) over25 += p;
      if (t > 3.5) over35 += p;
      if (t > 4.5) over45 += p;
      if (h > 0 && a > 0) btts += p;
      if (h - a >= 2) ahHome15 += p;
      if (a - h >= 2) ahAway15 += p;
      scores.push({ home: h, away: a, probability: p });
    }
  }
  scores.sort((x, y) => y.probability - x.probability);

  // Half-time (40% of xG)
  const htHXG = homeXG * 0.40, htAXG = awayXG * 0.40;
  let htHomeWin = 0, htDraw = 0, htAwayWin = 0, ht05 = 0, ht15 = 0, htBtts = 0, htTot = 0;
  const htM: number[][] = [];
  for (let h = 0; h < maxG; h++) { htM[h] = []; for (let a = 0; a < maxG; a++) { const p = Math.max(0, poisson(h, htHXG) * poisson(a, htAXG) * dixonColes(h, a, htHXG, htAXG, rho)); htM[h][a] = p; htTot += p; } }
  for (let h = 0; h < maxG; h++) for (let a = 0; a < maxG; a++) htM[h][a] /= htTot;
  for (let h = 0; h < maxG; h++) for (let a = 0; a < maxG; a++) { const p = htM[h][a]; if (h > a) htHomeWin += p; else if (h === a) htDraw += p; else htAwayWin += p; const t = h+a; if (t > 0.5) ht05 += p; if (t > 1.5) ht15 += p; if (h > 0 && a > 0) htBtts += p; }

  const homeCS = poisson(0, awayXG);
  const awayCS = poisson(0, homeXG);

  // Corners
  const avgC = WC_AVG_CORNERS_PER_TEAM;
  const hCorners = home.cornersFor * (away.cornersConceded / avgC);
  const aCorners  = away.cornersFor  * (home.cornersConceded / avgC);
  const cMax = 25;
  let cTot = 0; const cProbs = new Array(cMax).fill(0);
  for (let hc = 0; hc < cMax; hc++) for (let ac = 0; ac < cMax; ac++) { const p = poisson(hc, hCorners) * poisson(ac, aCorners); const t = hc+ac; if (t < cMax) cProbs[t] += p; cTot += p; }
  let cU7=0,cU8=0,cU9=0,cU10=0,cU11=0;
  for (let i = 0; i < cMax; i++) { cProbs[i]/=cTot; if(i<=7)cU7+=cProbs[i]; if(i<=8)cU8+=cProbs[i]; if(i<=9)cU9+=cProbs[i]; if(i<=10)cU10+=cProbs[i]; if(i<=11)cU11+=cProbs[i]; }

  // Cards
  const avgCards = WC_AVG_CARDS_PER_TEAM;
  const hCards = home.cardsFor * (away.cardsAgainst / avgCards);
  const aCards  = away.cardsFor  * (home.cardsAgainst / avgCards);
  const cardMax = 12;
  let cardTot = 0; const cardProbs = new Array(cardMax).fill(0);
  for (let hc = 0; hc < cardMax; hc++) for (let ac = 0; ac < cardMax; ac++) { const p = poisson(hc, hCards) * poisson(ac, aCards); const t = hc+ac; if (t < cardMax) cardProbs[t] += p; cardTot += p; }
  let cardU2=0,cardU3=0,cardU4=0;
  for (let i = 0; i < cardMax; i++) { cardProbs[i]/=cardTot; if(i<=2)cardU2+=cardProbs[i]; if(i<=3)cardU3+=cardProbs[i]; if(i<=4)cardU4+=cardProbs[i]; }

  // Goalscorers
  const homeScoresFirst = homeWin * 0.65 + draw * 0.5 + 0.10;
  const awayScoresFirst  = awayWin  * 0.65 + draw * 0.5 + 0.10;
  function buildScorers(pl: Player[], xg: number, sf: number): PlayerScorerOdds[] {
    return pl.map(p => ({ player: p, anytimeProb: 1 - Math.exp(-xg * p.xGShare), firstGoalProb: p.xGShare * sf * (1 - Math.exp(-xg * p.xGShare * 0.8)) })).sort((a,b)=>b.anytimeProb-a.anytimeProb);
  }

  return {
    homeTeam: home, awayTeam: away, homeXG, awayXG,
    homeWinProb: homeWin, drawProb: draw, awayWinProb: awayWin,
    over15Prob: over15, under15Prob: 1-over15,
    over25Prob: over25, under25Prob: 1-over25,
    over35Prob: over35, under35Prob: 1-over35,
    over45Prob: over45, under45Prob: 1-over45,
    bttsYesProb: btts, bttsNoProb: 1-btts,
    homeOrDrawProb: homeWin+draw, awayOrDrawProb: awayWin+draw, homeOrAwayProb: homeWin+awayWin,
    ahHome05Prob: homeWin, ahAway05Prob: awayWin,
    ahHomeLevel: homeWin+draw*0.5, ahAwayLevel: awayWin+draw*0.5,
    ahHome15Prob: ahHome15, ahAway15Prob: ahAway15,
    topScores: scores.slice(0,10), predictedScore: { home: scores[0].home, away: scores[0].away },
    htHomeWinProb: htHomeWin, htDrawProb: htDraw, htAwayWinProb: htAwayWin,
    homeCleanSheetProb: homeCS, awayCleanSheetProb: awayCS,
    homeWinToNilProb: homeWin*homeCS, awayWinToNilProb: awayWin*awayCS,
    over05FirstHalfProb: ht05, over15FirstHalfProb: ht15, bttsFirstHalfProb: htBtts,
    homeExpectedCorners: hCorners, awayExpectedCorners: aCorners, totalExpectedCorners: hCorners+aCorners,
    cornersOver75Prob: 1-cU7, cornersOver85Prob: 1-cU8, cornersOver95Prob: 1-cU9,
    cornersOver105Prob: 1-cU10, cornersOver115Prob: 1-cU11,
    homeCorners45Prob: poissonOver(4.5, hCorners), awayCorners35Prob: poissonOver(3.5, aCorners),
    homeExpectedCards: hCards, awayExpectedCards: aCards, totalExpectedCards: hCards+aCards,
    cardsOver25Prob: 1-cardU2, cardsOver35Prob: 1-cardU3, cardsOver45Prob: 1-cardU4,
    homeCardsOver15Prob: poissonOver(1.5, hCards), awayCardsOver15Prob: poissonOver(1.5, aCards),
    homeScorers: buildScorers(homePlayers, homeXG, homeScoresFirst),
    awayScorers:  buildScorers(awayPlayers,  awayXG,  awayScoresFirst),
    confidenceScore: Math.min(95, Math.round(50 + Math.abs(eloDiff) * 0.04)),
    eloAdvantage: { team: home.eloRating >= away.eloRating ? home.name : away.name, diff: Math.abs(eloDiff) },
    attackAdvantage: { team: home.attackStrength >= away.attackStrength ? home.name : away.name, ratio: Math.max(home.attackStrength/away.attackStrength, away.attackStrength/home.attackStrength) },
    formAdvantage: { team: home.recentForm >= away.recentForm ? home.name : away.name, diff: Math.abs(home.recentForm - away.recentForm) },
  };
}

export function probToDecimalOdds(prob: number): string {
  if (prob <= 0.01 || prob >= 0.995) return '—';
  return (1 / prob).toFixed(2);
}
export function probToAmerican(prob: number): string {
  if (prob <= 0.01 || prob >= 0.995) return '—';
  if (prob >= 0.5) return `-${Math.round((prob / (1 - prob)) * 100)}`;
  return `+${Math.round(((1 - prob) / prob) * 100)}`;
}
