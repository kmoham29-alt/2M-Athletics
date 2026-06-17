'use client';
import React, { useState } from 'react';
import { teams, sortedTeams, Team } from '@/data/teams';
import { getTeamPlayers } from '@/data/players';
import { predictMatch, probToDecimalOdds, probToAmerican, MatchPrediction } from '@/lib/predictor';

// ── Shared helpers ────────────────────────────────────────────────────────────
function Bar({ label, prob, color = 'green' }: { label: string; prob: number; color?: string }) {
  const cls: Record<string, string> = { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500', blue: 'bg-blue-500', purple: 'bg-purple-500', orange: 'bg-orange-500' };
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-[#21262d] rounded-full h-2.5">
        <div className={`${cls[color] ?? 'bg-green-500'} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, prob * 100).toFixed(1)}%` }} />
      </div>
      <span className="text-white font-semibold text-sm w-12 text-right">{(prob * 100).toFixed(1)}%</span>
    </div>
  );
}

function MarketRow({ label, prob, highlight = false }: { label: string; prob: number; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-[#21262d] last:border-0 ${highlight ? 'bg-green-900/10 -mx-1 px-1 rounded' : ''}`}>
      <span className={`text-sm ${highlight ? 'text-white font-medium' : 'text-gray-300'}`}>{label}</span>
      <div className="flex items-center gap-5">
        <span className="text-gray-400 text-sm w-12 text-right">{(prob * 100).toFixed(1)}%</span>
        <span className="text-white font-semibold w-12 text-right">{probToDecimalOdds(prob)}</span>
        <span className="text-gray-500 text-xs w-14 text-right">{probToAmerican(prob)}</span>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-gray-400 font-semibold text-xs uppercase tracking-widest mb-3">{children}</h3>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-[#161b22] border border-[#30363d] rounded-xl p-5 ${className}`}>{children}</div>;
}

function TeamSelect({ value, onChange, label }: { value: string; onChange: (t: Team) => void; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-gray-400 text-xs uppercase tracking-widest">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => { const t = teams.find(t => t.code === e.target.value); if (t) onChange(t); }}
          className="w-full bg-[#161b22] border border-[#30363d] text-white rounded-lg px-4 py-3 text-base appearance-none cursor-pointer focus:border-green-500 focus:outline-none transition-colors">
          {sortedTeams.map(t => <option key={t.code} value={t.code}>{t.flag}  {t.name} ({t.code})</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">▼</div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MatchPredictor() {
  const [homeTeam, setHomeTeam] = useState<Team>(teams.find(t => t.code === 'ENG')!);
  const [awayTeam, setAwayTeam]  = useState<Team>(teams.find(t => t.code === 'CRO')!);
  const [neutral, setNeutral]   = useState(true);
  const [stage, setStage]       = useState('Group Stage');
  const [pred, setPred]         = useState<MatchPrediction | null>(null);
  const [loading, setLoading]   = useState(false);
  const same = homeTeam.code === awayTeam.code;

  function run() {
    if (same) return;
    setLoading(true);
    setTimeout(() => {
      setPred(predictMatch(homeTeam, awayTeam, neutral, getTeamPlayers(homeTeam.code), getTeamPlayers(awayTeam.code)));
      setLoading(false);
    }, 350);
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Header */}
      <div className="border-b border-[#30363d] bg-[#0d1117]/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">World Cup 2026 · Match Predictor</h1>
            <p className="text-gray-500 text-xs">Poisson + Elo + Dixon-Coles · Goals · Corners · Cards · Goalscorers</p>
          </div>
          <span className="ml-auto bg-green-900/40 text-green-400 text-xs px-2.5 py-1 rounded-full border border-green-800/50">LIVE MODEL</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
        {/* Team picker */}
        <Card>
          <SectionTitle>Select Match</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            <TeamSelect value={homeTeam.code} onChange={setHomeTeam} label="Team 1" />
            <div className="text-center text-gray-500 font-bold text-xl py-2 md:pb-3">VS</div>
            <TeamSelect value={awayTeam.code} onChange={setAwayTeam}  label="Team 2" />
          </div>
          {same && <p className="text-red-400 text-sm text-center mt-2">Select two different teams.</p>}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs uppercase tracking-widest">Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value)} className="bg-[#0d1117] border border-[#30363d] text-white rounded-lg px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none">
                {['Group Stage','Round of 32','Round of 16','Quarter-Final','Semi-Final','Final'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs uppercase tracking-widest">Venue</label>
              <div className="flex rounded-lg overflow-hidden border border-[#30363d]">
                {([true, false] as const).map(n => (
                  <button key={String(n)} onClick={() => setNeutral(n)} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${neutral === n ? 'bg-green-600 text-white' : 'bg-[#0d1117] text-gray-400 hover:bg-[#21262d]'}`}>
                    {n ? 'Neutral' : 'Team 1 Home'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={run} disabled={same || loading} className="w-full mt-4 py-3.5 bg-green-600 hover:bg-green-500 disabled:bg-[#21262d] disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors text-sm uppercase tracking-wider">
            {loading ? 'Calculating…' : 'Predict Match'}
          </button>
        </Card>

        {pred && !loading && <>
          {/* Match header */}
          <Card>
            <div className="text-gray-500 text-xs uppercase tracking-widest mb-4">{stage} · {neutral ? 'Neutral Venue' : 'Home Fixture'}</div>
            <div className="grid grid-cols-3 items-center text-center gap-4">
              <div>
                <div className="text-4xl mb-2">{pred.homeTeam.flag}</div>
                <div className="text-white font-bold text-lg">{pred.homeTeam.name}</div>
                <div className="text-green-400 text-sm mt-1">xG {pred.homeXG.toFixed(2)}</div>
                <div className="text-gray-500 text-xs mt-0.5">Elo {pred.homeTeam.eloRating}</div>
              </div>
              <div>
                <div className="text-gray-600 text-3xl font-bold">—</div>
                <div className="text-xs mt-2 text-gray-500 uppercase tracking-wider">Predicted</div>
                <div className="text-white font-mono font-bold text-2xl mt-1">{pred.predictedScore.home} – {pred.predictedScore.away}</div>
              </div>
              <div>
                <div className="text-4xl mb-2">{pred.awayTeam.flag}</div>
                <div className="text-white font-bold text-lg">{pred.awayTeam.name}</div>
                <div className="text-blue-400 text-sm mt-1">xG {pred.awayXG.toFixed(2)}</div>
                <div className="text-gray-500 text-xs mt-0.5">Elo {pred.awayTeam.eloRating}</div>
              </div>
            </div>
          </Card>

          {/* Match result */}
          <Card>
            <SectionTitle>Match Result (1X2)</SectionTitle>
            <div className="space-y-3">
              {[
                { label: `${pred.homeTeam.flag} ${pred.homeTeam.name} Win`, prob: pred.homeWinProb, color: 'green' },
                { label: 'Draw', prob: pred.drawProb, color: 'yellow' },
                { label: `${pred.awayTeam.flag} ${pred.awayTeam.name} Win`, prob: pred.awayWinProb, color: 'blue' },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between mb-1.5 text-sm">
                    <span className="font-medium">{m.label}</span>
                    <div className="flex gap-5">
                      <span className="text-gray-400">{(m.prob*100).toFixed(1)}%</span>
                      <span className="text-white font-semibold w-10 text-right">{probToDecimalOdds(m.prob)}</span>
                      <span className="text-gray-500 text-xs self-center w-14 text-right">{probToAmerican(m.prob)}</span>
                    </div>
                  </div>
                  <div className="bg-[#21262d] rounded-full h-2.5">
                    <div className={`${m.color === 'green' ? 'bg-green-500' : m.color === 'yellow' ? 'bg-yellow-500' : 'bg-blue-500'} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${(m.prob*100).toFixed(1)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Goals + BTTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <SectionTitle>Goals Markets</SectionTitle>
              <MarketRow label="Over 1.5 Goals"  prob={pred.over15Prob} />
              <MarketRow label="Under 1.5 Goals" prob={pred.under15Prob} />
              <MarketRow label="Over 2.5 Goals"  prob={pred.over25Prob}  highlight />
              <MarketRow label="Under 2.5 Goals" prob={pred.under25Prob} highlight />
              <MarketRow label="Over 3.5 Goals"  prob={pred.over35Prob} />
              <MarketRow label="Under 3.5 Goals" prob={pred.under35Prob} />
              <MarketRow label="Over 4.5 Goals"  prob={pred.over45Prob} />
              <MarketRow label="Under 4.5 Goals" prob={pred.under45Prob} />
            </Card>
            <Card>
              <SectionTitle>Other Markets</SectionTitle>
              <MarketRow label="BTTS — Yes" prob={pred.bttsYesProb} highlight />
              <MarketRow label="BTTS — No"  prob={pred.bttsNoProb} />
              <MarketRow label={`${pred.homeTeam.name} or Draw`}  prob={pred.homeOrDrawProb} />
              <MarketRow label={`${pred.awayTeam.name} or Draw`}  prob={pred.awayOrDrawProb} />
              <MarketRow label="Either Team Wins (No Draw)" prob={pred.homeOrAwayProb} />
              <MarketRow label={`${pred.homeTeam.name} Clean Sheet`} prob={pred.homeCleanSheetProb} />
              <MarketRow label={`${pred.awayTeam.name} Clean Sheet`}  prob={pred.awayCleanSheetProb} />
              <MarketRow label={`${pred.homeTeam.name} Win to Nil`}  prob={pred.homeWinToNilProb} />
              <MarketRow label={`${pred.awayTeam.name} Win to Nil`}  prob={pred.awayWinToNilProb} />
            </Card>
          </div>

          {/* Half-time */}
          <Card>
            <SectionTitle>Half-Time Markets</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs mb-2">Half-Time Result</p>
                <MarketRow label={`${pred.homeTeam.name} HT Win`} prob={pred.htHomeWinProb} />
                <MarketRow label="HT Draw"                         prob={pred.htDrawProb} highlight />
                <MarketRow label={`${pred.awayTeam.name} HT Win`} prob={pred.htAwayWinProb} />
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-2">First-Half Goals</p>
                <MarketRow label="Over 0.5 (1H)" prob={pred.over05FirstHalfProb} highlight />
                <MarketRow label="Over 1.5 (1H)" prob={pred.over15FirstHalfProb} />
                <MarketRow label="BTTS 1H"        prob={pred.bttsFirstHalfProb} />
              </div>
            </div>
          </Card>

          {/* Asian Handicap */}
          <Card>
            <SectionTitle>Asian Handicap</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: `${pred.homeTeam.name} -1.5`, sub: 'Win by 2+', prob: pred.ahHome15Prob },
                { label: `${pred.homeTeam.name} -0.5`, sub: 'Win required', prob: pred.ahHome05Prob },
                { label: `${pred.awayTeam.name} -0.5`,  sub: 'Win required', prob: pred.ahAway05Prob },
                { label: `${pred.awayTeam.name} -1.5`,  sub: 'Win by 2+', prob: pred.ahAway15Prob },
              ].map(m => (
                <div key={m.label} className="bg-[#0d1117] rounded-lg p-3 text-center">
                  <div className="text-gray-400 text-xs mb-1 leading-tight">{m.label}</div>
                  <div className="text-white font-bold text-lg">{probToDecimalOdds(m.prob)}</div>
                  <div className="text-green-400 text-sm">{(m.prob*100).toFixed(1)}%</div>
                  <div className="text-gray-600 text-xs mt-0.5">{m.sub}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[
                { label: `${pred.homeTeam.name} 0 (Level)`, sub: 'Win or draw push', prob: pred.ahHomeLevel },
                { label: `${pred.awayTeam.name} 0 (Level)`,  sub: 'Win or draw push', prob: pred.ahAwayLevel },
              ].map(m => (
                <div key={m.label} className="bg-[#0d1117] rounded-lg p-3 text-center">
                  <div className="text-gray-400 text-xs mb-1">{m.label}</div>
                  <div className="text-white font-bold text-lg">{probToDecimalOdds(m.prob)}</div>
                  <div className="text-green-400 text-sm">{(m.prob*100).toFixed(1)}%</div>
                  <div className="text-gray-600 text-xs">{m.sub}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Correct scores */}
          <Card>
            <SectionTitle>Correct Score (Top 10)</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {pred.topScores.map((s, i) => (
                <div key={`${s.home}-${s.away}`} className={`rounded-lg p-3 text-center border ${i === 0 ? 'border-green-600 bg-green-900/20' : 'border-[#21262d] bg-[#0d1117]'}`}>
                  {i === 0 && <div className="text-green-400 text-xs mb-1">Most Likely</div>}
                  <div className={`font-bold text-lg ${i === 0 ? 'text-green-300' : 'text-white'}`}>{s.home}–{s.away}</div>
                  <div className="text-gray-400 text-sm">{(s.probability*100).toFixed(1)}%</div>
                  <div className="text-gray-500 text-xs">{probToDecimalOdds(s.probability)}x</div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Corners ── */}
          <Card>
            <SectionTitle>Corners Markets</SectionTitle>
            <div className="flex gap-6 text-sm mb-4 text-gray-400">
              <span>{pred.homeTeam.flag} <span className="text-white font-semibold">{pred.homeExpectedCorners.toFixed(1)}</span> exp.</span>
              <span>{pred.awayTeam.flag} <span className="text-white font-semibold">{pred.awayExpectedCorners.toFixed(1)}</span> exp.</span>
              <span>Total <span className="text-white font-semibold">{pred.totalExpectedCorners.toFixed(1)}</span> exp.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <p className="text-gray-500 text-xs mb-2">Total Corners</p>
                <MarketRow label="Over 7.5"  prob={pred.cornersOver75Prob} />
                <MarketRow label="Over 8.5"  prob={pred.cornersOver85Prob} />
                <MarketRow label="Over 9.5"  prob={pred.cornersOver95Prob}  highlight />
                <MarketRow label="Over 10.5" prob={pred.cornersOver105Prob} />
                <MarketRow label="Over 11.5" prob={pred.cornersOver115Prob} />
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-2">Team Corners</p>
                <MarketRow label={`${pred.homeTeam.name} Over 4.5`} prob={pred.homeCorners45Prob} highlight />
                <MarketRow label={`${pred.homeTeam.name} Under 4.5`} prob={1-pred.homeCorners45Prob} />
                <MarketRow label={`${pred.awayTeam.name} Over 3.5`}  prob={pred.awayCorners35Prob}  highlight />
                <MarketRow label={`${pred.awayTeam.name} Under 3.5`}  prob={1-pred.awayCorners35Prob} />
              </div>
            </div>
          </Card>

          {/* ── Cards ── */}
          <Card>
            <SectionTitle>Cards Markets (Yellow)</SectionTitle>
            <div className="flex gap-6 text-sm mb-4 text-gray-400">
              <span>{pred.homeTeam.flag} <span className="text-white font-semibold">{pred.homeExpectedCards.toFixed(1)}</span> exp.</span>
              <span>{pred.awayTeam.flag} <span className="text-white font-semibold">{pred.awayExpectedCards.toFixed(1)}</span> exp.</span>
              <span>Total <span className="text-white font-semibold">{pred.totalExpectedCards.toFixed(1)}</span> exp.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <p className="text-gray-500 text-xs mb-2">Total Bookings</p>
                <MarketRow label="Over 2.5 Cards" prob={pred.cardsOver25Prob} highlight />
                <MarketRow label="Under 2.5 Cards" prob={1-pred.cardsOver25Prob} />
                <MarketRow label="Over 3.5 Cards" prob={pred.cardsOver35Prob} />
                <MarketRow label="Under 3.5 Cards" prob={1-pred.cardsOver35Prob} />
                <MarketRow label="Over 4.5 Cards" prob={pred.cardsOver45Prob} />
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-2">Team Bookings</p>
                <MarketRow label={`${pred.homeTeam.name} Over 1.5`} prob={pred.homeCardsOver15Prob} />
                <MarketRow label={`${pred.homeTeam.name} Under 1.5`} prob={1-pred.homeCardsOver15Prob} />
                <MarketRow label={`${pred.awayTeam.name} Over 1.5`}  prob={pred.awayCardsOver15Prob} />
                <MarketRow label={`${pred.awayTeam.name} Under 1.5`}  prob={1-pred.awayCardsOver15Prob} />
              </div>
            </div>
          </Card>

          {/* ── Goalscorers ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { team: pred.homeTeam, scorers: pred.homeScorers },
              { team: pred.awayTeam,  scorers: pred.awayScorers },
            ].map(({ team, scorers }) => (
              <Card key={team.code}>
                <SectionTitle>{team.flag} {team.name} — Goalscorers</SectionTitle>
                <div className="space-y-1">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] text-xs text-gray-500 pb-1 border-b border-[#21262d] gap-4">
                    <span>Player</span><span className="text-right">Anytime</span><span className="text-right">Odds</span><span className="text-right">First Goal</span>
                  </div>
                  {scorers.slice(0, 5).map((s, i) => (
                    <div key={s.player.name} className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-1.5 border-b border-[#21262d] last:border-0 ${i === 0 ? 'text-white' : 'text-gray-300'}`}>
                      <div>
                        <span className="text-sm font-medium">{s.player.name}</span>
                        <span className={`ml-1.5 text-xs ${s.player.position === 'FWD' ? 'text-green-500' : s.player.position === 'MID' ? 'text-blue-400' : 'text-gray-500'}`}>{s.player.position}</span>
                      </div>
                      <span className="text-sm text-right">{(s.anytimeProb*100).toFixed(0)}%</span>
                      <span className="text-white font-semibold text-sm text-right">{probToDecimalOdds(s.anytimeProb)}</span>
                      <span className="text-gray-400 text-xs text-right">{(s.firstGoalProb*100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Model analysis */}
          <Card>
            <SectionTitle>Model Analysis</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Elo Advantage', team: pred.eloAdvantage.team, value: `+${pred.eloAdvantage.diff} pts`, color: 'text-green-400' },
                { label: 'Attack Edge', team: pred.attackAdvantage.team, value: `${((pred.attackAdvantage.ratio-1)*100).toFixed(0)}% stronger`, color: 'text-blue-400' },
                { label: 'Form Edge', team: pred.formAdvantage.team, value: `+${(pred.formAdvantage.diff*100).toFixed(0)}% pts won`, color: 'text-yellow-400' },
              ].map(f => (
                <div key={f.label} className="bg-[#0d1117] rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">{f.label}</div>
                  <div className="text-white font-semibold">{f.team}</div>
                  <div className={`${f.color} text-sm`}>{f.value}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Model Confidence</span>
                <span className={`font-semibold ${pred.confidenceScore >= 75 ? 'text-green-400' : pred.confidenceScore >= 55 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {pred.confidenceScore >= 75 ? 'High' : pred.confidenceScore >= 55 ? 'Medium' : 'Low'} · {pred.confidenceScore}%
                </span>
              </div>
              <div className="bg-[#21262d] rounded-full h-2">
                <div className={`${pred.confidenceScore >= 75 ? 'bg-green-500' : pred.confidenceScore >= 55 ? 'bg-yellow-500' : 'bg-red-500'} h-2 rounded-full transition-all duration-700`} style={{ width: `${pred.confidenceScore}%` }} />
              </div>
            </div>
          </Card>

          <p className="text-gray-600 text-xs text-center pb-6">Predictions are generated by a Poisson + Elo + Dixon-Coles statistical model. For informational purposes only. Please gamble responsibly.</p>
        </>}
      </div>
    </div>
  );
}
