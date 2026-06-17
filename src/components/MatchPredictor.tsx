'use client';

import React, { useState, useMemo } from 'react';
import { teams, sortedTeams, Team } from '@/data/teams';
import { predictMatch, probToDecimalOdds, probToAmerican, MatchPrediction } from '@/lib/predictor';

function ProbBar({ label, prob, color = 'green' }: { label: string; prob: number; color?: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };
  const pct = (prob * 100).toFixed(1);
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-[#21262d] rounded-full h-2.5">
        <div
          className={`${colorMap[color] ?? 'bg-green-500'} h-2.5 rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-white font-semibold text-sm w-12 text-right">{pct}%</span>
    </div>
  );
}

function OddsCell({ prob }: { prob: number }) {
  const dec = probToDecimalOdds(prob);
  const am = probToAmerican(prob);
  return (
    <div className="text-right">
      <div className="text-white font-semibold">{dec}</div>
      <div className="text-gray-500 text-xs">{am}</div>
    </div>
  );
}

function MarketRow({ label, prob, bold = false }: { label: string; prob: number; bold?: boolean }) {
  const pct = (prob * 100).toFixed(1);
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-[#21262d] last:border-0 ${bold ? 'font-semibold' : ''}`}>
      <span className={`text-sm ${bold ? 'text-white' : 'text-gray-300'}`}>{label}</span>
      <div className="flex items-center gap-6">
        <span className="text-gray-400 text-sm">{pct}%</span>
        <OddsCell prob={prob} />
      </div>
    </div>
  );
}

