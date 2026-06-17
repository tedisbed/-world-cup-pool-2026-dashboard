const monthCodes = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const teamKalshiCodes = {
  Algeria: "ALG",
  Argentina: "ARG",
  Australia: "AUS",
  Austria: "AUT",
  Belgium: "BEL",
  "Bosnia and Herzegovina": "BIH",
  Brazil: "BRA",
  Canada: "CAN",
  "Cape Verde": "CPV",
  Colombia: "COL",
  Croatia: "CRO",
  Curacao: "CUW",
  Czechia: "CZE",
  "DR Congo": "COD",
  Ecuador: "ECU",
  Egypt: "EGY",
  England: "ENG",
  France: "FRA",
  Germany: "GER",
  Ghana: "GHA",
  Haiti: "HTI",
  Iran: "IRI",
  Iraq: "IRQ",
  "Ivory Coast": "CIV",
  Japan: "JPN",
  Jordan: "JOR",
  Mexico: "MEX",
  Morocco: "MAR",
  Netherlands: "NED",
  "New Zealand": "NZL",
  Norway: "NOR",
  Panama: "PAN",
  Paraguay: "PAR",
  Portugal: "POR",
  Qatar: "QAT",
  "Saudi Arabia": "KSA",
  Scotland: "SCO",
  Senegal: "SEN",
  "South Africa": "RSA",
  "South Korea": "KOR",
  Spain: "ESP",
  Sweden: "SWE",
  Switzerland: "SUI",
  Tunisia: "TUN",
  Turkey: "TUR",
  "United States": "USA",
  Uruguay: "URU",
  Uzbekistan: "UZB",
};

const kalshiTeamAliases = {
  "Congo DR": "DR Congo",
  Tie: "Draw",
};

export function getKalshiEventTicker(match) {
  const dateCode = kalshiDateCode(match?.date);
  const homeCode = teamKalshiCodes[match?.home];
  const awayCode = teamKalshiCodes[match?.away];
  if (!dateCode || !homeCode || !awayCode) return "";
  return `KXWCGAME-${dateCode}${homeCode}${awayCode}`;
}

export function summarizeWinnerMarkets(match, markets = []) {
  const rows = markets
    .map((market) => ({
      label: normalizeMarketLabel(market.yes_sub_title || market.title),
      probability: marketProbability(market),
      ticker: market.ticker || "",
    }))
    .filter((row) => row.label && Number.isFinite(row.probability));

  const favorite = rows
    .filter((row) => row.label !== "Draw")
    .sort((a, b) => b.probability - a.probability)[0];
  if (!favorite) return null;

  const draw = rows.find((row) => row.label === "Draw");
  const underdog = rows
    .filter((row) => row.label !== "Draw" && row.label !== favorite.label)
    .sort((a, b) => a.probability - b.probability)[0];

  return {
    favoriteLabel: displayTeamLabel(favorite.label, match),
    favoriteProbability: favorite.probability,
    drawProbability: draw?.probability ?? null,
    underdogLabel: underdog ? displayTeamLabel(underdog.label, match) : "",
    underdogProbability: underdog?.probability ?? null,
    marketsUrl: kalshiMarketsUrl(favorite.ticker),
  };
}

function kalshiDateCode(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date ?? ""));
  if (!match) return "";
  const [, year, month, day] = match;
  const monthCode = monthCodes[Number(month) - 1];
  if (!monthCode) return "";
  return `${year.slice(2)}${monthCode}${day}`;
}

function marketProbability(market) {
  const price = firstFiniteNumber(market.yes_ask_dollars, market.last_price_dollars, market.yes_bid_dollars);
  return Number.isFinite(price) ? Math.round(price * 100) : NaN;
}

function firstFiniteNumber(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return NaN;
}

function normalizeMarketLabel(label) {
  const clean = String(label ?? "").trim();
  return kalshiTeamAliases[clean] ?? clean;
}

function displayTeamLabel(label, match) {
  if (label === match?.home) return match.home;
  if (label === match?.away) return match.away;
  return label;
}

function kalshiMarketsUrl(ticker) {
  const eventTicker = String(ticker ?? "").split("-").slice(0, 2).join("-");
  return eventTicker ? `https://kalshi.com/markets/${eventTicker.toLowerCase()}` : "";
}
