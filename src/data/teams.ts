export interface Team {
  name: string;
  code: string;
  flag: string;
  confederation: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'AFC' | 'CAF' | 'OFC';
  eloRating: number;
  attackStrength: number;
  defenseStrength: number;
  recentForm: number;
  fifaRank: number;
  cornersFor: number;       // avg corners won per match
  cornersConceded: number;  // avg corners conceded per match
  cardsFor: number;         // avg yellow cards received per match
  cardsAgainst: number;     // avg yellows opponent gets when playing this team
  group?: string;
}

export const WORLD_CUP_AVG_GOALS = 1.35;
export const WC_AVG_CORNERS_PER_TEAM = 4.75;   // 9.5 total per match
export const WC_AVG_CARDS_PER_TEAM = 1.50;     // 3.0 total per match

export const teams: Team[] = [
  // ─── UEFA ───────────────────────────────────────────────────────────────────
  { name: "Spain",          code: "ESP", flag: "🇪🇸", confederation: "UEFA",     eloRating: 2048, fifaRank: 1,  attackStrength: 1.85, defenseStrength: 0.62, recentForm: 0.85, cornersFor: 6.8, cornersConceded: 4.0, cardsFor: 1.2, cardsAgainst: 1.8 },
  { name: "France",         code: "FRA", flag: "🇫🇷", confederation: "UEFA",     eloRating: 2028, fifaRank: 2,  attackStrength: 1.80, defenseStrength: 0.65, recentForm: 0.80, cornersFor: 5.8, cornersConceded: 4.2, cardsFor: 1.5, cardsAgainst: 1.7 },
  { name: "England",        code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", confederation: "UEFA",     eloRating: 1992, fifaRank: 4,  attackStrength: 1.72, defenseStrength: 0.68, recentForm: 0.77, cornersFor: 5.8, cornersConceded: 4.5, cardsFor: 1.4, cardsAgainst: 1.6 },
  { name: "Germany",        code: "GER", flag: "🇩🇪", confederation: "UEFA",     eloRating: 1972, fifaRank: 5,  attackStrength: 1.68, defenseStrength: 0.72, recentForm: 0.75, cornersFor: 6.2, cornersConceded: 4.3, cardsFor: 1.5, cardsAgainst: 1.8 },
  { name: "Portugal",       code: "POR", flag: "🇵🇹", confederation: "UEFA",     eloRating: 1968, fifaRank: 6,  attackStrength: 1.75, defenseStrength: 0.74, recentForm: 0.78, cornersFor: 5.6, cornersConceded: 4.4, cardsFor: 1.6, cardsAgainst: 1.7 },
  { name: "Netherlands",    code: "NED", flag: "🇳🇱", confederation: "UEFA",     eloRating: 1958, fifaRank: 7,  attackStrength: 1.62, defenseStrength: 0.76, recentForm: 0.73, cornersFor: 5.7, cornersConceded: 4.4, cardsFor: 1.6, cardsAgainst: 1.9 },
  { name: "Belgium",        code: "BEL", flag: "🇧🇪", confederation: "UEFA",     eloRating: 1942, fifaRank: 8,  attackStrength: 1.58, defenseStrength: 0.78, recentForm: 0.70, cornersFor: 5.5, cornersConceded: 4.6, cardsFor: 1.7, cardsAgainst: 1.8 },
  { name: "Italy",          code: "ITA", flag: "🇮🇹", confederation: "UEFA",     eloRating: 1928, fifaRank: 9,  attackStrength: 1.45, defenseStrength: 0.75, recentForm: 0.68, cornersFor: 5.5, cornersConceded: 4.5, cardsFor: 1.8, cardsAgainst: 2.0 },
  { name: "Croatia",        code: "CRO", flag: "🇭🇷", confederation: "UEFA",     eloRating: 1912, fifaRank: 11, attackStrength: 1.42, defenseStrength: 0.80, recentForm: 0.67, cornersFor: 4.3, cornersConceded: 5.8, cardsFor: 1.9, cardsAgainst: 2.0 },
  { name: "Switzerland",    code: "SUI", flag: "🇨🇭", confederation: "UEFA",     eloRating: 1895, fifaRank: 13, attackStrength: 1.35, defenseStrength: 0.82, recentForm: 0.65, cornersFor: 4.8, cornersConceded: 5.0, cardsFor: 1.3, cardsAgainst: 1.6 },
  { name: "Austria",        code: "AUT", flag: "🇦🇹", confederation: "UEFA",     eloRating: 1882, fifaRank: 14, attackStrength: 1.38, defenseStrength: 0.88, recentForm: 0.68, cornersFor: 5.0, cornersConceded: 4.8, cardsFor: 1.6, cardsAgainst: 1.8 },
  { name: "Denmark",        code: "DEN", flag: "🇩🇰", confederation: "UEFA",     eloRating: 1875, fifaRank: 16, attackStrength: 1.30, defenseStrength: 0.85, recentForm: 0.63, cornersFor: 5.2, cornersConceded: 4.8, cardsFor: 1.4, cardsAgainst: 1.6 },
  { name: "Turkey",         code: "TUR", flag: "🇹🇷", confederation: "UEFA",     eloRating: 1868, fifaRank: 17, attackStrength: 1.32, defenseStrength: 0.92, recentForm: 0.62, cornersFor: 4.8, cornersConceded: 5.2, cardsFor: 2.2, cardsAgainst: 2.0 },
  { name: "Serbia",         code: "SRB", flag: "🇷🇸", confederation: "UEFA",     eloRating: 1855, fifaRank: 19, attackStrength: 1.28, defenseStrength: 0.95, recentForm: 0.60, cornersFor: 4.5, cornersConceded: 5.5, cardsFor: 2.0, cardsAgainst: 1.9 },
  { name: "Scotland",       code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", confederation: "UEFA",     eloRating: 1842, fifaRank: 22, attackStrength: 1.22, defenseStrength: 0.98, recentForm: 0.58, cornersFor: 4.8, cornersConceded: 5.2, cardsFor: 1.7, cardsAgainst: 1.8 },
  { name: "Ukraine",        code: "UKR", flag: "🇺🇦", confederation: "UEFA",     eloRating: 1838, fifaRank: 23, attackStrength: 1.20, defenseStrength: 0.96, recentForm: 0.55, cornersFor: 4.7, cornersConceded: 5.0, cardsFor: 1.6, cardsAgainst: 1.7 },
  { name: "Hungary",        code: "HUN", flag: "🇭🇺", confederation: "UEFA",     eloRating: 1825, fifaRank: 25, attackStrength: 1.18, defenseStrength: 1.02, recentForm: 0.60, cornersFor: 4.5, cornersConceded: 5.3, cardsFor: 1.8, cardsAgainst: 1.9 },
  { name: "Czech Republic", code: "CZE", flag: "🇨🇿", confederation: "UEFA",     eloRating: 1820, fifaRank: 26, attackStrength: 1.15, defenseStrength: 1.00, recentForm: 0.57, cornersFor: 4.6, cornersConceded: 5.1, cardsFor: 1.7, cardsAgainst: 1.8 },
  { name: "Slovakia",       code: "SVK", flag: "🇸🇰", confederation: "UEFA",     eloRating: 1810, fifaRank: 28, attackStrength: 1.10, defenseStrength: 1.05, recentForm: 0.55, cornersFor: 4.2, cornersConceded: 5.4, cardsFor: 1.8, cardsAgainst: 1.9 },
  // ─── CONMEBOL ───────────────────────────────────────────────────────────────
  { name: "Argentina",      code: "ARG", flag: "🇦🇷", confederation: "CONMEBOL", eloRating: 2038, fifaRank: 3,  attackStrength: 1.78, defenseStrength: 0.62, recentForm: 0.82, cornersFor: 5.5, cornersConceded: 4.2, cardsFor: 1.8, cardsAgainst: 2.0 },
  { name: "Brazil",         code: "BRA", flag: "🇧🇷", confederation: "CONMEBOL", eloRating: 1988, fifaRank: 5,  attackStrength: 1.82, defenseStrength: 0.60, recentForm: 0.78, cornersFor: 6.2, cornersConceded: 4.0, cardsFor: 1.6, cardsAgainst: 1.9 },
  { name: "Colombia",       code: "COL", flag: "🇨🇴", confederation: "CONMEBOL", eloRating: 1905, fifaRank: 10, attackStrength: 1.48, defenseStrength: 0.84, recentForm: 0.72, cornersFor: 5.0, cornersConceded: 4.8, cardsFor: 1.9, cardsAgainst: 2.1 },
  { name: "Uruguay",        code: "URU", flag: "🇺🇾", confederation: "CONMEBOL", eloRating: 1875, fifaRank: 15, attackStrength: 1.35, defenseStrength: 0.86, recentForm: 0.65, cornersFor: 4.5, cornersConceded: 5.2, cardsFor: 2.1, cardsAgainst: 2.2 },
  { name: "Ecuador",        code: "ECU", flag: "🇪🇨", confederation: "CONMEBOL", eloRating: 1838, fifaRank: 24, attackStrength: 1.22, defenseStrength: 1.02, recentForm: 0.60, cornersFor: 4.3, cornersConceded: 5.2, cardsFor: 1.8, cardsAgainst: 1.9 },
  { name: "Venezuela",      code: "VEN", flag: "🇻🇪", confederation: "CONMEBOL", eloRating: 1798, fifaRank: 30, attackStrength: 1.12, defenseStrength: 1.10, recentForm: 0.58, cornersFor: 4.0, cornersConceded: 5.5, cardsFor: 1.9, cardsAgainst: 2.0 },
  // ─── CONCACAF ───────────────────────────────────────────────────────────────
  { name: "USA",            code: "USA", flag: "🇺🇸", confederation: "CONCACAF", eloRating: 1892, fifaRank: 12, attackStrength: 1.40, defenseStrength: 0.90, recentForm: 0.68, cornersFor: 5.2, cornersConceded: 4.8, cardsFor: 1.5, cardsAgainst: 1.7 },
  { name: "Mexico",         code: "MEX", flag: "🇲🇽", confederation: "CONCACAF", eloRating: 1872, fifaRank: 18, attackStrength: 1.35, defenseStrength: 0.95, recentForm: 0.65, cornersFor: 4.8, cornersConceded: 5.0, cardsFor: 1.8, cardsAgainst: 2.0 },
  { name: "Canada",         code: "CAN", flag: "🇨🇦", confederation: "CONCACAF", eloRating: 1845, fifaRank: 20, attackStrength: 1.28, defenseStrength: 0.98, recentForm: 0.63, cornersFor: 5.0, cornersConceded: 4.8, cardsFor: 1.5, cardsAgainst: 1.6 },
  { name: "Jamaica",        code: "JAM", flag: "🇯🇲", confederation: "CONCACAF", eloRating: 1752, fifaRank: 38, attackStrength: 0.98, defenseStrength: 1.20, recentForm: 0.48, cornersFor: 3.8, cornersConceded: 5.8, cardsFor: 2.0, cardsAgainst: 1.8 },
  { name: "Honduras",       code: "HON", flag: "🇭🇳", confederation: "CONCACAF", eloRating: 1720, fifaRank: 45, attackStrength: 0.88, defenseStrength: 1.28, recentForm: 0.45, cornersFor: 3.5, cornersConceded: 6.0, cardsFor: 2.2, cardsAgainst: 1.9 },
  { name: "Panama",         code: "PAN", flag: "🇵🇦", confederation: "CONCACAF", eloRating: 1738, fifaRank: 40, attackStrength: 0.92, defenseStrength: 1.22, recentForm: 0.47, cornersFor: 3.8, cornersConceded: 5.8, cardsFor: 2.1, cardsAgainst: 1.8 },
  // ─── AFC ────────────────────────────────────────────────────────────────────
  { name: "Japan",          code: "JPN", flag: "🇯🇵", confederation: "AFC",      eloRating: 1892, fifaRank: 12, attackStrength: 1.45, defenseStrength: 0.82, recentForm: 0.72, cornersFor: 5.5, cornersConceded: 4.5, cardsFor: 1.2, cardsAgainst: 1.5 },
  { name: "South Korea",    code: "KOR", flag: "🇰🇷", confederation: "AFC",      eloRating: 1848, fifaRank: 21, attackStrength: 1.28, defenseStrength: 0.95, recentForm: 0.63, cornersFor: 5.0, cornersConceded: 4.8, cardsFor: 1.3, cardsAgainst: 1.6 },
  { name: "Iran",           code: "IRN", flag: "🇮🇷", confederation: "AFC",      eloRating: 1822, fifaRank: 27, attackStrength: 1.18, defenseStrength: 0.98, recentForm: 0.60, cornersFor: 3.8, cornersConceded: 6.2, cardsFor: 2.0, cardsAgainst: 2.1 },
  { name: "Australia",      code: "AUS", flag: "🇦🇺", confederation: "AFC",      eloRating: 1808, fifaRank: 29, attackStrength: 1.15, defenseStrength: 1.02, recentForm: 0.57, cornersFor: 4.5, cornersConceded: 5.2, cardsFor: 1.7, cardsAgainst: 1.8 },
  { name: "Saudi Arabia",   code: "KSA", flag: "🇸🇦", confederation: "AFC",      eloRating: 1778, fifaRank: 34, attackStrength: 1.05, defenseStrength: 1.12, recentForm: 0.52, cornersFor: 4.0, cornersConceded: 5.8, cardsFor: 1.9, cardsAgainst: 2.0 },
  { name: "Uzbekistan",     code: "UZB", flag: "🇺🇿", confederation: "AFC",      eloRating: 1748, fifaRank: 39, attackStrength: 0.95, defenseStrength: 1.18, recentForm: 0.50, cornersFor: 3.8, cornersConceded: 5.8, cardsFor: 1.8, cardsAgainst: 1.8 },
  { name: "Jordan",         code: "JOR", flag: "🇯🇴", confederation: "AFC",      eloRating: 1728, fifaRank: 42, attackStrength: 0.88, defenseStrength: 1.25, recentForm: 0.47, cornersFor: 3.5, cornersConceded: 6.0, cardsFor: 2.0, cardsAgainst: 2.0 },
  { name: "Iraq",           code: "IRQ", flag: "🇮🇶", confederation: "AFC",      eloRating: 1715, fifaRank: 47, attackStrength: 0.85, defenseStrength: 1.28, recentForm: 0.45, cornersFor: 3.5, cornersConceded: 6.0, cardsFor: 2.1, cardsAgainst: 2.1 },
  // ─── CAF ────────────────────────────────────────────────────────────────────
  { name: "Morocco",        code: "MAR", flag: "🇲🇦", confederation: "CAF",      eloRating: 1918, fifaRank: 10, attackStrength: 1.48, defenseStrength: 0.72, recentForm: 0.72, cornersFor: 4.5, cornersConceded: 5.8, cardsFor: 1.7, cardsAgainst: 2.1 },
  { name: "Senegal",        code: "SEN", flag: "🇸🇳", confederation: "CAF",      eloRating: 1882, fifaRank: 16, attackStrength: 1.38, defenseStrength: 0.85, recentForm: 0.67, cornersFor: 4.8, cornersConceded: 5.2, cardsFor: 1.8, cardsAgainst: 2.0 },
  { name: "Egypt",          code: "EGY", flag: "🇪🇬", confederation: "CAF",      eloRating: 1855, fifaRank: 20, attackStrength: 1.28, defenseStrength: 0.88, recentForm: 0.63, cornersFor: 4.5, cornersConceded: 5.5, cardsFor: 1.9, cardsAgainst: 2.0 },
  { name: "Nigeria",        code: "NGA", flag: "🇳🇬", confederation: "CAF",      eloRating: 1838, fifaRank: 24, attackStrength: 1.30, defenseStrength: 0.95, recentForm: 0.60, cornersFor: 4.8, cornersConceded: 5.2, cardsFor: 1.9, cardsAgainst: 2.1 },
  { name: "Cameroon",       code: "CMR", flag: "🇨🇲", confederation: "CAF",      eloRating: 1812, fifaRank: 28, attackStrength: 1.22, defenseStrength: 1.02, recentForm: 0.57, cornersFor: 4.3, cornersConceded: 5.5, cardsFor: 2.0, cardsAgainst: 2.2 },
  { name: "Algeria",        code: "ALG", flag: "🇩🇿", confederation: "CAF",      eloRating: 1808, fifaRank: 30, attackStrength: 1.18, defenseStrength: 1.05, recentForm: 0.57, cornersFor: 4.5, cornersConceded: 5.3, cardsFor: 1.9, cardsAgainst: 2.0 },
  { name: "Ivory Coast",    code: "CIV", flag: "🇨🇮", confederation: "CAF",      eloRating: 1798, fifaRank: 32, attackStrength: 1.15, defenseStrength: 1.08, recentForm: 0.55, cornersFor: 4.5, cornersConceded: 5.3, cardsFor: 1.9, cardsAgainst: 2.1 },
  { name: "Ghana",          code: "GHA", flag: "🇬🇭", confederation: "CAF",      eloRating: 1782, fifaRank: 35, attackStrength: 1.10, defenseStrength: 1.12, recentForm: 0.52, cornersFor: 4.2, cornersConceded: 5.5, cardsFor: 2.0, cardsAgainst: 2.1 },
  { name: "South Africa",   code: "RSA", flag: "🇿🇦", confederation: "CAF",      eloRating: 1748, fifaRank: 42, attackStrength: 0.95, defenseStrength: 1.20, recentForm: 0.48, cornersFor: 3.8, cornersConceded: 5.8, cardsFor: 2.0, cardsAgainst: 2.0 },
  // ─── OFC ────────────────────────────────────────────────────────────────────
  { name: "New Zealand",    code: "NZL", flag: "🇳🇿", confederation: "OFC",      eloRating: 1702, fifaRank: 98, attackStrength: 0.72, defenseStrength: 1.42, recentForm: 0.42, cornersFor: 3.5, cornersConceded: 6.2, cardsFor: 1.6, cardsAgainst: 1.7 },
];

export const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));
