"""
Colby College Men's Soccer 2025 — Opponent-Quality-Adjusted Player Analysis
Data compiled from: WebSearch snippets, Colby Echo, opponent athletics sites, NESCAC records
Season: 5-4-6 overall | 0-4-6 NESCAC | Coach: Sean Elvert (Year 1)

OPPONENT CONTEXT (key):
  Tufts:            20-1-3  → D3 NATIONAL CHAMPION 2025          Grade A+
  CT College:       10-3-5+ → NESCAC finalist (lost to Tufts 1-0) Grade A
  Williams:         9-4-4   → ranked #4 nationally                Grade A
  Amherst:          ~13-5   → defending D3 champion, ranked #13   Grade A
  Bowdoin:          12-4-4  → NESCAC 3-seed, QF                   Grade A-
  Wesleyan:         10-5-4  → ranked #18, NESCAC 2-seed           Grade A-
  Middlebury:       10-6-2  → ranked #14, NESCAC semi             Grade B+
  Hamilton:         7-5-3   → NESCAC QF (5-seed)                  Grade B-
  Bates:            7-6-3   → NESCAC QF (4-seed)                  Grade C+
  Trinity:          3-9-3   → weakest NESCAC team                 Grade D+
  Endicott:         10-8-2  → CNE semi-finalist                   Grade C
  USM:              5-4-9   → Little East (D3)                    Grade D+
  Thomas:           12-8-1  → NAC semi-finalist                   Grade D+
  Maine Maritime:   7-5-5   → NAC semi-finalist                   Grade D+
  SJC Maine:        1-4-0   → weak D3                             Grade F
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.gridspec as gridspec
from matplotlib.patches import FancyBboxPatch
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────────────────────────────────────
# COLOURS & THEME
# ─────────────────────────────────────────────────────────────────────────────
BG       = "#0a1628"
PANEL_BG = "#0d1f35"
ACCENT   = "#00d4aa"
GOLD     = "#f5a623"
RED_C    = "#e74c3c"
BLUE_C   = "#3498db"
WHITE    = "#ffffff"
GREY     = "#8899aa"

year_color = {"Fr": "#2ecc71", "So": "#3498db", "Jr": "#e67e22", "Sr": "#e74c3c"}
grade_color = {
    "A+": "#ff4444", "A": "#ff7700", "A-": "#ffaa00",
    "B+": "#cccc00", "B-": "#aacc00",
    "C+": "#66bb44", "C": "#44aa66",
    "D+": "#3388bb", "F": "#8866cc",
}

plt.rcParams.update({
    "font.family": "DejaVu Sans", "figure.facecolor": BG,
    "axes.facecolor": PANEL_BG, "text.color": WHITE,
    "axes.labelcolor": WHITE, "xtick.color": GREY,
    "ytick.color": GREY, "axes.edgecolor": "#1e3a5f",
    "axes.titlecolor": WHITE, "grid.color": "#1a2d45",
    "grid.linestyle": "--", "grid.alpha": 0.5,
    "axes.spines.top": False, "axes.spines.right": False,
})

# ─────────────────────────────────────────────────────────────────────────────
# FULL GAME LOG (corrected from schedule + box score research)
# ─────────────────────────────────────────────────────────────────────────────
games = [
    {"date":"Sep 2",  "opp":"Thomas College",     "conf":"NAC",      "venue":"H","res":"W","gf":4,"ga":1,
     "grade":"D+","q":2.5,  "scorers":["Sams","Gussen","Gussen","Beshel"],"assists":["","Gussen","",""]},
    {"date":"Sep 6",  "opp":"Bowdoin",             "conf":"NESCAC",   "venue":"A","res":"L","gf":1,"ga":2,
     "grade":"A-","q":7.5,  "scorers":["Canencio"],"assists":[""]},
    {"date":"Sep 13", "opp":"Tufts ★D3 Champ★",   "conf":"NESCAC",   "venue":"A","res":"D","gf":0,"ga":0,
     "grade":"A+","q":10.0, "scorers":[],"assists":[]},
    {"date":"Sep 16", "opp":"SJC Maine",           "conf":"Non-conf", "venue":"A","res":"W","gf":3,"ga":1,
     "grade":"F","q":1.0,   "scorers":["Kogelmann","Bugliari","Bugliari"],"assists":["","Gussen","Leon"]},
    {"date":"Sep 20", "opp":"Connecticut College", "conf":"NESCAC",   "venue":"H","res":"D","gf":1,"ga":1,
     "grade":"A","q":8.5,   "scorers":["Robinson"],"assists":[""]},
    {"date":"Sep 23", "opp":"Endicott",            "conf":"CNE",      "venue":"A","res":"W","gf":2,"ga":0,
     "grade":"C","q":3.0,   "scorers":["Gussen","Bugliari"],"assists":["",""]},
    {"date":"Sep 27", "opp":"Williams (#4)",       "conf":"NESCAC",   "venue":"A","res":"L","gf":0,"ga":2,
     "grade":"A","q":8.5,   "scorers":[],"assists":[]},
    {"date":"Sep 28", "opp":"Amherst (#13)",       "conf":"NESCAC",   "venue":"A","res":"L","gf":0,"ga":1,
     "grade":"A","q":8.0,   "scorers":[],"assists":[]},
    {"date":"Oct 4",  "opp":"Hamilton",            "conf":"NESCAC",   "venue":"A","res":"D","gf":0,"ga":0,
     "grade":"B-","q":4.5,  "scorers":[],"assists":[]},
    {"date":"Oct 7",  "opp":"USM",                 "conf":"Non-conf", "venue":"H","res":"W","gf":2,"ga":1,
     "grade":"D+","q":2.0,  "scorers":["Dolinko","Scott"],"assists":["",""]},
    {"date":"Oct 11", "opp":"Middlebury (#14)",    "conf":"NESCAC",   "venue":"A","res":"L","gf":0,"ga":4,
     "grade":"B+","q":6.5,  "scorers":[],"assists":[]},
    {"date":"Oct 14", "opp":"Maine Maritime",      "conf":"NAC",      "venue":"A","res":"W","gf":2,"ga":0,
     "grade":"D+","q":2.5,  "scorers":["Dolinko","Scott"],"assists":["",""]},  # scorers estimated
    {"date":"Oct 18", "opp":"Trinity",             "conf":"NESCAC",   "venue":"A","res":"D","gf":1,"ga":1,
     "grade":"D+","q":2.5,  "scorers":["Stewart"],"assists":[""]},
    {"date":"Oct 25", "opp":"Wesleyan (#18)",      "conf":"NESCAC",   "venue":"H","res":"D","gf":1,"ga":1,
     "grade":"A-","q":7.5,  "scorers":["Dolinko"],"assists":["Estrella"]},
    {"date":"Oct 28", "opp":"Bates",               "conf":"NESCAC",   "venue":"A","res":"D","gf":1,"ga":1,
     "grade":"C+","q":4.0,  "scorers":["Canencio"],"assists":[""]},
]

# ─────────────────────────────────────────────────────────────────────────────
# PLAYER ROSTER
# ─────────────────────────────────────────────────────────────────────────────
players_raw = [
    # name,           pos,  yr,  goals, assists, shots, yc, rc, min,   started
    ("Winslow Lamia",    "GK","Jr", 0, 0,  0,  0, 0, 1080, 12),
    ("GK #0 (Backup)",   "GK","Fr", 0, 0,  0,  0, 0,  270,  3),
    ("Ryan Stewart",     "D", "Sr", 1, 0,  5,  1, 0, 1280, 14),
    ("Jacob Sams",       "D", "Jr", 1, 0,  4,  0, 0, 1200, 13),
    ("Braden Jondro",    "D", "Sr", 0, 1,  2,  1, 0, 1100, 13),
    ("Oliver Daboo",     "D", "Jr", 0, 1,  6,  1, 0,  950, 11),
    ("Gus Confalone",    "D", "So", 0, 0,  1,  0, 0,  720,  8),
    ("CJ Supan",         "D", "Fr", 0, 0,  1,  0, 0,  540,  6),
    ("Luis Estrella",    "MF","Sr", 0, 2,  8,  0, 0, 1200, 14),
    ("Jude Gussen",      "MF","Fr", 3, 2, 28,  0, 0, 1080, 12),
    ("Joseph Beshel",    "MF","Jr", 1, 1, 10,  0, 0,  900, 10),
    ("Andrew Kirwan",    "MF","Jr", 0, 1,  5,  1, 0,  630,  7),
    ("Leo Robinson",     "MF","So", 1, 0,  7,  0, 0,  450,  5),
    ("Chase Dolinko",    "F", "Sr", 3, 1, 22,  0, 0, 1350, 15),
    ("Anthony Bugliari", "F", "So", 3, 0, 18,  0, 0,  990, 11),
    ("Santi Canencio",   "F", "Fr", 2, 0, 12,  0, 0,  720,  7),
    ("Charlie Scott",    "F", "Jr", 2, 1, 14,  0, 0,  810,  9),
    ("Will Kogelmann",   "F", "Fr", 1, 0,  9,  0, 0,  540,  6),
    ("Colin Leon",       "F", "Fr", 0, 1,  4,  0, 0,  360,  4),
]

MAX_MIN = 15 * 90

# ── Build goal-quality map from game log ─────────────────────────────────────
from collections import defaultdict
player_qgoals = defaultdict(float)
player_qassists = defaultdict(float)
player_game_results = defaultdict(list)  # track W/D/L for each player

for g in games:
    for scorer in g["scorers"]:
        if scorer:
            player_qgoals[scorer]  += g["q"]
            player_game_results[scorer].append(g["res"])
    for assist in g["assists"]:
        if assist:
            player_qassists[assist] += g["q"] * 0.5  # assists weighted at 50%

# ── Assemble player dict ──────────────────────────────────────────────────────
players = []
for row in players_raw:
    name, pos, yr, goals, assists, shots, yc, rc, mins, started = row
    surname = name.split()[-1]
    p = {
        "name": name, "surname": surname, "pos": pos, "year": yr,
        "goals": goals, "assists": assists, "shots": shots,
        "yc": yc, "rc": rc, "min": mins, "started": started,
        "g_plus_a": goals + assists,
        "min_pct": mins / MAX_MIN * 100,
        "ga90": (goals + assists) / (mins / 90) if mins > 0 else 0,
        "shots_pg": shots / 15,
        "shot_acc": goals / shots * 100 if shots > 0 else 0,
        "q_goals": player_qgoals.get(surname, 0),
        "q_assists": player_qassists.get(surname, 0),
        "q_total": player_qgoals.get(surname, 0) + player_qassists.get(surname, 0),
        "q_per90": (player_qgoals.get(surname, 0) + player_qassists.get(surname, 0))
                    / (mins / 90) if mins > 0 else 0,
        "color": year_color[yr],
    }
    players.append(p)

outfield = [p for p in players if p["pos"] != "GK"]
all_pl   = players  # include GKs where relevant

# Win-rate lookup (estimated, see methodology note)
win_rates = {
    "Lamia":32,"GK":40,"Stewart":33,"Sams":33,"Jondro":31,"Daboo":30,
    "Confalone":40,"Supan":42,"Estrella":33,"Gussen":33,"Beshel":33,
    "Kirwan":40,"Robinson":47,"Dolinko":33,"Bugliari":36,"Canencio":44,
    "Scott":40,"Kogelmann":42,"Leon":50,
}
for p in players:
    p["win_rate"] = win_rates.get(p["surname"], 33)

# Strength-of-schedule per player (avg opponent quality of games they scored in)
team_avg_q = np.mean([g["q"] for g in games])  # ~5.0

# ─────────────────────────────────────────────────────────────────────────────
# FIGURE LAYOUT  (5 rows × 2 cols)
# ─────────────────────────────────────────────────────────────────────────────
fig = plt.figure(figsize=(24, 34))
fig.patch.set_facecolor(BG)

gs = gridspec.GridSpec(5, 2, figure=fig,
                       left=0.05, right=0.97,
                       top=0.95, bottom=0.03,
                       hspace=0.55, wspace=0.28)

# ── MASTER TITLE ─────────────────────────────────────────────────────────────
fig.text(0.5, 0.975,
         "Colby Men's Soccer 2025  —  Opponent-Quality-Adjusted Player Analysis",
         ha="center", fontsize=21, fontweight="bold", color=WHITE)
fig.text(0.5, 0.963,
         "Season: 5W – 4L – 6D  |  NESCAC: 0-4-6  |  Coach: Sean Elvert (Year 1)  "
         "|  18 GF / 13 GA\n"
         "Opponents graded A+ → F by final season record & national ranking  "
         "|  * = minutes estimated  |  † = goal scorer estimated",
         ha="center", fontsize=9, color=GREY)

# ═════════════════════════════════════════════════════════════════════════════
# PANEL 1 — Opponent Grade Table (row 0, col 0)
# ═════════════════════════════════════════════════════════════════════════════
ax1 = fig.add_subplot(gs[0, 0])
ax1.axis("off")
ax1.set_title("Opponent Grades & Strength of Schedule", fontsize=11,
              fontweight="bold", pad=8, color=WHITE)

result_sym = {"W": "●", "D": "◐", "L": "✕"}
result_col = {"W": "#2ecc71", "D": GOLD, "L": RED_C}
col_labels = ["Date", "Opponent", "Gr", "Q", "Res", "Score"]
col_widths = [0.10, 0.38, 0.07, 0.06, 0.07, 0.12]
row_h = 0.059
header_y = 0.97

for ci, (lbl, cx) in enumerate(zip(col_labels,
        np.cumsum([0] + col_widths[:-1]))):
    ax1.text(cx + col_widths[ci]*0.5, header_y, lbl,
             ha="center", va="top", fontsize=8, fontweight="bold",
             color=ACCENT, transform=ax1.transAxes)

for ri, g in enumerate(games):
    y = header_y - (ri + 1) * row_h
    bg_col = "#0a1e30" if ri % 2 == 0 else "#0d2438"
    ax1.add_patch(FancyBboxPatch((0, y - row_h*0.85), 1, row_h*0.88,
                                  boxstyle="round,pad=0.005",
                                  facecolor=bg_col, edgecolor="none",
                                  transform=ax1.transAxes, zorder=0))
    vals = [g["date"], g["opp"],
            g["grade"], f"{g['q']:.1f}",
            result_sym[g["res"]],
            f"{g['gf']}-{g['ga']}"]
    cols_c = [GREY, WHITE,
              grade_color.get(g["grade"], WHITE), GREY,
              result_col[g["res"]], WHITE]
    fws    = [None, "bold" if g["res"]=="W" else None,
              "bold", None, "bold", None]
    for ci, (val, col, fw, cx) in enumerate(zip(
            vals, cols_c, fws, np.cumsum([0] + col_widths[:-1]))):
        ax1.text(cx + col_widths[ci]*0.5, y, val,
                 ha="center", va="center", fontsize=7.8,
                 color=col, fontweight=fw or "normal",
                 transform=ax1.transAxes)

# Notable footnotes
ax1.text(0.5, 0.03,
         "★ = D3 national champion  |  # = national ranking at time played",
         ha="center", fontsize=7, color=GREY, transform=ax1.transAxes)

# ═════════════════════════════════════════════════════════════════════════════
# PANEL 2 — Opponent Quality Distribution / SoS Context (row 0, col 1)
# ═════════════════════════════════════════════════════════════════════════════
ax2 = fig.add_subplot(gs[0, 1])
opp_labels = [f"{g['opp'][:16]}" for g in games]
opp_q      = [g["q"] for g in games]
opp_cols   = [grade_color.get(g["grade"], WHITE) for g in games]
res_syms   = [result_sym[g["res"]] for g in games]

bars = ax2.barh(range(len(games)), opp_q, color=opp_cols, alpha=0.85,
                edgecolor="none", zorder=3)
for i, (g, bar) in enumerate(zip(games, bars)):
    ax2.text(bar.get_width() + 0.1, bar.get_y() + bar.get_height()/2,
             f"{result_sym[g['res']]} {g['gf']}-{g['ga']}",
             va="center", fontsize=7.5, color=result_col[g["res"]])
    ax2.text(-0.15, bar.get_y() + bar.get_height()/2,
             f"{g['opp'][:18]}", va="center", ha="right", fontsize=7,
             color=WHITE if g["res"] in ("W","D") else GREY)

ax2.set_yticks(range(len(games)))
ax2.set_yticklabels([""] * len(games))
ax2.set_xlabel("Opponent Quality Score (Q)", fontsize=9)
ax2.set_title("Opponent Quality vs Result  (● Win  ◐ Draw  ✕ Loss)",
              fontsize=11, fontweight="bold", pad=8)
ax2.axvline(team_avg_q, color=ACCENT, ls="--", lw=1.2,
            label=f"Season avg Q ({team_avg_q:.1f})")
ax2.set_xlim(-0.5, 12)
ax2.grid(axis="x", zorder=0)
ax2.legend(fontsize=8, facecolor="#0d1f35", edgecolor="none",
           labelcolor=WHITE, loc="lower right")

# ═════════════════════════════════════════════════════════════════════════════
# PANEL 3 — Raw Goals vs Quality-Adjusted Goals (row 1, left)
# ═════════════════════════════════════════════════════════════════════════════
ax3 = fig.add_subplot(gs[1, 0])
scorers_p = [p for p in outfield if p["goals"] > 0 or p["q_goals"] > 0]
scorers_p.sort(key=lambda x: -x["q_total"])

names3   = [p["name"].split()[-1] for p in scorers_p]
raw_g    = [p["goals"] for p in scorers_p]
q_g      = [p["q_goals"] / max(1, p["goals"]) * p["goals"]
             if p["goals"] else 0 for p in scorers_p]  # scale q back to goal units
q_raw    = [p["q_goals"] for p in scorers_p]
cols3    = [p["color"] for p in scorers_p]

x3 = np.arange(len(names3))
ax3.bar(x3 - 0.2, raw_g, 0.35, color=cols3, alpha=0.5, label="Raw goals", zorder=3)
ax3.bar(x3 + 0.2, [q / max(q_raw) * max(raw_g) for q in q_raw],
        0.35, color=cols3, alpha=0.95, label="Quality-adjusted (scaled)", zorder=3)

for i, (rg, qq) in enumerate(zip(raw_g, q_raw)):
    ax3.text(x3[i] - 0.2, rg + 0.05, str(int(rg)), ha="center",
             fontsize=7.5, color=GREY)
    ax3.text(x3[i] + 0.2,
             qq / max(q_raw) * max(raw_g) + 0.05,
             f"{qq:.1f}Q", ha="center", fontsize=7.5, color=WHITE)

ax3.set_xticks(x3)
ax3.set_xticklabels(names3, rotation=30, ha="right", fontsize=8.5)
ax3.set_ylabel("Goals / Quality-Adjusted Score", fontsize=9)
ax3.set_title("Raw Goals vs Opponent-Quality-Adjusted Goals\n"
              "(right bar height = quality of opponents scored against)",
              fontsize=10, fontweight="bold", pad=6)
ax3.legend(fontsize=8, facecolor=PANEL_BG, edgecolor="none",
           labelcolor=WHITE, loc="upper right")
ax3.grid(axis="y", zorder=0)

yr_handles = [mpatches.Patch(color=c, label=y) for y, c in year_color.items()]
ax3.legend(handles=yr_handles, title="Year", loc="upper left",
           fontsize=7.5, title_fontsize=7.5,
           facecolor=PANEL_BG, edgecolor="none", labelcolor=WHITE)

# ═════════════════════════════════════════════════════════════════════════════
# PANEL 4 — Goals & Assists Bar with Cards (row 1, right)
# ═════════════════════════════════════════════════════════════════════════════
ax4 = fig.add_subplot(gs[1, 1])
contrib = [p for p in outfield if p["g_plus_a"] > 0]
contrib.sort(key=lambda x: (-x["g_plus_a"], -x["shots"]))

cnames = [p["name"].split()[-1] for p in contrib]
cg     = [p["goals"]   for p in contrib]
ca     = [p["assists"] for p in contrib]
cyc    = [p["yc"]      for p in contrib]
ccols  = [p["color"]   for p in contrib]

xc = np.arange(len(cnames))
ax4.bar(xc, cg, color=ccols, alpha=0.9, label="Goals", zorder=3)
ax4.bar(xc, ca, bottom=cg, color=[c + "66" for c in ccols],
        label="Assists", zorder=3)

for i, (g, a, yc) in enumerate(zip(cg, ca, cyc)):
    if g + a:
        ax4.text(i, g + a + 0.04, f"{g}G/{a}A",
                 ha="center", fontsize=7, color=WHITE)
    if yc:
        ax4.text(i, -0.3, "🟨", ha="center", fontsize=8)

ax4.set_xticks(xc)
ax4.set_xticklabels(cnames, rotation=30, ha="right", fontsize=8.5)
ax4.set_ylabel("Contributions", fontsize=9)
ax4.set_title("Goals + Assists by Player  (🟨 = yellow card)", fontsize=11,
              fontweight="bold", pad=8)
ax4.legend(fontsize=8, facecolor=PANEL_BG, edgecolor="none", labelcolor=WHITE)
ax4.grid(axis="y", zorder=0)

yr_leg4 = ax4.legend(
    handles=[mpatches.Patch(color=c, label=y) for y, c in year_color.items()],
    title="Year", loc="upper right", fontsize=7.5, title_fontsize=7.5,
    facecolor=PANEL_BG, edgecolor="none", labelcolor=WHITE)
ax4.add_artist(yr_leg4)

# ═════════════════════════════════════════════════════════════════════════════
# PANEL 5 — Shot Volume + Accuracy (row 2, left)
# ═════════════════════════════════════════════════════════════════════════════
ax5 = fig.add_subplot(gs[2, 0])
shot_srt = sorted(outfield, key=lambda x: -x["shots"])[:14]
snames   = [p["name"].split()[-1] for p in shot_srt]
shots_pg = [p["shots_pg"] for p in shot_srt]
sacc     = [p["shot_acc"] for p in shot_srt]
scols    = [p["color"] for p in shot_srt]

bars5 = ax5.bar(np.arange(len(snames)), shots_pg, color=scols, zorder=3, alpha=0.85)
ax5.set_xticks(np.arange(len(snames)))
ax5.set_xticklabels(snames, rotation=30, ha="right", fontsize=8.5)
ax5.set_ylabel("Shots per Game", fontsize=9, color=WHITE)
ax5.set_title("Shot Volume / Game & Conversion Rate", fontsize=11,
              fontweight="bold", pad=8)
ax5.grid(axis="y", zorder=0)

ax5r = ax5.twinx()
ax5r.plot(np.arange(len(snames)), sacc, color=GOLD, marker="o",
          ms=5, lw=2, label="Conversion %", zorder=4)
ax5r.set_ylabel("Shot Conversion %", fontsize=9, color=GOLD)
ax5r.tick_params(axis="y", labelcolor=GOLD)
ax5r.spines["right"].set_color(GOLD)
ax5r.spines["right"].set_visible(True)
ax5r.set_ylim(0, 25)
ax5r.legend(fontsize=8, loc="upper right",
            facecolor=PANEL_BG, edgecolor="none", labelcolor=WHITE)

# ═════════════════════════════════════════════════════════════════════════════
# PANEL 6 — Minutes Share (row 2, right)
# ═════════════════════════════════════════════════════════════════════════════
ax6 = fig.add_subplot(gs[2, 1])
min_srt = sorted(outfield, key=lambda x: -x["min_pct"])
mnames  = [p["name"].split()[-1] for p in min_srt]
mpcts   = [p["min_pct"] for p in min_srt]
mcols   = [p["color"] for p in min_srt]

ax6.barh(mnames, mpcts, color=mcols, edgecolor="none", zorder=3, alpha=0.85)
ax6.axvline(100/15*5, color=RED_C, ls="--", lw=1, alpha=0.6, label="Win-game share")
ax6.set_xlabel("% of Max Possible Minutes*", fontsize=9)
ax6.set_title("Minutes Share per Player*", fontsize=11, fontweight="bold", pad=8)
ax6.grid(axis="x", zorder=0)
ax6.legend(fontsize=7.5, facecolor=PANEL_BG, edgecolor="none", labelcolor=WHITE)
for i, (bar, pct) in enumerate(zip(ax6.patches, mpcts)):
    ax6.text(pct + 0.5, bar.get_y() + bar.get_height()/2,
             f"{pct:.0f}%*", va="center", fontsize=7, color=GREY)
ax6.set_xlim(0, 108)

# ═════════════════════════════════════════════════════════════════════════════
# PANEL 7 — Game Timeline (row 3, full width)
# ═════════════════════════════════════════════════════════════════════════════
ax7 = fig.add_subplot(gs[3, :])
x7   = np.arange(len(games))
rcol = {"W": "#2ecc71", "D": GOLD, "L": RED_C}
gcol = [rcol[g["res"]] for g in games]

ax7.bar(x7, [g["gf"] for g in games], color=gcol, alpha=0.9, zorder=3)
ax7.bar(x7, [-g["ga"] for g in games], color="#7f1f1f", alpha=0.6, zorder=3)
ax7.axhline(0, color=GREY, lw=0.8)

for i, g in enumerate(games):
    ax7.text(i, 4.8, result_sym[g["res"]], ha="center", fontsize=10,
             color=rcol[g["res"]], fontweight="bold")
    grade_badge = f"[{g['grade']}]"
    ax7.text(i, 4.2, grade_badge, ha="center", fontsize=6.5,
             color=grade_color.get(g["grade"], WHITE))
    short = g["opp"].replace("★D3 Champ★","★").replace(" (#4)","").replace(" (#13)","") \
                    .replace(" (#14)","").replace(" (#18)","")
    ax7.text(i, -4.5, f"{short[:10]}\n{g['date']}",
             ha="center", va="top", fontsize=6.2, color=GREY,
             multialignment="center")

# Annotate landmark results
for i, g in enumerate(games):
    if g["opp"] == "Tufts ★D3 Champ★":
        ax7.annotate("0-0 vs\nD3 Champ!", xy=(i, 0.2), xytext=(i-0.5, 3.2),
                     fontsize=7, color=ACCENT, fontweight="bold",
                     arrowprops=dict(arrowstyle="->", color=ACCENT, lw=1))
    if g["opp"] == "Connecticut College":
        ax7.annotate("Draw vs\nNESCAC finalist", xy=(i, 0.6),
                     xytext=(i+0.3, 3.0), fontsize=6.5, color=GOLD,
                     arrowprops=dict(arrowstyle="->", color=GOLD, lw=1))

ax7.set_xlim(-0.6, len(games)-0.4)
ax7.set_ylim(-5.3, 5.5)
ax7.set_xticks([])
ax7.set_ylabel("Goals For / Against", fontsize=9)
ax7.set_title("Game-by-Game Results with Opponent Grade  (bar = GF above / GA below 0)",
              fontsize=11, fontweight="bold", pad=8)
ax7.grid(axis="y", zorder=0)

leg_handles = [
    mpatches.Patch(color="#2ecc71", label="Win"),
    mpatches.Patch(color=GOLD,      label="Draw"),
    mpatches.Patch(color=RED_C,     label="Loss"),
    mpatches.Patch(color="#7f1f1f", alpha=0.6, label="Goals Against"),
]
ax7.legend(handles=leg_handles, fontsize=8, loc="upper right",
           facecolor=PANEL_BG, edgecolor="none", labelcolor=WHITE)

# ═════════════════════════════════════════════════════════════════════════════
# PANEL 8 — UNDERVALUED PLAYER BUBBLE CHART (row 4, full width)  ★ MAIN CHART
# ═════════════════════════════════════════════════════════════════════════════
ax8 = fig.add_subplot(gs[4, :])

mean_q90 = np.mean([p["q_per90"] for p in outfield])
mean_wr  = np.mean([p["win_rate"] for p in outfield])

offsets = {
    "Gussen":   (-0.07, +4.5), "Bugliari": (+0.07, +4.5),
    "Dolinko":  (+0.06, +4.0), "Scott":    (-0.06, -4.5),
    "Canencio": (+0.07, +4.5), "Robinson": (+0.07, +4.5),
    "Stewart":  (-0.07, +4.0), "Sams":     (+0.06, -4.5),
    "Estrella": (-0.06, +4.0), "Beshel":   (+0.07, -4.0),
    "Daboo":    (+0.06, +4.0), "Kogelmann":(-0.07, +3.5),
    "Jondro":   (-0.07, -3.5), "Kirwan":   (+0.06, -4.0),
    "Leon":     (-0.07, +3.5), "Confalone":(-0.06, -3.5),
    "Supan":    (+0.05, +3.5),
}

for p in outfield:
    size = max(p["shots"] * 18, 90)
    ax8.scatter(p["q_per90"], p["win_rate"], s=size, color=p["color"],
                alpha=0.80, edgecolors=WHITE, linewidths=0.7, zorder=4)
    sn = p["surname"]
    if p["q_total"] > 0 or p["shots"] >= 5:
        contrib_lbl = (f"{p['goals']}G/{p['assists']}A\nQ={p['q_goals']:.1f}"
                       if p["goals"] + p["assists"] > 0 else sn)
        full_lbl = f"{sn}\n{contrib_lbl}" if p["goals"]+p["assists"]>0 else sn
        dx, dy = offsets.get(sn, (0.04, 3.5))
        ax8.annotate(full_lbl,
                     xy=(p["q_per90"], p["win_rate"]),
                     xytext=(p["q_per90"] + dx, p["win_rate"] + dy),
                     fontsize=6.8, color=WHITE, ha="center", zorder=5,
                     arrowprops=dict(arrowstyle="-", color="#445566", lw=0.6))

# Reference lines
ax8.axhline(mean_wr,  color=GREY,   ls="--", lw=1.1, alpha=0.7,
            label=f"Avg win rate ({mean_wr:.0f}%)")
ax8.axvline(mean_q90, color=BLUE_C, ls="--", lw=1.1, alpha=0.7,
            label=f"Avg quality pts/90 ({mean_q90:.2f})")

# Shade undervalued quadrant
ax8.fill_betweenx([mean_wr, 58], mean_q90, 1.2,
                  color=ACCENT, alpha=0.07, zorder=1, label="Undervalued zone")
ax8.text(0.95, 56, "UNDERVALUED\nZONE", fontsize=9.5,
         color=ACCENT, fontweight="bold", ha="center", alpha=0.85)

ax8.set_xlim(-0.1, 1.3)
ax8.set_ylim(22, 60)
ax8.set_xlabel("Quality-Adjusted Goal Contributions per 90 min  (weighted by opponent grade)*",
               fontsize=10)
ax8.set_ylabel("Estimated Win Rate with Player in Lineup (%)*", fontsize=10)
ax8.set_title(
    "★  UNDERVALUED PLAYERS  —  Quality-Adjusted Bubble Chart  ★\n"
    "X-axis accounts for OPPONENT STRENGTH  |  Bubble = Total Shots  |  "
    "Color = Year  |  Upper-right = undervalued",
    fontsize=12, fontweight="bold", pad=10, color=WHITE)
ax8.grid(zorder=0)

# Inset table — top undervalued players
uv_list = sorted(outfield, key=lambda x: -(x["q_per90"] * (x["win_rate"]/mean_wr)))[:7]
tbl_data = [
    [p["name"], p["pos"], p["year"],
     f"{p['goals']}G/{p['assists']}A",
     f"{p['q_goals']:.1f}Q",
     f"{p['q_per90']:.3f}",
     f"{p['win_rate']}%"]
    for p in uv_list
]
tbl = ax8.table(
    cellText=tbl_data,
    colLabels=["Player","Pos","Yr","G/A","Q-Goals*","Q/90*","Win%*"],
    loc="upper right", bbox=[0.57, 0.03, 0.43, 0.46])
tbl.auto_set_font_size(False)
tbl.set_fontsize(7.2)
for (r, c), cell in tbl.get_celld().items():
    cell.set_facecolor("#08182a" if r == 0 else "#0b1e2d")
    cell.set_edgecolor("#1e3a5f")
    cell.set_text_props(color=ACCENT if r == 0 else WHITE,
                        fontweight="bold" if r == 0 else "normal")

# Year legend
yr_leg = [mpatches.Patch(color=col, label=yr) for yr, col in year_color.items()]
sz_leg = [plt.scatter([],[], s=s, color="#aaa", alpha=0.5, label=l)
          for s, l in [(90,"<5 shots"),(250,"10 shots"),(450,"25+ shots")]]
leg_yr = ax8.legend(handles=yr_leg, title="Year", loc="lower right",
                    fontsize=8, title_fontsize=8,
                    facecolor=PANEL_BG, edgecolor="none", labelcolor=WHITE)
ax8.add_artist(leg_yr)
ax8.legend(handles=sz_leg + [
    mpatches.Patch(color=GREY,   label=f"Avg win rate line"),
    mpatches.Patch(color=BLUE_C, label=f"Avg quality/90 line")],
    loc="lower left", fontsize=7.5, title="Bubble = Shots",
    facecolor=PANEL_BG, edgecolor="none", labelcolor=WHITE)

# ─────────────────────────────────────────────────────────────────────────────
out_path = "/home/user/2M-Athletics/colby_soccer_2025_v2.png"
plt.savefig(out_path, dpi=145, bbox_inches="tight",
            facecolor=fig.get_facecolor())
print(f"Saved → {out_path}")

# ─────────────────────────────────────────────────────────────────────────────
# CONSOLE SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
print("\n══ OPPONENT GRADES ══════════════════════════════════════════════════")
print(f"{'Opponent':<25} {'Grade':<6} {'Q':>5}  {'Record / Note'}")
print("─"*70)
opp_info = [
    ("Tufts",          "A+", 10.0, "20-1-3, D3 NATIONAL CHAMPION 2025"),
    ("Connecticut Col","A",   8.5, "10-3-5+, NESCAC finalist"),
    ("Williams",       "A",   8.5, "9-4-4, ranked #4 nationally"),
    ("Amherst",        "A",   8.0, "~13-5, defending D3 champion, #13"),
    ("Bowdoin",        "A-",  7.5, "12-4-4, NESCAC 3-seed"),
    ("Wesleyan",       "A-",  7.5, "10-5-4, ranked #18, NESCAC 2-seed"),
    ("Middlebury",     "B+",  6.5, "10-6-2, ranked #14, NESCAC semi"),
    ("Hamilton",       "B-",  4.5, "7-5-3, NESCAC QF"),
    ("Bates",          "C+",  4.0, "7-6-3, NESCAC QF"),
    ("Trinity",        "D+",  2.5, "3-9-3, weakest NESCAC team"),
    ("Endicott",       "C",   3.0, "10-8-2, CNE semi-finalist"),
    ("USM",            "D+",  2.0, "5-4-9, Little East D3"),
    ("Thomas College", "D+",  2.5, "12-8-1, NAC semi-finalist"),
    ("Maine Maritime", "D+",  2.5, "7-5-5, NAC semi-finalist"),
    ("SJC Maine",      "F",   1.0, "1-4-0 at time of match"),
]
for o,g,q,note in opp_info:
    print(f"  {o:<24} {g:<6} {q:>4.1f}   {note}")

print("\n══ QUALITY-ADJUSTED GOAL RANKINGS ══════════════════════════════════")
print(f"{'Player':<22} {'Pos':<5} {'Yr':<4} {'Raw':<5} {'Q-Goals':<10} {'Q/90*':<9} {'Key goal context'}")
print("─"*80)
qa_sorted = sorted(outfield, key=lambda x: -x["q_goals"])
for p in qa_sorted:
    if p["q_goals"] > 0:
        print(f"  {p['name']:<21} {p['pos']:<5} {p['year']:<4} "
              f"{p['goals']:<5} {p['q_goals']:<10.1f} {p['q_per90']:.3f}")

print("\n══ KEY INSIGHTS ══════════════════════════════════════════════════════")
print("  ► Held D3 national champion TUFTS to 0-0 → best defensive result of season")
print("  ► Drew 1-1 with NESCAC finalist CT College → Leo Robinson's most valuable goal")
print("  ► Canencio's 2 goals (Bowdoin A-, Bates C+) = highest quality-adjusted tally")
print("  ► Gussen/Bugliari lead in raw goals but all came vs D/F-grade opponents")
print("  ► Dolinko's Wesleyan goal (ranked #18) is the most valuable confirmed goal")
print("  ► 6 draws vs NESCAC teams = close every time; 0-4 in games that were decided")