function TeamSelect({ value, onChange, label }: { value: string; onChange: (t: Team) => void; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-gray-400 text-xs uppercase tracking-widest">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => {
            const t = teams.find((t) => t.code === e.target.value);
            if (t) onChange(t);
          }}
          className="w-full bg-[#161b22] border border-[#30363d] text-white rounded-lg px-4 py-3 text-base appearance-none cursor-pointer focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
        >
          {sortedTeams.map((t) => (
            <option key={t.code} value={t.code}>
              {t.flag}  {t.name} ({t.code})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
          ▼
        </div>
      </div>
    </div>
  );
}

function ConfidenceMeter({ score }: { score: number }) {
  const color = score >= 75 ? 'bg-green-500' : score >= 55 ? 'bg-yellow-500' : 'bg-red-500';
  const label = score >= 75 ? 'High' : score >= 55 ? 'Medium' : 'Low';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Model Confidence</span>
        <span className={`font-semibold ${score >= 75 ? 'text-green-400' : score >= 55 ? 'text-yellow-400' : 'text-red-400'}`}>
          {label} · {score}%
        </span>
      </div>
      <div className="bg-[#21262d] rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function MatchPredictor() {
  const [homeTeam, setHomeTeam] = useState<Team>(teams.find((t) => t.code === 'FRA')!);
  const [awayTeam, setAwayTeam] = useState<Team>(teams.find((t) => t.code === 'BRA')!);
  const [neutralVenue, setNeutralVenue] = useState(true);
  const [stage, setStage] = useState('Group Stage');
  const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  const sameTeam = homeTeam.code === awayTeam.code;

  function handlePredict() {
    if (sameTeam) return;
    setLoading(true);
    setTimeout(() => {
      setPrediction(predictMatch(homeTeam, awayTeam, neutralVenue));
      setLoading(false);
    }, 400);
  }

  const topBet = useMemo(() => {
    if (!prediction) return null;
    const markets = [
      { label: `${prediction.homeTeam.name} Win`, prob: prediction.homeWinProb },
      { label: 'Draw', prob: prediction.drawProb },
      { label: `${prediction.awayTeam.name} Win`, prob: prediction.awayWinProb },
      { label: 'Over 2.5', prob: prediction.over25Prob },
      { label: 'Under 2.5', prob: prediction.under25Prob },
      { label: 'BTTS Yes', prob: prediction.bttsYesProb },
    ];
    return markets.sort((a, b) => b.prob - a.prob)[0];
  }, [prediction]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* ── Header ── */}
      <div className="border-b border-[#30363d] bg-[#0d1117]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">World Cup 2026 · Match Predictor</h1>
            <p className="text-gray-500 text-xs">Poisson + Elo Model · 48 Qualified Nations</p>
          </div>
          <div className="ml-auto">
            <span className="bg-green-900/40 text-green-400 text-xs px-2.5 py-1 rounded-full border border-green-800/50">
              LIVE MODEL
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* ── Team Selection Card ── */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest text-gray-400">Select Match</h2>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            <TeamSelect value={homeTeam.code} onChange={setHomeTeam} label="Team 1" />
            <div className="text-center text-gray-500 font-bold text-xl py-2 md:pb-3">VS</div>
            <TeamSelect value={awayTeam.code} onChange={setAwayTeam} label="Team 2" />
          </div>

          {sameTeam && (
            <p className="text-red-400 text-sm text-center">Please select two different teams.</p>
          )}

          {/* Context */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs uppercase tracking-widest">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="bg-[#0d1117] border border-[#30363d] text-white rounded-lg px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none"
              >
                {['Group Stage', 'Round of 32', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs uppercase tracking-widest">Venue</label>
              <div className="flex rounded-lg overflow-hidden border border-[#30363d]">
                {[true, false].map((neutral) => (
                  <button
                    key={String(neutral)}
                    onClick={() => setNeutralVenue(neutral)}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${neutralVenue === neutral ? 'bg-green-600 text-white' : 'bg-[#0d1117] text-gray-400 hover:bg-[#21262d]'}`}
                  >
                    {neutral ? 'Neutral' : 'Team 1 Home'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={sameTeam || loading}
            className="w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:bg-[#21262d] disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors text-sm uppercase tracking-wider"
          >
            {loading ? 'Calculating...' : 'Predict Match'}
          </button>
        </div>

        {/* ── Results ── */}
        {prediction && !loading && (
          <>
            {/* Match Header */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs uppercase tracking-widest">{stage} · {neutralVenue ? 'Neutral Venue' : 'Home Fixture'}</span>
              </div>
              <div className="grid grid-cols-3 items-center text-center gap-4 mt-4">
                <div>
                  <div className="text-4xl mb-2">{prediction.homeTeam.flag}</div>
                  <div className="text-white font-bold text-lg">{prediction.homeTeam.name}</div>
                  <div className="text-green-400 text-sm mt-1">xG {prediction.homeXG.toFixed(2)}</div>
                  <div className="text-gray-500 text-xs mt-0.5">Elo {prediction.homeTeam.eloRating}</div>
                </div>
                <div className="text-gray-500">
                  <div className="text-4xl font-bold text-gray-600">—</div>
                  <div className="text-xs mt-2 text-gray-500">PREDICTED</div>
                  <div className="text-white font-mono font-bold text-xl mt-1">
                    {prediction.predictedScore.home} – {prediction.predictedScore.away}
                  </div>
                </div>
                <div>
                  <div className="text-4xl mb-2">{prediction.awayTeam.flag}</div>
                  <div className="text-white font-bold text-lg">{prediction.awayTeam.name}</div>
                  <div className="text-blue-400 text-sm mt-1">xG {prediction.awayXG.toFixed(2)}</div>
                  <div className="text-gray-500 text-xs mt-0.5">Elo {prediction.awayTeam.eloRating}</div>
                </div>
              </div>
            </div>

            {/* Top Value Bet */}
            {topBet && (
              <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4 flex items-center gap-4">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="text-yellow-400 text-xs uppercase tracking-widest font-semibold">Top Probability Market</div>
                  <div className="text-white font-bold text-lg mt-0.5">{topBet.label}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-yellow-300 font-bold text-xl">{(topBet.prob * 100).toFixed(1)}%</div>
                  <div className="text-yellow-500 text-sm">{probToDecimalOdds(topBet.prob)}x</div>
                </div>
              </div>
            )}

            {/* Match Result */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-widest text-gray-400">Match Result (1X2)</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium">{prediction.homeTeam.flag} {prediction.homeTeam.name} Win</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400">{(prediction.homeWinProb * 100).toFixed(1)}%</span>
                      <span className="text-white font-semibold">{probToDecimalOdds(prediction.homeWinProb)}</span>
                      <span className="text-gray-500 text-xs self-center">{probToAmerican(prediction.homeWinProb)}</span>
                    </div>
                  </div>
                  <div className="bg-[#21262d] rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${prediction.homeWinProb * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium">Draw</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400">{(prediction.drawProb * 100).toFixed(1)}%</span>
                      <span className="text-white font-semibold">{probToDecimalOdds(prediction.drawProb)}</span>
                      <span className="text-gray-500 text-xs self-center">{probToAmerican(prediction.drawProb)}</span>
                    </div>
                  </div>
                  <div className="bg-[#21262d] rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${prediction.drawProb * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium">{prediction.awayTeam.flag} {prediction.awayTeam.name} Win</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400">{(prediction.awayWinProb * 100).toFixed(1)}%</span>
                      <span className="text-white font-semibold">{probToDecimalOdds(prediction.awayWinProb)}</span>
                      <span className="text-gray-500 text-xs self-center">{probToAmerican(prediction.awayWinProb)}</span>
                    </div>
                  </div>
                  <div className="bg-[#21262d] rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${prediction.awayWinProb * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Goals + BTTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                <h3 className="text-gray-400 font-semibold text-xs uppercase tracking-widest mb-3">Goals Markets</h3>
                <div className="divide-y divide-[#21262d]">
                  <MarketRow label="Over 1.5 Goals" prob={prediction.over15Prob} />
                  <MarketRow label="Under 1.5 Goals" prob={prediction.under15Prob} />
                  <MarketRow label="Over 2.5 Goals" prob={prediction.over25Prob} bold />
                  <MarketRow label="Under 2.5 Goals" prob={prediction.under25Prob} bold />
                  <MarketRow label="Over 3.5 Goals" prob={prediction.over35Prob} />
                  <MarketRow label="Under 3.5 Goals" prob={prediction.under35Prob} />
                </div>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                <h3 className="text-gray-400 font-semibold text-xs uppercase tracking-widest mb-3">Other Markets</h3>
                <div className="divide-y divide-[#21262d]">
                  <MarketRow label="BTTS — Yes" prob={prediction.bttsYesProb} bold />
                  <MarketRow label="BTTS — No" prob={prediction.bttsNoProb} />
                  <MarketRow label={`Double: ${prediction.homeTeam.name} or Draw`} prob={prediction.homeOrDrawProb} />
                  <MarketRow label={`Double: ${prediction.awayTeam.name} or Draw`} prob={prediction.awayOrDrawProb} />
                  <MarketRow label="Double: Either Win (No Draw)" prob={prediction.homeOrAwayProb} />
                </div>
              </div>
            </div>

            {/* Asian Handicap */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
              <h3 className="text-gray-400 font-semibold text-xs uppercase tracking-widest mb-3">Asian Handicap</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: `${prediction.homeTeam.name} -0.5`, prob: prediction.ahHome05Prob, sublabel: '(Win required)' },
                  { label: `${prediction.homeTeam.name} 0`, prob: prediction.ahHomeLevel, sublabel: '(Win or draw push)' },
                  { label: `${prediction.awayTeam.name} 0`, prob: prediction.ahAwayLevel, sublabel: '(Win or draw push)' },
                  { label: `${prediction.awayTeam.name} -0.5`, prob: prediction.ahAway05Prob, sublabel: '(Win required)' },
                ].map((m) => (
                  <div key={m.label} className="bg-[#0d1117] rounded-lg p-3 text-center">
                    <div className="text-gray-400 text-xs mb-1 leading-tight">{m.label}</div>
                    <div className="text-white font-bold text-lg">{probToDecimalOdds(m.prob)}</div>
                    <div className="text-green-400 text-sm">{(m.prob * 100).toFixed(1)}%</div>
                    <div className="text-gray-600 text-xs mt-0.5">{m.sublabel}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correct Scores */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
              <h3 className="text-gray-400 font-semibold text-xs uppercase tracking-widest mb-3">Correct Score (Top 10)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {prediction.topScores.map((s, i) => {
                  const pct = (s.probability * 100).toFixed(1);
                  const isFirst = i === 0;
                  return (
                    <div
                      key={`${s.home}-${s.away}`}
                      className={`rounded-lg p-3 text-center border ${isFirst ? 'border-green-600 bg-green-900/20' : 'border-[#21262d] bg-[#0d1117]'}`}
                    >
                      {isFirst && <div className="text-green-400 text-xs mb-1">Most Likely</div>}
                      <div className={`font-bold text-lg ${isFirst ? 'text-green-300' : 'text-white'}`}>
                        {s.home} – {s.away}
                      </div>
                      <div className="text-gray-400 text-sm">{pct}%</div>
                      <div className="text-gray-500 text-xs">{probToDecimalOdds(s.probability)}x</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Factors + Confidence */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
              <h3 className="text-gray-400 font-semibold text-xs uppercase tracking-widest">Model Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0d1117] rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">Elo Advantage</div>
                  <div className="text-white font-semibold">{prediction.eloAdvantage.team}</div>
                  <div className="text-green-400 text-sm">+{prediction.eloAdvantage.diff} pts</div>
                </div>
                <div className="bg-[#0d1117] rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">Attack Edge</div>
                  <div className="text-white font-semibold">{prediction.attackAdvantage.team}</div>
                  <div className="text-blue-400 text-sm">{((prediction.attackAdvantage.ratio - 1) * 100).toFixed(0)}% stronger</div>
                </div>
                <div className="bg-[#0d1117] rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">Form Advantage</div>
                  <div className="text-white font-semibold">{prediction.formAdvantage.team}</div>
                  <div className="text-yellow-400 text-sm">+{(prediction.formAdvantage.diff * 100).toFixed(0)}% pts won</div>
                </div>
              </div>
              <ConfidenceMeter score={prediction.confidenceScore} />
            </div>

            {/* Disclaimer */}
            <p className="text-gray-600 text-xs text-center pb-4">
              Predictions are generated by a Poisson + Elo statistical model using historical World Cup data, FIFA rankings, and recent form.
              They are for informational purposes only. Please gamble responsibly.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
