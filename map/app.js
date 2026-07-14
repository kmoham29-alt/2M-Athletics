/**
 * 2M Athletics — Flag Football Investment Map
 * Loads clubs.json at runtime. Zero embedded org data.
 */

/* ── State metadata ──────────────────────────────────────────────────────── */
const STATE_NAMES = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
  CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"Washington DC",FL:"Florida",
  GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",
  KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",
  MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",
  MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
  NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",
  OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",
  VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
};

/* ── Approximate Albers USA projection (960×600 viewBox) ─────────────────── */
function projectAlbers(lon, lat) {
  const D2R = Math.PI / 180;
  const λ = lon * D2R, φ = lat * D2R;

  // Check if point is in Alaska bounding box (rough)
  if (lat > 50 && lon < -130) {
    // Alaska sub-projection (simplified translate)
    const n = 0.6, C = 1.41, ρ0 = 0.96;
    const λ0 = -154 * D2R, φ0 = 64 * D2R;
    const θ = n * (λ - λ0);
    const ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
    const x = ρ * Math.sin(θ), y = ρ0 - ρ * Math.cos(θ);
    // Scale + place in AK inset (bottom-left of 960×600)
    return [x * 300 + 165, y * 300 + 490];
  }

  // Check Hawaii (rough)
  if (lat < 25 && lon < -150) {
    const n = 0.6, C = 1.41, ρ0 = 0.85;
    const λ0 = -157 * D2R, φ0 = 21 * D2R;
    const θ = n * (λ - λ0);
    const ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
    const x = ρ * Math.sin(θ), y = ρ0 - ρ * Math.cos(θ);
    return [x * 300 + 430, y * 300 + 500];
  }

  // Lower 48 — standard Albers USA parameters (matches D3 default)
  const φ1 = 29.5 * D2R, φ2 = 45.5 * D2R;
  const φ0 = 38 * D2R, λ0 = -96 * D2R;
  const n = (Math.sin(φ1) + Math.sin(φ2)) / 2;
  const C = Math.cos(φ1) ** 2 + 2 * n * Math.sin(φ1);
  const ρ0 = Math.sqrt(C - 2 * n * Math.sin(φ0)) / n;
  const θ = n * (λ - λ0);
  const ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
  const x = ρ * Math.sin(θ), y = ρ0 - ρ * Math.cos(θ);
  return [x * 1070 + 480, -y * 1070 + 250];
}

