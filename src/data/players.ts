export interface Player {
  name: string;
  teamCode: string;
  position: 'FWD' | 'MID' | 'DEF';
  // fraction of team xG this player contributes (all players sum to ~1)
  xGShare: number;
  // goals per 90 mins for club+country over last 2 seasons
  goalsPerGame: number;
}

// Key scorers for all 48 World Cup 2026 nations
export const players: Player[] = [
  // ── England ──────────────────────────────────────────────
  { name: "Harry Kane",        teamCode: "ENG", position: "FWD", xGShare: 0.34, goalsPerGame: 0.62 },
  { name: "Bukayo Saka",       teamCode: "ENG", position: "MID", xGShare: 0.18, goalsPerGame: 0.30 },
  { name: "Jude Bellingham",   teamCode: "ENG", position: "MID", xGShare: 0.17, goalsPerGame: 0.28 },
  { name: "Phil Foden",        teamCode: "ENG", position: "MID", xGShare: 0.14, goalsPerGame: 0.24 },
  { name: "Cole Palmer",       teamCode: "ENG", position: "MID", xGShare: 0.11, goalsPerGame: 0.20 },
  // ── Croatia ──────────────────────────────────────────────
  { name: "Andrej Kramarić",   teamCode: "CRO", position: "FWD", xGShare: 0.38, goalsPerGame: 0.40 },
  { name: "Bruno Petković",    teamCode: "CRO", position: "FWD", xGShare: 0.22, goalsPerGame: 0.25 },
  { name: "Marko Livaja",      teamCode: "CRO", position: "FWD", xGShare: 0.18, goalsPerGame: 0.22 },
  { name: "Mateo Kovačić",     teamCode: "CRO", position: "MID", xGShare: 0.10, goalsPerGame: 0.12 },
  { name: "Luka Modrić",       teamCode: "CRO", position: "MID", xGShare: 0.07, goalsPerGame: 0.08 },
  // ── France ───────────────────────────────────────────────
  { name: "Kylian Mbappé",     teamCode: "FRA", position: "FWD", xGShare: 0.38, goalsPerGame: 0.72 },
  { name: "Antoine Griezmann", teamCode: "FRA", position: "FWD", xGShare: 0.22, goalsPerGame: 0.38 },
  { name: "Ousmane Dembélé",   teamCode: "FRA", position: "FWD", xGShare: 0.16, goalsPerGame: 0.25 },
  { name: "Marcus Thuram",     teamCode: "FRA", position: "FWD", xGShare: 0.14, goalsPerGame: 0.22 },
  { name: "Randal Kolo Muani", teamCode: "FRA", position: "FWD", xGShare: 0.08, goalsPerGame: 0.18 },
  // ── Spain ────────────────────────────────────────────────
  { name: "Álvaro Morata",     teamCode: "ESP", position: "FWD", xGShare: 0.28, goalsPerGame: 0.42 },
  { name: "Lamine Yamal",      teamCode: "ESP", position: "FWD", xGShare: 0.22, goalsPerGame: 0.30 },
  { name: "Ferran Torres",     teamCode: "ESP", position: "FWD", xGShare: 0.18, goalsPerGame: 0.28 },
  { name: "Mikel Oyarzabal",   teamCode: "ESP", position: "FWD", xGShare: 0.16, goalsPerGame: 0.26 },
  { name: "Pedri",             teamCode: "ESP", position: "MID", xGShare: 0.10, goalsPerGame: 0.14 },
  // ── Germany ──────────────────────────────────────────────
  { name: "Kai Havertz",       teamCode: "GER", position: "FWD", xGShare: 0.28, goalsPerGame: 0.38 },
  { name: "Florian Wirtz",     teamCode: "GER", position: "MID", xGShare: 0.24, goalsPerGame: 0.32 },
  { name: "Jamal Musiala",     teamCode: "GER", position: "MID", xGShare: 0.20, goalsPerGame: 0.28 },
  { name: "Leroy Sané",        teamCode: "GER", position: "FWD", xGShare: 0.16, goalsPerGame: 0.24 },
  { name: "Thomas Müller",     teamCode: "GER", position: "FWD", xGShare: 0.08, goalsPerGame: 0.18 },
  // ── Portugal ─────────────────────────────────────────────
  { name: "Cristiano Ronaldo", teamCode: "POR", position: "FWD", xGShare: 0.35, goalsPerGame: 0.58 },
  { name: "Bruno Fernandes",   teamCode: "POR", position: "MID", xGShare: 0.22, goalsPerGame: 0.35 },
  { name: "Rafael Leão",       teamCode: "POR", position: "FWD", xGShare: 0.18, goalsPerGame: 0.28 },
  { name: "João Félix",        teamCode: "POR", position: "FWD", xGShare: 0.14, goalsPerGame: 0.22 },
  { name: "Diogo Jota",        teamCode: "POR", position: "FWD", xGShare: 0.08, goalsPerGame: 0.30 },
  // ── Netherlands ──────────────────────────────────────────
  { name: "Cody Gakpo",        teamCode: "NED", position: "FWD", xGShare: 0.30, goalsPerGame: 0.40 },
  { name: "Xavi Simons",       teamCode: "NED", position: "MID", xGShare: 0.22, goalsPerGame: 0.28 },
  { name: "Brian Brobbey",     teamCode: "NED", position: "FWD", xGShare: 0.20, goalsPerGame: 0.32 },
  { name: "Wout Weghorst",     teamCode: "NED", position: "FWD", xGShare: 0.14, goalsPerGame: 0.22 },
  { name: "Tijjani Reijnders", teamCode: "NED", position: "MID", xGShare: 0.10, goalsPerGame: 0.15 },
  // ── Belgium ──────────────────────────────────────────────
  { name: "Romelu Lukaku",     teamCode: "BEL", position: "FWD", xGShare: 0.38, goalsPerGame: 0.52 },
  { name: "Kevin De Bruyne",   teamCode: "BEL", position: "MID", xGShare: 0.18, goalsPerGame: 0.22 },
  { name: "Dodi Lukebakio",    teamCode: "BEL", position: "FWD", xGShare: 0.18, goalsPerGame: 0.25 },
  { name: "Leandro Trossard",  teamCode: "BEL", position: "FWD", xGShare: 0.14, goalsPerGame: 0.22 },
  { name: "C. De Ketelaere",   teamCode: "BEL", position: "MID", xGShare: 0.10, goalsPerGame: 0.18 },
  // ── Italy ────────────────────────────────────────────────
  { name: "Mateo Retegui",     teamCode: "ITA", position: "FWD", xGShare: 0.32, goalsPerGame: 0.45 },
  { name: "Gianluca Scamacca", teamCode: "ITA", position: "FWD", xGShare: 0.24, goalsPerGame: 0.35 },
  { name: "Federico Chiesa",   teamCode: "ITA", position: "FWD", xGShare: 0.18, goalsPerGame: 0.25 },
  { name: "Nicolò Barella",    teamCode: "ITA", position: "MID", xGShare: 0.12, goalsPerGame: 0.15 },
  { name: "Lorenzo Pellegrini",teamCode: "ITA", position: "MID", xGShare: 0.10, goalsPerGame: 0.14 },
  // ── Argentina ────────────────────────────────────────────
  { name: "Lionel Messi",      teamCode: "ARG", position: "FWD", xGShare: 0.32, goalsPerGame: 0.60 },
  { name: "Lautaro Martínez",  teamCode: "ARG", position: "FWD", xGShare: 0.28, goalsPerGame: 0.52 },
  { name: "Julián Álvarez",    teamCode: "ARG", position: "FWD", xGShare: 0.20, goalsPerGame: 0.38 },
  { name: "Paulo Dybala",      teamCode: "ARG", position: "FWD", xGShare: 0.12, goalsPerGame: 0.30 },
  { name: "Enzo Fernández",    teamCode: "ARG", position: "MID", xGShare: 0.06, goalsPerGame: 0.12 },
  // ── Brazil ───────────────────────────────────────────────
  { name: "Vinícius Jr.",      teamCode: "BRA", position: "FWD", xGShare: 0.32, goalsPerGame: 0.52 },
  { name: "Rodrygo",           teamCode: "BRA", position: "FWD", xGShare: 0.22, goalsPerGame: 0.35 },
  { name: "Raphinha",          teamCode: "BRA", position: "FWD", xGShare: 0.20, goalsPerGame: 0.32 },
  { name: "Endrick",           teamCode: "BRA", position: "FWD", xGShare: 0.16, goalsPerGame: 0.30 },
  { name: "G. Martinelli",     teamCode: "BRA", position: "FWD", xGShare: 0.08, goalsPerGame: 0.22 },
  // ── Colombia ─────────────────────────────────────────────
  { name: "Luis Díaz",         teamCode: "COL", position: "FWD", xGShare: 0.32, goalsPerGame: 0.42 },
  { name: "James Rodríguez",   teamCode: "COL", position: "MID", xGShare: 0.22, goalsPerGame: 0.28 },
  { name: "Jhon Durán",        teamCode: "COL", position: "FWD", xGShare: 0.20, goalsPerGame: 0.38 },
  { name: "Cucho Hernández",   teamCode: "COL", position: "FWD", xGShare: 0.16, goalsPerGame: 0.30 },
  { name: "R. Borré",          teamCode: "COL", position: "FWD", xGShare: 0.08, goalsPerGame: 0.20 },
  // ── Uruguay ──────────────────────────────────────────────
  { name: "Darwin Núñez",      teamCode: "URU", position: "FWD", xGShare: 0.40, goalsPerGame: 0.48 },
  { name: "Federico Valverde", teamCode: "URU", position: "MID", xGShare: 0.18, goalsPerGame: 0.20 },
  { name: "Maximiliano Araújo",teamCode: "URU", position: "FWD", xGShare: 0.16, goalsPerGame: 0.22 },
  { name: "Rodrigo Bentancur", teamCode: "URU", position: "MID", xGShare: 0.12, goalsPerGame: 0.14 },
  { name: "Facundo Pellistri", teamCode: "URU", position: "FWD", xGShare: 0.10, goalsPerGame: 0.18 },
  // ── Ecuador ──────────────────────────────────────────────
  { name: "Enner Valencia",    teamCode: "ECU", position: "FWD", xGShare: 0.40, goalsPerGame: 0.42 },
  { name: "Michael Estrada",   teamCode: "ECU", position: "FWD", xGShare: 0.24, goalsPerGame: 0.28 },
  { name: "Jeremy Sarmiento",  teamCode: "ECU", position: "FWD", xGShare: 0.18, goalsPerGame: 0.20 },
  { name: "Moisés Caicedo",    teamCode: "ECU", position: "MID", xGShare: 0.10, goalsPerGame: 0.10 },
  { name: "Ángel Mena",        teamCode: "ECU", position: "FWD", xGShare: 0.06, goalsPerGame: 0.18 },
  // ── Venezuela ────────────────────────────────────────────
  { name: "Yangel Herrera",    teamCode: "VEN", position: "MID", xGShare: 0.28, goalsPerGame: 0.22 },
  { name: "Salomón Rondón",    teamCode: "VEN", position: "FWD", xGShare: 0.30, goalsPerGame: 0.28 },
  { name: "Jan-Carlo Simón",   teamCode: "VEN", position: "MID", xGShare: 0.18, goalsPerGame: 0.16 },
  { name: "Edson Castillo",    teamCode: "VEN", position: "MID", xGShare: 0.12, goalsPerGame: 0.12 },
  { name: "Yeferson Soteldo",  teamCode: "VEN", position: "FWD", xGShare: 0.10, goalsPerGame: 0.15 },
  // ── USA ──────────────────────────────────────────────────
  { name: "Christian Pulisic", teamCode: "USA", position: "FWD", xGShare: 0.32, goalsPerGame: 0.38 },
  { name: "Folarin Balogun",   teamCode: "USA", position: "FWD", xGShare: 0.24, goalsPerGame: 0.35 },
  { name: "Gio Reyna",         teamCode: "USA", position: "MID", xGShare: 0.18, goalsPerGame: 0.22 },
  { name: "Ricardo Pepi",      teamCode: "USA", position: "FWD", xGShare: 0.14, goalsPerGame: 0.28 },
  { name: "Brenden Aaronson",  teamCode: "USA", position: "MID", xGShare: 0.10, goalsPerGame: 0.15 },
  // ── Mexico ───────────────────────────────────────────────
  { name: "Santiago Giménez",  teamCode: "MEX", position: "FWD", xGShare: 0.36, goalsPerGame: 0.50 },
  { name: "Hirving Lozano",    teamCode: "MEX", position: "FWD", xGShare: 0.24, goalsPerGame: 0.30 },
  { name: "Raúl Jiménez",      teamCode: "MEX", position: "FWD", xGShare: 0.20, goalsPerGame: 0.32 },
  { name: "Alexis Vega",       teamCode: "MEX", position: "FWD", xGShare: 0.12, goalsPerGame: 0.18 },
  { name: "Edson Álvarez",     teamCode: "MEX", position: "MID", xGShare: 0.06, goalsPerGame: 0.08 },
  // ── Canada ───────────────────────────────────────────────
  { name: "Alphonso Davies",   teamCode: "CAN", position: "DEF", xGShare: 0.18, goalsPerGame: 0.18 },
  { name: "Jonathan David",    teamCode: "CAN", position: "FWD", xGShare: 0.36, goalsPerGame: 0.55 },
  { name: "Cyle Larin",        teamCode: "CAN", position: "FWD", xGShare: 0.22, goalsPerGame: 0.30 },
  { name: "Tajon Buchanan",    teamCode: "CAN", position: "FWD", xGShare: 0.14, goalsPerGame: 0.18 },
  { name: "Liam Millar",       teamCode: "CAN", position: "FWD", xGShare: 0.08, goalsPerGame: 0.14 },
  // ── Jamaica ──────────────────────────────────────────────
  { name: "Michail Antonio",   teamCode: "JAM", position: "FWD", xGShare: 0.35, goalsPerGame: 0.32 },
  { name: "Shamar Nicholson",  teamCode: "JAM", position: "FWD", xGShare: 0.28, goalsPerGame: 0.28 },
  { name: "Bobby Reid",        teamCode: "JAM", position: "MID", xGShare: 0.20, goalsPerGame: 0.18 },
  { name: "Leon Bailey",       teamCode: "JAM", position: "FWD", xGShare: 0.12, goalsPerGame: 0.20 },
  { name: "Lamar Walker",      teamCode: "JAM", position: "MID", xGShare: 0.05, goalsPerGame: 0.08 },
  // ── Honduras ─────────────────────────────────────────────
  { name: "Alberth Elis",      teamCode: "HON", position: "FWD", xGShare: 0.35, goalsPerGame: 0.30 },
  { name: "Romell Quioto",     teamCode: "HON", position: "FWD", xGShare: 0.28, goalsPerGame: 0.22 },
  { name: "Jonathan Rubio",    teamCode: "HON", position: "FWD", xGShare: 0.20, goalsPerGame: 0.18 },
  { name: "Boniek García",     teamCode: "HON", position: "MID", xGShare: 0.10, goalsPerGame: 0.10 },
  { name: "Luis Palma",        teamCode: "HON", position: "FWD", xGShare: 0.07, goalsPerGame: 0.12 },
  // ── Panama ───────────────────────────────────────────────
  { name: "Ismael Díaz",       teamCode: "PAN", position: "FWD", xGShare: 0.32, goalsPerGame: 0.28 },
  { name: "Rolando Blackburn", teamCode: "PAN", position: "FWD", xGShare: 0.26, goalsPerGame: 0.22 },
  { name: "Alberto Quintero",  teamCode: "PAN", position: "FWD", xGShare: 0.20, goalsPerGame: 0.18 },
  { name: "Edgar Bárcenas",    teamCode: "PAN", position: "MID", xGShare: 0.12, goalsPerGame: 0.12 },
  { name: "Cecilio Waterman",  teamCode: "PAN", position: "FWD", xGShare: 0.08, goalsPerGame: 0.16 },
  // ── Japan ────────────────────────────────────────────────
  { name: "Kaoru Mitoma",      teamCode: "JPN", position: "FWD", xGShare: 0.28, goalsPerGame: 0.38 },
  { name: "Ayase Ueda",        teamCode: "JPN", position: "FWD", xGShare: 0.26, goalsPerGame: 0.42 },
  { name: "Ritsu Doan",        teamCode: "JPN", position: "FWD", xGShare: 0.20, goalsPerGame: 0.28 },
  { name: "Daichi Kamada",     teamCode: "JPN", position: "MID", xGShare: 0.14, goalsPerGame: 0.20 },
  { name: "Takumi Minamino",   teamCode: "JPN", position: "FWD", xGShare: 0.10, goalsPerGame: 0.18 },
  // ── South Korea ──────────────────────────────────────────
  { name: "Son Heung-min",     teamCode: "KOR", position: "FWD", xGShare: 0.42, goalsPerGame: 0.55 },
  { name: "Hwang Hee-chan",     teamCode: "KOR", position: "FWD", xGShare: 0.24, goalsPerGame: 0.30 },
  { name: "Cho Gue-sung",      teamCode: "KOR", position: "FWD", xGShare: 0.18, goalsPerGame: 0.28 },
  { name: "Lee Jae-sung",      teamCode: "KOR", position: "MID", xGShare: 0.10, goalsPerGame: 0.14 },
  { name: "Hwang In-beom",     teamCode: "KOR", position: "MID", xGShare: 0.05, goalsPerGame: 0.08 },
  // ── Iran ─────────────────────────────────────────────────
  { name: "Mehdi Taremi",      teamCode: "IRN", position: "FWD", xGShare: 0.44, goalsPerGame: 0.50 },
  { name: "Sardar Azmoun",     teamCode: "IRN", position: "FWD", xGShare: 0.28, goalsPerGame: 0.40 },
  { name: "Alireza Jahanbakhsh",teamCode:"IRN", position: "FWD", xGShare: 0.16, goalsPerGame: 0.20 },
  { name: "Karim Ansarifard",  teamCode: "IRN", position: "FWD", xGShare: 0.08, goalsPerGame: 0.14 },
  { name: "Ali Gholizadeh",    teamCode: "IRN", position: "MID", xGShare: 0.04, goalsPerGame: 0.10 },
  // ── Australia ────────────────────────────────────────────
  { name: "Mathew Leckie",     teamCode: "AUS", position: "FWD", xGShare: 0.28, goalsPerGame: 0.25 },
  { name: "Mitchell Duke",     teamCode: "AUS", position: "FWD", xGShare: 0.26, goalsPerGame: 0.28 },
  { name: "Jamie Maclaren",    teamCode: "AUS", position: "FWD", xGShare: 0.22, goalsPerGame: 0.30 },
  { name: "Ajdin Hrustic",     teamCode: "AUS", position: "MID", xGShare: 0.14, goalsPerGame: 0.15 },
  { name: "Jackson Irvine",    teamCode: "AUS", position: "MID", xGShare: 0.08, goalsPerGame: 0.10 },
  // ── Saudi Arabia ─────────────────────────────────────────
  { name: "Salem Al-Dawsari",  teamCode: "KSA", position: "FWD", xGShare: 0.36, goalsPerGame: 0.35 },
  { name: "Firas Al-Buraikan", teamCode: "KSA", position: "FWD", xGShare: 0.28, goalsPerGame: 0.28 },
  { name: "M. Al-Shehri",      teamCode: "KSA", position: "FWD", xGShare: 0.20, goalsPerGame: 0.22 },
  { name: "Saleh Al-Shehri",   teamCode: "KSA", position: "FWD", xGShare: 0.10, goalsPerGame: 0.15 },
  { name: "Abdullah Radif",    teamCode: "KSA", position: "MID", xGShare: 0.05, goalsPerGame: 0.08 },
  // ── Uzbekistan ───────────────────────────────────────────
  { name: "Eldor Shomurodov",  teamCode: "UZB", position: "FWD", xGShare: 0.40, goalsPerGame: 0.38 },
  { name: "Bobur Abdixoliqov", teamCode: "UZB", position: "FWD", xGShare: 0.24, goalsPerGame: 0.22 },
  { name: "J. Masharipov",     teamCode: "UZB", position: "MID", xGShare: 0.18, goalsPerGame: 0.16 },
  { name: "Dostonbek Khamdamov",teamCode:"UZB", position: "FWD", xGShare: 0.12, goalsPerGame: 0.14 },
  { name: "Otabek Shukurov",   teamCode: "UZB", position: "MID", xGShare: 0.06, goalsPerGame: 0.08 },
  // ── Jordan ───────────────────────────────────────────────
  { name: "Musa Al-Taamari",   teamCode: "JOR", position: "FWD", xGShare: 0.40, goalsPerGame: 0.32 },
  { name: "Yazan Al-Naimat",   teamCode: "JOR", position: "FWD", xGShare: 0.28, goalsPerGame: 0.24 },
  { name: "Baha Faisal",       teamCode: "JOR", position: "MID", xGShare: 0.18, goalsPerGame: 0.14 },
  { name: "Islam Batran",      teamCode: "JOR", position: "MID", xGShare: 0.10, goalsPerGame: 0.10 },
  { name: "Mahmoud Alramadan", teamCode: "JOR", position: "FWD", xGShare: 0.04, goalsPerGame: 0.10 },
  // ── Iraq ─────────────────────────────────────────────────
  { name: "Aymen Hussein",     teamCode: "IRQ", position: "FWD", xGShare: 0.38, goalsPerGame: 0.35 },
  { name: "Mohanad Ali",       teamCode: "IRQ", position: "FWD", xGShare: 0.26, goalsPerGame: 0.28 },
  { name: "Ahmed Yasin",       teamCode: "IRQ", position: "MID", xGShare: 0.18, goalsPerGame: 0.16 },
  { name: "Amjed Attwan",      teamCode: "IRQ", position: "FWD", xGShare: 0.12, goalsPerGame: 0.14 },
  { name: "Hussein Ali",       teamCode: "IRQ", position: "MID", xGShare: 0.06, goalsPerGame: 0.08 },
  // ── Morocco ──────────────────────────────────────────────
  { name: "Hakim Ziyech",      teamCode: "MAR", position: "FWD", xGShare: 0.28, goalsPerGame: 0.32 },
  { name: "Youssef En-Nesyri", teamCode: "MAR", position: "FWD", xGShare: 0.32, goalsPerGame: 0.42 },
  { name: "Sofiane Boufal",    teamCode: "MAR", position: "FWD", xGShare: 0.18, goalsPerGame: 0.20 },
  { name: "Achraf Hakimi",     teamCode: "MAR", position: "DEF", xGShare: 0.12, goalsPerGame: 0.14 },
  { name: "Azzedine Ounahi",   teamCode: "MAR", position: "MID", xGShare: 0.08, goalsPerGame: 0.10 },
  // ── Senegal ──────────────────────────────────────────────
  { name: "Sadio Mané",        teamCode: "SEN", position: "FWD", xGShare: 0.36, goalsPerGame: 0.50 },
  { name: "Ismaila Sarr",      teamCode: "SEN", position: "FWD", xGShare: 0.24, goalsPerGame: 0.30 },
  { name: "Boulaye Dia",       teamCode: "SEN", position: "FWD", xGShare: 0.20, goalsPerGame: 0.28 },
  { name: "Krépin Diatta",     teamCode: "SEN", position: "FWD", xGShare: 0.14, goalsPerGame: 0.20 },
  { name: "Iliman Ndiaye",     teamCode: "SEN", position: "FWD", xGShare: 0.06, goalsPerGame: 0.15 },
  // ── Egypt ────────────────────────────────────────────────
  { name: "Mohamed Salah",     teamCode: "EGY", position: "FWD", xGShare: 0.50, goalsPerGame: 0.70 },
  { name: "Mostafa Mohamed",   teamCode: "EGY", position: "FWD", xGShare: 0.24, goalsPerGame: 0.32 },
  { name: "Omar Marmoush",     teamCode: "EGY", position: "FWD", xGShare: 0.14, goalsPerGame: 0.40 },
  { name: "Trezeguet",         teamCode: "EGY", position: "FWD", xGShare: 0.08, goalsPerGame: 0.18 },
  { name: "Amr El-Sulaya",     teamCode: "EGY", position: "MID", xGShare: 0.04, goalsPerGame: 0.08 },
  // ── Nigeria ──────────────────────────────────────────────
  { name: "Victor Osimhen",    teamCode: "NGA", position: "FWD", xGShare: 0.42, goalsPerGame: 0.62 },
  { name: "Samuel Chukwueze",  teamCode: "NGA", position: "FWD", xGShare: 0.22, goalsPerGame: 0.25 },
  { name: "Alex Iwobi",        teamCode: "NGA", position: "MID", xGShare: 0.16, goalsPerGame: 0.16 },
  { name: "Taiwo Awoniyi",     teamCode: "NGA", position: "FWD", xGShare: 0.12, goalsPerGame: 0.28 },
  { name: "Terem Moffi",       teamCode: "NGA", position: "FWD", xGShare: 0.08, goalsPerGame: 0.25 },
  // ── Cameroon ─────────────────────────────────────────────
  { name: "Bryan Mbeumo",      teamCode: "CMR", position: "FWD", xGShare: 0.34, goalsPerGame: 0.40 },
  { name: "E. M. Choupo-Moting",teamCode:"CMR", position: "FWD", xGShare: 0.26, goalsPerGame: 0.30 },
  { name: "Karl Toko Ekambi",  teamCode: "CMR", position: "FWD", xGShare: 0.20, goalsPerGame: 0.25 },
  { name: "Vincent Aboubakar", teamCode: "CMR", position: "FWD", xGShare: 0.12, goalsPerGame: 0.35 },
  { name: "André-Frank Zambo", teamCode: "CMR", position: "MID", xGShare: 0.06, goalsPerGame: 0.08 },
  // ── Algeria ──────────────────────────────────────────────
  { name: "Riyad Mahrez",      teamCode: "ALG", position: "FWD", xGShare: 0.38, goalsPerGame: 0.42 },
  { name: "Islam Slimani",     teamCode: "ALG", position: "FWD", xGShare: 0.26, goalsPerGame: 0.30 },
  { name: "Youcef Atal",       teamCode: "ALG", position: "DEF", xGShare: 0.16, goalsPerGame: 0.18 },
  { name: "Sofiane Feghouli",  teamCode: "ALG", position: "MID", xGShare: 0.12, goalsPerGame: 0.14 },
  { name: "Haris Belkebla",    teamCode: "ALG", position: "MID", xGShare: 0.06, goalsPerGame: 0.08 },
  // ── Ivory Coast ──────────────────────────────────────────
  { name: "Sébastien Haller",  teamCode: "CIV", position: "FWD", xGShare: 0.36, goalsPerGame: 0.42 },
  { name: "Wilfried Zaha",     teamCode: "CIV", position: "FWD", xGShare: 0.24, goalsPerGame: 0.28 },
  { name: "Franck Kessié",     teamCode: "CIV", position: "MID", xGShare: 0.18, goalsPerGame: 0.18 },
  { name: "Jonathan Kodjia",   teamCode: "CIV", position: "FWD", xGShare: 0.14, goalsPerGame: 0.22 },
  { name: "Simon Adingra",     teamCode: "CIV", position: "FWD", xGShare: 0.08, goalsPerGame: 0.20 },
  // ── Ghana ────────────────────────────────────────────────
  { name: "Mohammed Kudus",    teamCode: "GHA", position: "MID", xGShare: 0.34, goalsPerGame: 0.38 },
  { name: "Jordan Ayew",       teamCode: "GHA", position: "FWD", xGShare: 0.24, goalsPerGame: 0.22 },
  { name: "Antoine Semenyo",   teamCode: "GHA", position: "FWD", xGShare: 0.20, goalsPerGame: 0.25 },
  { name: "Iñaki Williams",    teamCode: "GHA", position: "FWD", xGShare: 0.14, goalsPerGame: 0.20 },
  { name: "Ernest Nuamah",     teamCode: "GHA", position: "FWD", xGShare: 0.08, goalsPerGame: 0.18 },
  // ── South Africa ─────────────────────────────────────────
  { name: "Percy Tau",         teamCode: "RSA", position: "FWD", xGShare: 0.34, goalsPerGame: 0.30 },
  { name: "Evidence Makgopa",  teamCode: "RSA", position: "FWD", xGShare: 0.28, goalsPerGame: 0.28 },
  { name: "Lyle Foster",       teamCode: "RSA", position: "FWD", xGShare: 0.20, goalsPerGame: 0.25 },
  { name: "Bongani Zungu",     teamCode: "RSA", position: "MID", xGShare: 0.10, goalsPerGame: 0.10 },
  { name: "Teboho Mokoena",    teamCode: "RSA", position: "MID", xGShare: 0.08, goalsPerGame: 0.10 },
  // ── Switzerland ──────────────────────────────────────────
  { name: "Breel Embolo",      teamCode: "SUI", position: "FWD", xGShare: 0.34, goalsPerGame: 0.38 },
  { name: "Ruben Vargas",      teamCode: "SUI", position: "FWD", xGShare: 0.24, goalsPerGame: 0.24 },
  { name: "Xherdan Shaqiri",   teamCode: "SUI", position: "FWD", xGShare: 0.20, goalsPerGame: 0.22 },
  { name: "Granit Xhaka",      teamCode: "SUI", position: "MID", xGShare: 0.12, goalsPerGame: 0.14 },
  { name: "Noah Okafor",       teamCode: "SUI", position: "FWD", xGShare: 0.08, goalsPerGame: 0.20 },
  // ── Austria ──────────────────────────────────────────────
  { name: "C. Baumgartner",    teamCode: "AUT", position: "MID", xGShare: 0.26, goalsPerGame: 0.28 },
  { name: "Patrick Wimmer",    teamCode: "AUT", position: "FWD", xGShare: 0.22, goalsPerGame: 0.22 },
  { name: "Michael Gregoritsch",teamCode:"AUT", position: "FWD", xGShare: 0.22, goalsPerGame: 0.28 },
  { name: "Marcel Sabitzer",   teamCode: "AUT", position: "MID", xGShare: 0.18, goalsPerGame: 0.20 },
  { name: "Marko Arnautović",  teamCode: "AUT", position: "FWD", xGShare: 0.10, goalsPerGame: 0.25 },
  // ── Turkey ───────────────────────────────────────────────
  { name: "Kerem Aktürkoğlu",  teamCode: "TUR", position: "FWD", xGShare: 0.28, goalsPerGame: 0.32 },
  { name: "Cengiz Ünder",      teamCode: "TUR", position: "FWD", xGShare: 0.24, goalsPerGame: 0.26 },
  { name: "Hakan Çalhanoğlu",  teamCode: "TUR", position: "MID", xGShare: 0.22, goalsPerGame: 0.24 },
  { name: "Yusuf Yazıcı",      teamCode: "TUR", position: "MID", xGShare: 0.16, goalsPerGame: 0.20 },
  { name: "Cenk Tosun",        teamCode: "TUR", position: "FWD", xGShare: 0.08, goalsPerGame: 0.18 },
  // ── Serbia ───────────────────────────────────────────────
  { name: "Dušan Vlahović",    teamCode: "SRB", position: "FWD", xGShare: 0.38, goalsPerGame: 0.52 },
  { name: "Aleksandar Mitrović",teamCode:"SRB", position: "FWD", xGShare: 0.28, goalsPerGame: 0.48 },
  { name: "Luka Jović",        teamCode: "SRB", position: "FWD", xGShare: 0.18, goalsPerGame: 0.30 },
  { name: "S. Milinković-Savić",teamCode:"SRB", position: "MID", xGShare: 0.12, goalsPerGame: 0.18 },
  { name: "Filip Kostić",      teamCode: "SRB", position: "MID", xGShare: 0.04, goalsPerGame: 0.12 },
  // ── Scotland ─────────────────────────────────────────────
  { name: "Lyndon Dykes",      teamCode: "SCO", position: "FWD", xGShare: 0.34, goalsPerGame: 0.30 },
  { name: "Che Adams",         teamCode: "SCO", position: "FWD", xGShare: 0.28, goalsPerGame: 0.28 },
  { name: "Lawrence Shankland",teamCode: "SCO", position: "FWD", xGShare: 0.20, goalsPerGame: 0.35 },
  { name: "John McGinn",       teamCode: "SCO", position: "MID", xGShare: 0.12, goalsPerGame: 0.14 },
  { name: "Stuart Armstrong",  teamCode: "SCO", position: "MID", xGShare: 0.06, goalsPerGame: 0.10 },
  // ── Ukraine ──────────────────────────────────────────────
  { name: "Artem Dovbyk",      teamCode: "UKR", position: "FWD", xGShare: 0.38, goalsPerGame: 0.50 },
  { name: "Mykhailo Mudryk",   teamCode: "UKR", position: "FWD", xGShare: 0.24, goalsPerGame: 0.28 },
  { name: "Viktor Tsygankov",  teamCode: "UKR", position: "FWD", xGShare: 0.18, goalsPerGame: 0.22 },
  { name: "Roman Yaremchuk",   teamCode: "UKR", position: "FWD", xGShare: 0.14, goalsPerGame: 0.25 },
  { name: "Georgiy Sudakov",   teamCode: "UKR", position: "MID", xGShare: 0.06, goalsPerGame: 0.12 },
  // ── Hungary ──────────────────────────────────────────────
  { name: "Dominik Szoboszlai",teamCode: "HUN", position: "MID", xGShare: 0.36, goalsPerGame: 0.38 },
  { name: "Barnabás Varga",    teamCode: "HUN", position: "FWD", xGShare: 0.28, goalsPerGame: 0.32 },
  { name: "Roland Sallai",     teamCode: "HUN", position: "FWD", xGShare: 0.18, goalsPerGame: 0.22 },
  { name: "Martin Ádám",       teamCode: "HUN", position: "FWD", xGShare: 0.12, goalsPerGame: 0.18 },
  { name: "Ádám Szalai",       teamCode: "HUN", position: "FWD", xGShare: 0.06, goalsPerGame: 0.14 },
  // ── Czech Republic ───────────────────────────────────────
  { name: "Patrik Schick",     teamCode: "CZE", position: "FWD", xGShare: 0.40, goalsPerGame: 0.48 },
  { name: "Tomáš Souček",      teamCode: "CZE", position: "MID", xGShare: 0.22, goalsPerGame: 0.20 },
  { name: "Lukáš Provod",      teamCode: "CZE", position: "MID", xGShare: 0.16, goalsPerGame: 0.16 },
  { name: "Ondřej Lingr",      teamCode: "CZE", position: "FWD", xGShare: 0.14, goalsPerGame: 0.18 },
  { name: "Jan Kuchta",        teamCode: "CZE", position: "FWD", xGShare: 0.08, goalsPerGame: 0.22 },
  // ── Slovakia ─────────────────────────────────────────────
  { name: "Ivan Schranz",      teamCode: "SVK", position: "FWD", xGShare: 0.34, goalsPerGame: 0.32 },
  { name: "Róbert Boženík",    teamCode: "SVK", position: "FWD", xGShare: 0.28, goalsPerGame: 0.28 },
  { name: "Ondrej Duda",       teamCode: "SVK", position: "MID", xGShare: 0.18, goalsPerGame: 0.18 },
  { name: "Dávid Hancko",      teamCode: "SVK", position: "DEF", xGShare: 0.12, goalsPerGame: 0.12 },
  { name: "Lukáš Haraslín",    teamCode: "SVK", position: "FWD", xGShare: 0.08, goalsPerGame: 0.14 },
  // ── New Zealand ──────────────────────────────────────────
  { name: "Chris Wood",        teamCode: "NZL", position: "FWD", xGShare: 0.48, goalsPerGame: 0.38 },
  { name: "Liberato Cacace",   teamCode: "NZL", position: "DEF", xGShare: 0.18, goalsPerGame: 0.12 },
  { name: "Clayton Lewis",     teamCode: "NZL", position: "MID", xGShare: 0.16, goalsPerGame: 0.12 },
  { name: "Elijah Just",       teamCode: "NZL", position: "MID", xGShare: 0.12, goalsPerGame: 0.10 },
  { name: "Matthew Garbett",   teamCode: "NZL", position: "MID", xGShare: 0.06, goalsPerGame: 0.08 },
];

export function getTeamPlayers(teamCode: string): Player[] {
  return players.filter(p => p.teamCode === teamCode);
}
