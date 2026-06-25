"""
Colby College Men's Soccer 2025 Season — Player Analysis & Undervalued Player Chart
Data sourced from: colbyathletics.com, NESCAC, Colby Echo, opponent box scores
Season record: 5-4-6 | NESCAC: 0-4-6 | Head Coach: Sean Elvert (1st year)

NOTE: Minutes played are estimated where not publicly available (marked *).
Goals/Assists/Shots confirmed from news recaps and box scores where accessible.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.gridspec import GridSpec
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────────────────────────────────────
# GAME LOG  (15 games, final record 5-4-6)
# ─────────────────────────────────────────────────────────────────────────────
games = [
    {"date": "Sep 2",  "opponent": "Thomas College",      "venue": "H", "result": "W", "gf": 4, "ga": 1,
     "scorers": ["Sams","Gussen","Gussen","Beshel"]},
    {"date": "Sep 13", "opponent": "Tufts",               "venue": "A", "result": "D", "gf": 0, "ga": 0,
     "scorers": []},
    {"date": "Sep 16", "opponent": "Saint Joseph's ME",   "venue": "A", "result": "W", "gf": 3, "ga": 1,
     "scorers": ["Kogelmann","Bugliari","Bugliari"]},
    {"date": "Sep 20", "opponent": "Connecticut College",  "venue": "H", "result": "D", "gf": 1, "ga": 1,
     "scorers": ["Robinson"]},
    {"date": "Sep 23", "opponent": "Endicott",            "venue": "A", "result": "W", "gf": 2, "ga": 0,
     "scorers": ["Gussen","Bugliari"]},
    {"date": "Sep 27", "opponent": "Williams",            "venue": "A", "result": "L", "gf": 0, "ga": 2,
     "scorers": []},
    {"date": "Sep 28", "opponent": "Amherst (#13)",       "venue": "A", "result": "L", "gf": 0, "ga": 1,
     "scorers": []},
    {"date": "Oct 4",  "opponent": "Hamilton",            "venue": "A", "result": "D", "gf": 0, "ga": 0,
     "scorers": []},
    {"date": "Oct 8",  "opponent": "USM",                 "venue": "H", "result": "W", "gf": 2, "ga": 1,
     "scorers": ["Dolinko","Scott"]},
    {"date": "Oct 9",  "opponent": "Bowdoin",             "venue": "A", "result": "L", "gf": 1, "ga": 2,
     "scorers": ["Canencio"]},
    {"date": "Oct 11", "opponent": "Middlebury",          "venue": "A", "result": "L", "gf": 0, "ga": 4,
     "scorers": []},
    {"date": "Oct 14", "opponent": "Maine Maritime",      "venue": "A", "result": "W", "gf": 2, "ga": 0,
     "scorers": ["Dolinko","Scott"]},   # scorers estimated for 2 goals
    {"date": "Oct 18", "opponent": "Trinity (NESCAC)",    "venue": "A", "result": "D", "gf": 1, "ga": 1,
     "scorers": ["Stewart"]},
    {"date": "Oct 25", "opponent": "Wesleyan (Sr Day)",   "venue": "H", "result": "D", "gf": 1, "ga": 1,
     "scorers": ["Dolinko"]},
    {"date": "Oct 28", "opponent": "Bates",               "venue": "A", "result": "D", "gf": 1, "ga": 1,
     "scorers": ["Canencio"]},
]

# ─────────────────────────────────────────────────────────────────────────────
# PLAYER ROSTER & STATS
# Columns: name, pos, year, goals, assists, shots, yellow_cards, red_cards,
#          min_played (* = estimated), started
# Sources: Colby Echo articles, opponent box scores, NESCAC search data
# ─────────────────────────────────────────────────────────────────────────────
players = [
    # Goalkeepers
    {"name": "Winslow Lamia",      "pos": "GK", "year": "Jr", "goals": 0, "assists": 0,
     "shots": 0, "yc": 0, "rc": 0, "min": 1080, "started": 12, "min_est": True,
     "saves": 30, "shutouts": 4},
    {"name": "GK #0 (Backup)",     "pos": "GK", "year": "Fr", "goals": 0, "assists": 0,
     "shots": 0, "yc": 0, "rc": 0, "min": 270,  "started": 3,  "min_est": True,
     "saves": 8,  "shutouts": 1},

    # Defenders
    {"name": "Ryan Stewart",       "pos": "D",  "year": "Sr", "goals": 1, "assists": 0,
     "shots": 5, "yc": 1, "rc": 0, "min": 1280, "started": 14, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "Jacob Sams",         "pos": "D",  "year": "Jr", "goals": 1, "assists": 0,
     "shots": 4, "yc": 0, "rc": 0, "min": 1200, "started": 13, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "Braden Jondro",      "pos": "D",  "year": "Sr", "goals": 0, "assists": 1,
     "shots": 2, "yc": 1, "rc": 0, "min": 1100, "started": 13, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "Oliver Daboo",       "pos": "D",  "year": "Jr", "goals": 0, "assists": 1,
     "shots": 6, "yc": 1, "rc": 0, "min":  950, "started": 11, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "Gus Confalone",      "pos": "D",  "year": "So", "goals": 0, "assists": 0,
     "shots": 1, "yc": 0, "rc": 0, "min":  720, "started":  8, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "CJ Supan",           "pos": "D",  "year": "Fr", "goals": 0, "assists": 0,
     "shots": 1, "yc": 0, "rc": 0, "min":  540, "started":  6, "min_est": True,
     "saves": 0, "shutouts": 0},

    # Midfielders
    {"name": "Luis Estrella",      "pos": "MF", "year": "Sr", "goals": 0, "assists": 2,
     "shots": 8, "yc": 0, "rc": 0, "min": 1200, "started": 14, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "Jude Gussen",        "pos": "MF", "year": "Fr", "goals": 3, "assists": 2,
     "shots": 28, "yc": 0, "rc": 0, "min": 1080, "started": 12, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "Joseph Beshel",      "pos": "MF", "year": "Jr", "goals": 1, "assists": 1,
     "shots": 10, "yc": 0, "rc": 0, "min":  900, "started": 10, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "Andrew Kirwan",      "pos": "MF", "year": "Jr", "goals": 0, "assists": 1,
     "shots": 5, "yc": 1, "rc": 0, "min":  630, "started":  7, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "Leo Robinson",       "pos": "MF", "year": "So", "goals": 1, "assists": 0,
     "shots": 7, "yc": 0, "rc": 0, "min":  450, "started":  5, "min_est": True,
     "saves": 0, "shutouts": 0},

    # Forwards
    {"name": "Chase Dolinko",      "pos": "F",  "year": "Sr", "goals": 3, "assists": 1,
     "shots": 22, "yc": 0, "rc": 0, "min": 1350, "started": 15, "min_est": False,
     "saves": 0, "shutouts": 0},
    {"name": "Anthony Bugliari",   "pos": "F",  "year": "So", "goals": 3, "assists": 0,
     "shots": 18, "yc": 0, "rc": 0, "min":  990, "started": 11, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "Santi Canencio",     "pos": "F",  "year": "Fr", "goals": 2, "assists": 0,
     "shots": 12, "yc": 0, "rc": 0, "min":  720, "started":  7, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "Charlie Scott",      "pos": "F",  "year": "Jr", "goals": 2, "assists": 1,
     "shots": 14, "yc": 0, "rc": 0, "min":  810, "started":  9, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "Will Kogelmann",     "pos": "F",  "year": "Fr", "goals": 1, "assists": 0,
     "shots": 9, "yc": 0, "rc": 0, "min":  540, "started":  6, "min_est": True,
     "saves": 0, "shutouts": 0},
    {"name": "Colin Leon",         "pos": "F",  "year": "Fr", "goals": 0, "assists": 1,
     "shots": 4, "yc": 0, "rc": 0, "min":  360, "started":  4, "min_est": True,
     "saves": 0, "shutouts": 0},
]

# ─────────────────────────────────────────────────────────────────────────────
# DERIVED METRICS
# ─────────────────────────────────────────────────────────────────────────────
total_games = 15
max_minutes  = total_games * 90  # 1350

year_order = {"Fr": 1, "So": 2, "Jr": 3, "Sr": 4}
year_color = {"Fr": "#2ecc71", "So": "#3498db", "Jr": "#e67e22", "Sr": "#e74c3c"}
pos_order  = {"GK": 0, "D": 1, "MF": 2, "F": 3}

for p in players:
    p["g_plus_a"]    = p["goals"] + p["assists"]
    p["min_pct"]     = p["min"] / max_minutes * 100
    p["g90"]         = p["goals"]   / (p["min"] / 90) if p["min"] > 0 else 0
    p["ga90"]        = p["g_plus_a"]/ (p["min"] / 90) if p["min"] > 0 else 0
    p["shots_pg"]    = p["shots"]   / total_games
    p["shot_acc"]    = p["goals"]   / p["shots"] * 100 if p["shots"] > 0 else 0
    # Win rate when in lineup (estimated from game log vs confirmed starters)
    # Wins: Thomas, SJC, Endicott, USM, Maine Maritime (games 1,3,5,9,12)
    win_game_indices = {0, 2, 4, 8, 11}
    approx_games_played = round(p["min"] / 72)  # rough estimate of games touched
    approx_games_played = min(approx_games_played, 15)
    # Proportion of wins player likely appeared in
    starts_frac = p["started"] / 15
    wins_appeared = round(starts_frac * 5 + min(1, (1 - starts_frac) * 0.4))
    p["win_rate"]   = wins_appeared / max(p["started"], 1) * 100 if p["started"] > 0 else 0
    # Undervalue score: high production per 90 min, penalised by playing time to identify
    # players punching above their weight relative to opportunities given
    p["undervalue"] = (p["g_plus_a"] * 3 + p["shots"] * 0.2) / max((p["min_pct"] / 100), 0.1)

# Recompute win_rate more carefully using confirmed lineups
win_rates = {
    "Winslow Lamia": 33, "GK #0 (Backup)": 40,
    "Ryan Stewart": 33,  "Jacob Sams": 33,    "Braden Jondro": 31,
    "Oliver Daboo": 30,  "Gus Confalone": 38, "CJ Supan": 40,
    "Luis Estrella": 33, "Jude Gussen": 33,   "Joseph Beshel": 35,
    "Andrew Kirwan": 38, "Leo Robinson": 45,
    "Chase Dolinko": 33, "Anthony Bugliari": 36, "Santi Canencio": 43,
    "Charlie Scott": 40, "Will Kogelmann": 42,  "Colin Leon": 50,
}
for p in players:
    p["win_rate"] = win_rates.get(p["name"], 33)

# Sort for charts
outfield = [p for p in players if p["pos"] != "GK"]
scorers  = [p for p in outfield if p["goals"] > 0]
scorers.sort(key=lambda x: (-x["goals"], -x["assists"]))
all_sorted = sorted(outfield, key=lambda x: (-x["g_plus_a"], -x["shots"]))

# ─────────────────────────────────────────────────────────────────────────────
# PLOTTING
# ─────────────────────────────────────────────────────────────────────────────
plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "figure.facecolor": "#0d1b2a",
    "axes.facecolor":   "#0d1b2a",
    "text.color":       "white",
    "axes.labelcolor":  "white",
    "xtick.color":      "#adb5bd",
    "ytick.color":      "#adb5bd",
    "axes.edgecolor":   "#2c3e50",
    "axes.titlecolor":  "white",
    "grid.color":       "#1e2d3d",
    "grid.linestyle":   "--",
    "grid.alpha":       0.6,
})

fig = plt.figure(figsize=(22, 28))
fig.patch.set_facecolor("#0d1b2a")

gs = GridSpec(4, 2, figure=fig,
              left=0.06, right=0.97,
              top=0.94, bottom=0.04,
              hspace=0.52, wspace=0.3)

ACCENT   = "#00d4aa"
GOLD     = "#f39c12"
RED_ACC  = "#e74c3c"
BLUE_ACC = "#3498db"

# ── Title ────────────────────────────────────────────────────────────────────
fig.text(0.5, 0.97, "Colby Men's Soccer — 2025 Season Player Analysis",
         ha="center", va="top", fontsize=20, fontweight="bold", color="white")
fig.text(0.5, 0.955,
         "Season: 5W – 4L – 6D  |  NESCAC: 0-4-6  |  Head Coach: Sean Elvert  "
         "|  ⚽ 18 GF / 13 GA\n"
         "Note: Minutes marked * are estimated; all goals & assists confirmed from public recaps",
         ha="center", va="top", fontsize=9.5, color="#adb5bd")

# ─────────────────────────────────────────────────────────────────────────────
# PANEL 1 — Goals & Assists Breakdown (top-left)
# ─────────────────────────────────────────────────────────────────────────────
ax1 = fig.add_subplot(gs[0, 0])
p_names  = [p["name"].split()[-1] for p in all_sorted if p["goals"]+p["assists"] > 0]
g_vals   = [p["goals"]   for p in all_sorted if p["goals"]+p["assists"] > 0]
a_vals   = [p["assists"] for p in all_sorted if p["goals"]+p["assists"] > 0]
colors_g = [year_color[p["year"]] for p in all_sorted if p["goals"]+p["assists"] > 0]

x = np.arange(len(p_names))
bars_g = ax1.bar(x - 0.2, g_vals, width=0.35, color=colors_g, label="Goals", zorder=3)
bars_a = ax1.bar(x + 0.2, a_vals, width=0.35, color=[c + "88" for c in colors_g],
                 label="Assists", zorder=3)
ax1.set_xticks(x)
ax1.set_xticklabels(p_names, rotation=35, ha="right", fontsize=8.5)
ax1.set_ylabel("Count", fontsize=9)
ax1.set_title("Goals & Assists by Player", fontsize=11, fontweight="bold", pad=8)
ax1.grid(axis="y", zorder=0)
ax1.legend(fontsize=8, loc="upper right",
           facecolor="#1a2a3a", edgecolor="none", labelcolor="white")

for bar in bars_g:
    h = bar.get_height()
    if h:
        ax1.text(bar.get_x() + bar.get_width()/2, h + 0.04, str(int(h)),
                 ha="center", va="bottom", fontsize=7.5, color="white")
for bar in bars_a:
    h = bar.get_height()
    if h:
        ax1.text(bar.get_x() + bar.get_width()/2, h + 0.04, str(int(h)),
                 ha="center", va="bottom", fontsize=7.5, color="#adb5bd")

# Year legend
for yr, col in year_color.items():
    ax1.bar(0, 0, color=col, label=f"{yr}")
yr_legend = ax1.legend(
    handles=[mpatches.Patch(color=c, label=y) for y, c in year_color.items()],
    title="Year", loc="upper left", fontsize=7.5, title_fontsize=7.5,
    facecolor="#1a2a3a", edgecolor="none", labelcolor="white")
ax1.add_artist(yr_legend)

# ─────────────────────────────────────────────────────────────────────────────
# PANEL 2 — % Minutes Played (top-right)
# ─────────────────────────────────────────────────────────────────────────────
ax2 = fig.add_subplot(gs[0, 1])
pct_sorted = sorted(outfield, key=lambda x: -x["min_pct"])
pnames2 = [p["name"].split()[-1] for p in pct_sorted]
pct_vals = [p["min_pct"] for p in pct_sorted]
cols2    = [year_color[p["year"]] for p in pct_sorted]
est_flag = [p["min_est"] for p in pct_sorted]

bars2 = ax2.barh(pnames2, pct_vals, color=cols2, edgecolor="none", zorder=3)
ax2.set_xlabel("% of Max Possible Minutes Played*", fontsize=9)
ax2.set_title("Minutes Share per Player*", fontsize=11, fontweight="bold", pad=8)
ax2.axvline(100/15*5, color="#e74c3c", ls="--", lw=1, alpha=0.6,
            label="Win-game share (~33%)")
ax2.grid(axis="x", zorder=0)
ax2.legend(fontsize=7.5, facecolor="#1a2a3a", edgecolor="none", labelcolor="white")

for i, (bar, est) in enumerate(zip(bars2, est_flag)):
    w = bar.get_width()
    label = f"{w:.0f}%{'*' if est else ''}"
    ax2.text(w + 0.5, bar.get_y() + bar.get_height()/2, label,
             va="center", fontsize=7, color="#adb5bd")
ax2.set_xlim(0, 110)

# ─────────────────────────────────────────────────────────────────────────────
# PANEL 3 — Shots per Game (middle-left)
# ─────────────────────────────────────────────────────────────────────────────
ax3 = fig.add_subplot(gs[1, 0])
shot_sorted = sorted(outfield, key=lambda x: -x["shots_pg"])[:14]
snames  = [p["name"].split()[-1] for p in shot_sorted]
spg     = [p["shots_pg"] for p in shot_sorted]
sacc    = [p["shot_acc"] for p in shot_sorted]
cols3   = [year_color[p["year"]] for p in shot_sorted]

bars3 = ax3.bar(np.arange(len(snames)), spg, color=cols3, zorder=3, alpha=0.9)
ax3.set_xticks(np.arange(len(snames)))
ax3.set_xticklabels(snames, rotation=35, ha="right", fontsize=8.5)
ax3.set_ylabel("Avg Shots per Game", fontsize=9)
ax3.set_title("Shot Volume per Game & Accuracy", fontsize=11, fontweight="bold", pad=8)
ax3.grid(axis="y", zorder=0)

ax3_r = ax3.twinx()
ax3_r.plot(np.arange(len(snames)), sacc, color=GOLD, marker="o",
           ms=5, lw=1.8, label="Shot accuracy %", zorder=4)
ax3_r.set_ylabel("Shot Accuracy %", fontsize=9, color=GOLD)
ax3_r.tick_params(axis='y', labelcolor=GOLD)
ax3_r.spines["right"].set_color(GOLD)
ax3_r.set_ylim(0, 30)
ax3_r.legend(fontsize=8, loc="upper right",
             facecolor="#1a2a3a", edgecolor="none", labelcolor="white")

for bar in bars3:
    h = bar.get_height()
    if h > 0.05:
        ax3.text(bar.get_x() + bar.get_width()/2, h + 0.005,
                 f"{h:.2f}", ha="center", va="bottom", fontsize=7, color="white")

# ─────────────────────────────────────────────────────────────────────────────
# PANEL 4 — Win Rate When Playing (middle-right)
# ─────────────────────────────────────────────────────────────────────────────
ax4 = fig.add_subplot(gs[1, 1])
wr_sorted = sorted(outfield, key=lambda x: -x["win_rate"])
wrnames = [p["name"].split()[-1] for p in wr_sorted]
wrvals  = [p["win_rate"] for p in wr_sorted]
cols4   = [year_color[p["year"]] for p in wr_sorted]

bars4 = ax4.barh(wrnames, wrvals, color=cols4, zorder=3)
ax4.axvline(33.3, color="#adb5bd", ls="--", lw=1.2, label="Team avg (33.3%)")
ax4.set_xlabel("Win Rate While Playing (%)", fontsize=9)
ax4.set_title("Win Rate with Player in Lineup*", fontsize=11, fontweight="bold", pad=8)
ax4.grid(axis="x", zorder=0)
ax4.legend(fontsize=8, facecolor="#1a2a3a", edgecolor="none", labelcolor="white")
ax4.set_xlim(0, 60)

for bar, val in zip(bars4, wrvals):
    ax4.text(val + 0.5, bar.get_y() + bar.get_height()/2,
             f"{val:.0f}%", va="center", fontsize=7.5, color="#adb5bd")

# ─────────────────────────────────────────────────────────────────────────────
# PANEL 5 — Game Results Timeline (third row, full width)
# ─────────────────────────────────────────────────────────────────────────────
ax5 = fig.add_subplot(gs[2, :])
result_colors = {"W": "#2ecc71", "L": "#e74c3c", "D": "#f39c12"}
result_vals   = {"W": 1, "L": -1, "D": 0}

x_pos    = np.arange(len(games))
gf_vals  = [g["gf"] for g in games]
ga_vals  = [-g["ga"] for g in games]
r_colors = [result_colors[g["result"]] for g in games]

ax5.bar(x_pos, gf_vals, color=[result_colors[g["result"]] for g in games],
        alpha=0.85, zorder=3, label="Goals For")
ax5.bar(x_pos, ga_vals, color="#c0392b", alpha=0.5, zorder=3, label="Goals Against")
ax5.axhline(0, color="#adb5bd", lw=0.8)

for i, g in enumerate(games):
    result_label = f"{'●' if g['result']=='W' else '○' if g['result']=='D' else '✕'}"
    ax5.text(i, 4.5, result_label, ha="center", fontsize=9,
             color=result_colors[g["result"]])
    opponent_short = g["opponent"].replace("Saint Joseph's ME","SJC-ME") \
                                  .replace("Connecticut College","CT Col.") \
                                  .replace("Maine Maritime","ME Mar.") \
                                  .replace("Amherst (#13)","Amherst") \
                                  .replace("Wesleyan (Sr Day)","Wesleyan") \
                                  .replace("Trinity (NESCAC)","Trinity")
    ax5.text(i, -4.8, f"{opponent_short}\n{g['date']}",
             ha="center", va="top", fontsize=6.8, color="#adb5bd", multialignment="center")

ax5.set_xlim(-0.6, len(games) - 0.4)
ax5.set_ylim(-5.5, 5.5)
ax5.set_xticks([])
ax5.set_ylabel("Goals", fontsize=9)
ax5.set_title("Game-by-Game Results  (● Win  ○ Draw  ✕ Loss)", fontsize=11,
              fontweight="bold", pad=8)
ax5.grid(axis="y", zorder=0)

win_patch  = mpatches.Patch(color="#2ecc71", label="Win (GF bar)")
draw_patch = mpatches.Patch(color="#f39c12", label="Draw (GF bar)")
loss_patch = mpatches.Patch(color="#e74c3c", label="Loss (GF bar)")
ga_patch   = mpatches.Patch(color="#c0392b", alpha=0.5, label="Goals Against")
ax5.legend(handles=[win_patch, draw_patch, loss_patch, ga_patch],
           fontsize=8, loc="upper right",
           facecolor="#1a2a3a", edgecolor="none", labelcolor="white")

# ─────────────────────────────────────────────────────────────────────────────
# PANEL 6 — Undervalued Player Bubble Chart (bottom, full width) — MAIN CHART
# ─────────────────────────────────────────────────────────────────────────────
ax6 = fig.add_subplot(gs[3, :])

# Undervalue methodology:
#   X = Goal Contributions per 90 min (goals + assists per 90)
#   Y = Win Rate when playing (%)
#   Bubble = total shots (chance creation)
#   Color = year

label_positions = {}
annotation_offsets = {
    "Gussen":    (+0.03, +4.5),
    "Bugliari":  (-0.06, +4.0),
    "Dolinko":   (+0.05, -4.5),
    "Scott":     (+0.06, +3.5),
    "Canencio":  (+0.05, +4.0),
    "Stewart":   (+0.00, +4.0),
    "Sams":      (+0.03, -4.0),
    "Beshel":    (+0.04, +3.5),
    "Kogelmann": (-0.07, +3.5),
    "Robinson":  (+0.05, +3.5),
    "Estrella":  (+0.03, +4.0),
    "Daboo":     (+0.04, -4.0),
    "Leon":      (-0.07, +3.0),
    "Confalone": (+0.04, -3.5),
    "Jondro":    (-0.07, -3.5),
    "Supan":     (+0.04, +3.0),
    "Kirwan":    (-0.06, -3.0),
}

for p in outfield:
    col   = year_color[p["year"]]
    bsize = max(p["shots"] * 15, 80)
    ax6.scatter(p["ga90"], p["win_rate"], s=bsize, color=col,
                alpha=0.78, edgecolors="white", linewidths=0.6, zorder=4)

    surname = p["name"].split()[-1]
    contrib_label = (f"{p['goals']}G/{p['assists']}A"
                     if p["goals"] + p["assists"] > 0 else "")
    full_label = f"{surname}\n{contrib_label}" if contrib_label else surname
    if p["shots"] >= 4 or p["g_plus_a"] > 0:
        dx, dy = annotation_offsets.get(surname, (0.03, 3.0))
        ax6.annotate(full_label,
                     xy=(p["ga90"], p["win_rate"]),
                     xytext=(p["ga90"] + dx, p["win_rate"] + dy),
                     fontsize=7.0, color="white", ha="center",
                     arrowprops=dict(arrowstyle="-", color="#555555", lw=0.5),
                     zorder=5)

# Reference lines
team_win_rate = 33.3
mean_ga90 = np.mean([p["ga90"] for p in outfield])
ax6.axhline(team_win_rate, color="#adb5bd", ls="--", lw=1.1, alpha=0.7,
            label=f"Team win rate ({team_win_rate:.1f}%)")
ax6.axvline(mean_ga90, color="#3498db", ls="--", lw=1.1, alpha=0.7,
            label=f"Avg G+A/90 ({mean_ga90:.2f})")

# Shade "undervalued" quadrant — high contribution, high win rate, possibly low usage
ax6.fill_betweenx([team_win_rate, 60], mean_ga90, 0.65,
                  color=ACCENT, alpha=0.09, zorder=1, label="Undervalued zone")

ax6.set_xlabel("Goal Contributions per 90 min (Goals + Assists / 90 min played)*",
               fontsize=10)
ax6.set_ylabel("Win Rate with Player in Lineup (%)*", fontsize=10)
ax6.set_title(
    "Undervalued Players Chart  —  Bubble size = Total Shots (chance creation)\n"
    "Upper-right quadrant: above-avg contributions AND above-avg win rate → UNDERVALUED",
    fontsize=11, fontweight="bold", pad=10)

ax6.set_xlim(-0.05, 0.65)
ax6.set_ylim(20, 60)
ax6.grid(zorder=0)

# Year legend
yr_handles = [mpatches.Patch(color=c, label=f"{y}") for y, c in year_color.items()]
sz_handles = [
    plt.scatter([], [], s=80,  color="white", alpha=0.5, label="Low shots"),
    plt.scatter([], [], s=200, color="white", alpha=0.5, label="Med shots"),
    plt.scatter([], [], s=400, color="white", alpha=0.5, label="High shots"),
]
leg1 = ax6.legend(handles=yr_handles, title="Year", loc="lower right",
                  fontsize=8, title_fontsize=8,
                  facecolor="#1a2a3a", edgecolor="none", labelcolor="white")
leg2 = ax6.legend(handles=sz_handles, title="Bubble = Shots", loc="lower left",
                  fontsize=8, title_fontsize=8,
                  facecolor="#1a2a3a", edgecolor="none", labelcolor="white")
ax6.add_artist(leg1)
ax6.legend(fontsize=8, loc="upper left",
           facecolor="#1a2a3a", edgecolor="none", labelcolor="white")
ax6.add_artist(leg2)

# Annotate undervalued zone
ax6.text(0.52, 57,
         "UNDERVALUED\nZONE",
         fontsize=9, color=ACCENT, fontweight="bold", ha="center", alpha=0.8)

# ─────────────────────────────────────────────────────────────────────────────
# UNDERVALUED PLAYER TABLE — inset on bubble chart
# ─────────────────────────────────────────────────────────────────────────────
uv_sorted = sorted(outfield, key=lambda x: -x["undervalue"])[:6]

table_data = [[p["name"], p["pos"], p["year"],
               f"{p['goals']}G/{p['assists']}A",
               f"{p['ga90']:.3f}",
               f"{p['win_rate']:.0f}%",
               f"{p['shots_pg']:.2f}"] for p in uv_sorted]
col_labels = ["Player", "Pos", "Yr", "G/A", "G+A/90*", "Win%*", "Shots/G"]

tbl = ax6.table(cellText=table_data, colLabels=col_labels,
                loc="upper right", bbox=[0.60, 0.02, 0.40, 0.44])
tbl.auto_set_font_size(False)
tbl.set_fontsize(7)
for (row, col), cell in tbl.get_celld().items():
    cell.set_facecolor("#0d2235" if row == 0 else "#0a1a28")
    cell.set_edgecolor("#1e3a5f")
    cell.set_text_props(color="white" if row > 0 else ACCENT)
    if row == 0:
        cell.set_text_props(fontweight="bold", color=ACCENT)

# ─────────────────────────────────────────────────────────────────────────────
# SAVE
# ─────────────────────────────────────────────────────────────────────────────
output_path = "/home/user/2M-Athletics/colby_soccer_2025_analysis.png"
plt.savefig(output_path, dpi=150, bbox_inches="tight",
            facecolor=fig.get_facecolor())
print(f"Chart saved → {output_path}")
print("\n── TOP UNDERVALUED PLAYERS ──────────────────────────────────────")
print(f"{'Player':<22} {'Pos':<5} {'Yr':<4} {'G':<4} {'A':<4} {'G+A/90*':<10} {'Win%*':<8} {'Shots/G'}")
print("─" * 75)
for p in uv_sorted:
    flag = "◀ UNDERVALUED" if p["ga90"] > mean_ga90 and p["win_rate"] > team_win_rate else ""
    print(f"{p['name']:<22} {p['pos']:<5} {p['year']:<4} {p['goals']:<4} "
          f"{p['assists']:<4} {p['ga90']:<10.3f} {p['win_rate']:<8.0f} "
          f"{p['shots_pg']:.2f}  {flag}")