/* ── SVG state paths (Albers USA ~960×600) ───────────────────────────────── */
const STATE_PATHS = {
AL:"M 673,285 L 708,283 L 712,330 L 714,385 L 677,388 L 673,370 L 665,365 L 664,330 Z",
AK:"M 120,465 L 205,465 L 225,480 L 225,530 L 150,535 L 110,515 L 100,490 Z",
AZ:"M 332,295 L 456,298 L 452,395 L 328,390 Z",
AR:"M 600,265 L 665,262 L 670,312 L 604,314 Z",
CA:"M 162,213 L 232,215 L 256,260 L 260,320 L 248,375 L 220,400 L 186,380 L 165,330 L 155,270 Z",
CO:"M 454,213 L 553,216 L 550,278 L 452,275 Z",
CT:"M 852,153 L 882,148 L 887,170 L 856,174 Z",
DE:"M 853,185 L 870,183 L 870,205 L 855,207 Z",
FL:"M 670,365 L 714,362 L 736,370 L 758,395 L 762,440 L 740,468 L 715,472 L 690,448 L 668,412 Z",
GA:"M 712,280 L 762,275 L 766,340 L 748,370 L 712,368 L 705,328 Z",
HI:"M 390,475 L 430,472 L 460,480 L 458,500 L 420,505 L 388,498 Z",
ID:"M 330,145 L 385,142 L 395,170 L 398,220 L 370,245 L 332,245 L 328,200 Z",
IL:"M 670,188 L 710,185 L 718,245 L 720,285 L 675,290 L 668,255 Z",
IN:"M 716,183 L 755,180 L 760,245 L 720,248 Z",
IA:"M 583,182 L 665,178 L 668,220 L 585,224 Z",
KS:"M 500,242 L 620,240 L 618,285 L 498,287 Z",
KY:"M 698,222 L 790,215 L 794,260 L 700,265 Z",
LA:"M 603,340 L 665,337 L 675,385 L 660,400 L 635,405 L 608,395 L 600,368 Z",
ME:"M 880,75 L 910,72 L 915,108 L 884,115 Z",
MD:"M 800,192 L 854,188 L 856,212 L 840,220 L 802,218 Z",
MA:"M 843,138 L 896,134 L 900,155 L 843,158 Z",
MI:"M 720,115 L 790,105 L 800,140 L 780,162 L 740,168 L 715,155 Z",
MN:"M 583,98 L 660,95 L 660,178 L 584,182 Z",
MS:"M 643,285 L 675,282 L 680,340 L 672,388 L 640,388 L 636,338 Z",
MO:"M 600,225 L 668,220 L 668,290 L 600,293 Z",
MT:"M 300,82 L 530,78 L 528,158 L 298,162 Z",
NE:"M 494,200 L 618,198 L 620,240 L 494,242 Z",
NV:"M 238,210 L 328,205 L 334,298 L 262,302 Z",
NH:"M 862,110 L 882,108 L 885,152 L 862,155 Z",
NJ:"M 840,165 L 865,162 L 867,200 L 840,203 Z",
NM:"M 454,278 L 555,280 L 552,378 L 450,378 Z",
NY:"M 762,118 L 858,112 L 860,160 L 840,175 L 795,178 L 766,162 Z",
NC:"M 740,253 L 852,245 L 856,278 L 738,285 Z",
ND:"M 494,88 L 658,85 L 658,138 L 492,140 Z",
OH:"M 758,168 L 806,165 L 808,228 L 756,232 Z",
OK:"M 494,288 L 618,285 L 622,330 L 498,333 Z",
OR:"M 165,170 L 325,165 L 328,228 L 164,232 Z",
PA:"M 763,162 L 840,158 L 840,200 L 762,204 Z",
RI:"M 886,155 L 898,153 L 900,170 L 887,172 Z",
SC:"M 749,278 L 800,274 L 808,320 L 760,328 Z",
SD:"M 492,140 L 658,138 L 660,182 L 490,185 Z",
TN:"M 670,252 L 796,246 L 797,280 L 668,285 Z",
TX:"M 470,295 L 622,288 L 640,335 L 645,400 L 625,450 L 590,480 L 555,490 L 520,480 L 490,450 L 468,410 L 462,355 Z",
UT:"M 370,213 L 455,210 L 458,298 L 372,300 Z",
VT:"M 842,108 L 862,106 L 864,152 L 842,155 Z",
VA:"M 756,215 L 856,205 L 860,248 L 808,255 L 755,253 Z",
WA:"M 165,88 L 298,82 L 300,148 L 163,155 Z",
WV:"M 766,190 L 810,185 L 814,240 L 770,245 Z",
WI:"M 652,125 L 710,118 L 720,182 L 654,188 Z",
WY:"M 384,158 L 504,155 L 505,230 L 382,232 Z",
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmtRev(n) {
  if (n == null) return null;
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(0) + 'M';
  if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
  return '$' + n;
}
function na(v, fallback='Not available') { return v != null && v !== '' ? v : `<span class="na">${fallback}</span>`; }
function naStr(v) { return v != null && v !== '' ? v : null; }
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function colorForCount(n) {
  if (n === 0) return 'var(--c0)';
  if (n <= 2)  return 'var(--c1)';
  if (n <= 5)  return 'var(--c2)';
  if (n <= 9)  return 'var(--c3)';
  return 'var(--c4)';
}
function getBBoxCenter(d) {
  const nums = d.match(/-?\d+\.?\d*/g).map(Number);
  const xs = [], ys = [];
  for (let i = 0; i < nums.length; i += 2) { xs.push(nums[i]); ys.push(nums[i+1]); }
  return { cx: (Math.min(...xs)+Math.max(...xs))/2, cy: (Math.min(...ys)+Math.max(...ys))/2 };
}

/* ── App state ───────────────────────────────────────────────────────────── */
let DB = null;                // loaded clubs.json
let stateLeagues = {};        // abbr → [league]
let stateClubs = {};          // abbr → [club]
let nationalLeagues = [];
let multiStateLeagues = [];
let selectedState = null;

const svg = document.getElementById('us-map');
const tooltip = document.getElementById('tooltip');
const ttState = document.getElementById('tt-state');
const ttCount = document.getElementById('tt-count');
const panel = document.getElementById('panel');
const panelTitle = document.getElementById('panel-title');
const panelBody = document.getElementById('panel-body');
const panelClose = document.getElementById('panel-close');
const overlayNational = document.getElementById('overlay-national');
const overlayMulti = document.getElementById('overlay-multi');
const btnNational = document.getElementById('btn-national');
const btnMulti = document.getElementById('btn-multi');

/* ── Load data ───────────────────────────────────────────────────────────── */
async function loadData() {
  try {
    const resp = await fetch('../clubs.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    DB = await resp.json();
    buildIndex();
    renderMap();
  } catch(e) {
    document.getElementById('map-loading').innerHTML =
      `<div class="load-error">Failed to load clubs.json: ${esc(String(e))}<br>
       Serve with <code>python -m http.server</code> from the project root — file:// is blocked by CORS.</div>`;
  }
}

function buildIndex() {
  stateLeagues = {};
  stateClubs = {};
  nationalLeagues = [];
  multiStateLeagues = [];

  Object.keys(STATE_NAMES).forEach(k => {
    stateLeagues[k] = [];
    stateClubs[k] = [];
  });

  for (const league of DB.leagues) {
    if (league.is_national) {
      nationalLeagues.push(league);
      continue;
    }
    if (league.multi_state_unspecified) {
      multiStateLeagues.push(league);
      continue;
    }
    // Explicit state(s)
    for (const abbr of league.states) {
      if (stateLeagues[abbr]) stateLeagues[abbr].push(league);
    }
    // Club pins
    for (const club of (league.clubs || [])) {
      if (club.state && stateClubs[club.state]) {
        stateClubs[club.state].push({ ...club, _league: league });
      }
    }
  }

  // Update button counts
  btnNational.querySelector('.count').textContent = nationalLeagues.length;
  btnMulti.querySelector('.count').textContent = multiStateLeagues.length;
}

/* ── Render SVG map ──────────────────────────────────────────────────────── */
function renderMap() {
  // Clear existing dynamic content
  document.querySelectorAll('.state-path,.club-pin,.state-label,.map-bg').forEach(el => el.remove());

  // Background
  const bg = makeSvgEl('rect', { width:'960', height:'600', fill:'#0a1628', class:'map-bg' });
  svg.insertBefore(bg, svg.firstChild);

  // Draw states
  Object.entries(STATE_PATHS).forEach(([abbr, d]) => {
    const leagues = stateLeagues[abbr] || [];
    const clubs = stateClubs[abbr] || [];
    const total = leagues.length + clubs.length;
    const fillColor = colorForCount(total);

    const path = makeSvgEl('path', {
      d, fill: fillColor,
      stroke: '#0a1628', 'stroke-width': '1.5',
      class: 'state-path', 'data-abbr': abbr,
    });

    path.addEventListener('mousemove', e => showTooltip(e, abbr, total));
    path.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
    path.addEventListener('click', () => selectState(abbr));
    svg.appendChild(path);

    // State label
    const { cx, cy } = getBBoxCenter(d);
    const label = makeSvgEl('text', {
      x: cx, y: cy + 4, 'text-anchor': 'middle',
      fill: total > 0 ? '#fff' : '#3a5070',
      'font-size': '8', 'font-family': 'Segoe UI,system-ui,sans-serif',
      'pointer-events': 'none', class: 'state-label',
    });
    label.textContent = abbr;
    svg.appendChild(label);
  });

  // Draw club pins on top
  renderClubPins();
}

function renderClubPins() {
  document.querySelectorAll('.club-pin').forEach(el => el.remove());
  const toRender = selectedState
    ? (stateClubs[selectedState] || [])
    : Object.values(stateClubs).flat();

  for (const club of toRender) {
    if (club.lat == null || club.lng == null) continue;
    const [cx, cy] = projectAlbers(club.lng, club.lat);
    const circle = makeSvgEl('circle', {
      cx, cy, r: 4, class: 'club-pin',
      'data-city': club.city || '', 'data-state': club.state || '',
    });
    circle.addEventListener('mousemove', e => {
      ttState.textContent = club.club_name || club.city || 'Club';
      ttCount.textContent = `${club.city}, ${club.state} · ${club._league?.name || ''}`;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top = (e.clientY - 10) + 'px';
    });
    circle.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
    circle.addEventListener('click', e => { e.stopPropagation(); showClubDetail(club); });
    svg.appendChild(circle);
  }
}

function makeSvgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

/* ── Tooltip ─────────────────────────────────────────────────────────────── */
function showTooltip(e, abbr, total) {
  const leagues = stateLeagues[abbr] || [];
  const clubs = stateClubs[abbr] || [];
  ttState.textContent = STATE_NAMES[abbr];
  let line = `${leagues.length} league${leagues.length !== 1 ? 's' : ''}`;
  if (clubs.length) line += ` · ${clubs.length} club${clubs.length !== 1 ? 's' : ''}`;
  ttCount.textContent = line;
  tooltip.style.display = 'block';
  tooltip.style.left = (e.clientX + 14) + 'px';
  tooltip.style.top = (e.clientY - 10) + 'px';
}

/* ── State selection ─────────────────────────────────────────────────────── */
function selectState(abbr) {
  if (selectedState) {
    const prev = svg.querySelector(`[data-abbr="${selectedState}"]`);
    if (prev) prev.classList.remove('selected');
  }
  selectedState = abbr;
  const el = svg.querySelector(`[data-abbr="${abbr}"]`);
  if (el) el.classList.add('selected');
  renderClubPins();
  showStatePanel(abbr);
}

function clearSelection() {
  if (selectedState) {
    const prev = svg.querySelector(`[data-abbr="${selectedState}"]`);
    if (prev) prev.classList.remove('selected');
    selectedState = null;
  }
  renderClubPins();
  panel.classList.remove('open');
}

/* ── State panel ─────────────────────────────────────────────────────────── */
function showStatePanel(abbr) {
  const leagues = stateLeagues[abbr] || [];
  const clubs = stateClubs[abbr] || [];
  panelTitle.textContent = STATE_NAMES[abbr];
  panel.classList.add('open');

  if (leagues.length === 0 && clubs.length === 0) {
    panelBody.innerHTML = `<div class="no-content"><div class="icon">🏈</div><p>No organizations recorded in ${STATE_NAMES[abbr]}.</p></div>`;
    return;
  }

  // Stats
  const totalRev = leagues.reduce((s, l) => s + (l.est_annual_revenue_usd || 0), 0);
  const fps = leagues.filter(l => l.business_type === 'FOR-PROFIT').length;
  const nps = leagues.filter(l => l.business_type === 'NONPROFIT').length;

  let html = `
  <div class="stat-row">
    <div class="stat-tile gold"><div class="big">${leagues.length}</div><div class="label">Leagues</div></div>
    <div class="stat-tile"><div class="big">${clubs.length || '–'}</div><div class="label">Clubs mapped</div></div>
  </div>
  <div class="stat-row">
    <div class="stat-tile green"><div class="big">${fps}</div><div class="label">For-Profit</div></div>
    <div class="stat-tile blue"><div class="big">${nps}</div><div class="label">Nonprofit</div></div>
  </div>
  <div class="stat-tile" style="margin-bottom:14px">
    <div class="big" style="font-size:1.3rem;color:var(--gold)">${totalRev ? fmtRev(totalRev) : '—'}</div>
    <div class="label">Combined est. annual revenue</div>
  </div>`;

  if (clubs.length) {
    html += `<div class="section-label">📍 Discovered Clubs (${clubs.length})</div>`;
    const sortedClubs = [...clubs].sort((a,b) => (a.city||'').localeCompare(b.city||''));
    sortedClubs.forEach(c => { html += renderClubCard(c); });
  }

  html += `<div class="section-label">🏟 Leagues (${leagues.length})</div>`;
  const sortedLeagues = [...leagues].sort((a,b) => (b.est_annual_revenue_usd||0) - (a.est_annual_revenue_usd||0));
  sortedLeagues.forEach(l => { html += renderLeagueCard(l); });

  panelBody.innerHTML = html;
}

/* ── Club detail view ────────────────────────────────────────────────────── */
function showClubDetail(club) {
  const league = club._league;
  panelTitle.textContent = club.club_name || club.city || 'Club';
  panel.classList.add('open');
  panelBody.innerHTML = `
  <div class="section-label">Club</div>
  <div class="club-card">
    <div class="cc-name">${esc(club.club_name || club.city || 'Unknown')}</div>
    <div class="cc-meta">
      📍 ${na(club.city)}${club.state ? ', ' + club.state : ''}<br>
      ${club.age_groups ? '👥 Ages: ' + esc(club.age_groups) + '<br>' : ''}
      ${club.contact ? '📞 ' + esc(club.contact) + '<br>' : ''}
      ${club.source_url ? `🔗 <a href="${esc(club.source_url)}" target="_blank" style="color:var(--gold)">Source page</a>` : ''}
    </div>
    <div class="club-parent">
      <strong>Parent League</strong><br>${esc(league?.name || 'Unknown')}
    </div>
  </div>
  ${league ? `<div class="section-label">Parent League Investor Data</div>${renderLeagueCard(league)}` : ''}
  <button onclick="showStatePanel('${club.state}')" style="margin-top:12px;background:none;border:1px solid var(--border);color:var(--muted);padding:6px 14px;border-radius:4px;cursor:pointer;font-size:.78rem;width:100%">
    ← Back to ${STATE_NAMES[club.state] || club.state}
  </button>`;
}

/* ── League card renderer ────────────────────────────────────────────────── */
function renderLeagueCard(l) {
  const rev = l.est_annual_revenue_usd ? fmtRev(l.est_annual_revenue_usd) : null;
  const discoveryMsg = {
    'clubs_found': null,
    'no_club_list_found': 'Individual locations not publicly listed on their site.',
    'unreachable': 'Website was unreachable during last pipeline run.',
    'fetch_not_attempted': 'Club discovery not yet run — see pipeline/README.md.',
    'no_website': 'No website on record.',
    'skipped': null,
  }[l.discovery_status] || null;

  const links = [];
  if (l.website) links.push(`<a href="${esc(l.website)}" target="_blank">🌐 Website</a>`);
  if (l.email) links.push(`<a href="mailto:${esc(l.email)}">✉ ${esc(l.email)}</a>`);
  if (l.phone) links.push(`<a href="tel:${esc(l.phone)}">📞 ${esc(l.phone)}</a>`);
  if (l.instagram_handle) links.push(`<a href="https://instagram.com/${esc(l.instagram_handle.replace('@',''))}" target="_blank">📷 ${esc(l.instagram_handle)}</a>`);

  const socialStr = [];
  if (l.instagram_followers) socialStr.push(`${l.instagram_followers.toLocaleString()} IG followers`);
  if (l.facebook_followers) socialStr.push(`${l.facebook_followers.toLocaleString()} FB followers`);

  return `<div class="league-card">
    <div class="lc-name">${esc(l.name)}</div>
    <div class="badge-row">
      <span class="badge ${l.business_type === 'FOR-PROFIT' ? 'badge-fp' : 'badge-np'}">${l.business_type === 'FOR-PROFIT' ? 'For-Profit' : 'Nonprofit'}</span>
      <span class="badge ${l.gender === 'Girls' ? 'badge-girls' : 'badge-coed'}">${esc(l.gender || 'Co-ed')}</span>
      ${l.is_national ? '<span class="badge badge-national">National</span>' : ''}
    </div>
    <div class="meta-row">
      ${l.city_region ? `<span>📍 ${esc(l.city_region)}</span>` : ''}
      ${l.founded ? `<span>📅 Est. ${esc(l.founded)}</span>` : ''}
      ${l.head_name ? `<span>👤 ${esc(l.head_name)}${l.head_title ? ', ' + esc(l.head_title) : ''}</span>` : ''}
    </div>
    ${socialStr.length ? `<div class="meta-row" style="margin-top:3px"><span>📊 ${socialStr.join(' · ')}</span></div>` : ''}
    ${rev ? `<div class="rev-line">💰 ${rev} est. annual revenue${l.revenue_notes ? ` <span class="rev-note">— ${esc(l.revenue_notes)}</span>` : ''}</div>` : ''}
    ${links.length ? `<div class="meta-row" style="margin-top:6px">${links.join(' ')}</div>` : ''}
    ${discoveryMsg ? `<div class="discovery-note">ℹ ${esc(discoveryMsg)}</div>` : ''}
    ${l.clubs && l.clubs.length ? `<div class="discovery-note" style="border-left-color:var(--gold);color:var(--gold)">✓ ${l.clubs.length} club${l.clubs.length!==1?'s':''} mapped</div>` : ''}
  </div>`;
}

/* ── Club card renderer ──────────────────────────────────────────────────── */
function renderClubCard(club) {
  return `<div class="club-card" onclick="showClubDetail(window._clubs_${club._id})">
    <div class="cc-name">${esc(club.club_name || club.city || 'Club')}</div>
    <div class="cc-meta">
      📍 ${esc(club.city || '')}${club.state ? ', ' + esc(club.state) : ''}
      ${club.age_groups ? ` · 👥 ${esc(club.age_groups)}` : ''}
    </div>
    <div class="club-parent">Parent: <strong>${esc(club._league?.name || '')}</strong></div>
  </div>`;
}

/* ── National operators overlay ──────────────────────────────────────────── */
function showNationalOverlay() {
  const body = document.getElementById('overlay-national-body');
  if (!body.dataset.rendered) {
    let html = `<p style="font-size:.8rem;color:var(--muted);margin-bottom:16px">
      These ${nationalLeagues.length} operators run programs in all 50 states or nationwide. They represent the highest-revenue tier of the market.
    </p>`;
    const sorted = [...nationalLeagues].sort((a,b) => (b.est_annual_revenue_usd||0) - (a.est_annual_revenue_usd||0));
    sorted.forEach(l => { html += renderLeagueCard(l); });
    body.innerHTML = html;
    body.dataset.rendered = '1';
  }
  overlayNational.classList.add('visible');
  btnNational.classList.add('active');
}
function hideNationalOverlay() {
  overlayNational.classList.remove('visible');
  btnNational.classList.remove('active');
}

/* ── Multi-state overlay ─────────────────────────────────────────────────── */
function showMultiOverlay() {
  const body = document.getElementById('overlay-multi-body');
  if (!body.dataset.rendered) {
    let html = `<p style="font-size:.8rem;color:var(--muted);margin-bottom:16px">
      These ${multiStateLeagues.length} operators cover multiple states without a complete state list on record. They are not assigned to individual state counts on the map.
    </p>`;
    const sorted = [...multiStateLeagues].sort((a,b) => (b.est_annual_revenue_usd||0) - (a.est_annual_revenue_usd||0));
    sorted.forEach(l => { html += renderLeagueCard(l); });
    body.innerHTML = html;
    body.dataset.rendered = '1';
  }
  overlayMulti.classList.add('visible');
  btnMulti.classList.add('active');
}
function hideMultiOverlay() {
  overlayMulti.classList.remove('visible');
  btnMulti.classList.remove('active');
}

/* ── Wire up events ──────────────────────────────────────────────────────── */
panelClose.addEventListener('click', clearSelection);
btnNational.addEventListener('click', showNationalOverlay);
btnMulti.addEventListener('click', showMultiOverlay);
document.getElementById('ov-nat-close').addEventListener('click', hideNationalOverlay);
document.getElementById('ov-multi-close').addEventListener('click', hideMultiOverlay);
// Close overlays on backdrop click
overlayNational.addEventListener('click', e => { if (e.target === overlayNational) hideNationalOverlay(); });
overlayMulti.addEventListener('click', e => { if (e.target === overlayMulti) hideMultiOverlay(); });

/* ── Start ───────────────────────────────────────────────────────────────── */
loadData();
