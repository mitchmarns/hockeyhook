// post-roster.js (Node 20)
const fs = require("node:fs/promises");

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

function fmt(v) {
  const s = (v ?? "").toString().trim();
  return s ? s : "—";
}

function renderTeamLineup(teamName, team) {
  const f = team.F ?? [];
  const d = team.D ?? [];
  const g = team.G ?? [];

  const fLines = f.slice(0, 4).map((ln, i) =>
    `L${i + 1}: ${fmt(ln.LW)} — ${fmt(ln.C)} — ${fmt(ln.RW)}`
  ).join("\n");

  const dPairs = d.slice(0, 3).map((pr, i) =>
    `D${i + 1}: ${fmt(pr.LD)} — ${fmt(pr.RD)}`
  ).join("\n");

  const goalies = g.slice(0, 2).map((gg, i) =>
    `G${i + 1}: ${fmt(gg.G)}`
  ).join("\n");

  return [
    `🏒 **${teamName} — Character Lines**`,
    ``,
    `**Forwards**`,
    fLines || "—",
    ``,
    `**Defense**`,
    dPairs || "—",
    ``,
    `**Goalies**`,
    goalies || "—",
  ].join("\n");
}

async function postWebhook(payload) {
  if (!WEBHOOK_URL) throw new Error("Missing DISCORD_WEBHOOK");
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Discord webhook failed: ${res.status} ${await res.text()}`);
}

(async function main() {
  const rosters = JSON.parse(await fs.readFile("./rosters.json", "utf8"));
  const teamName = Object.keys(rosters)[0];
  if (!teamName) throw new Error("No teams found in rosters.json");
  const content = renderTeamLineup(teamName, rosters[teamName]);

  await postWebhook({ username: "ROSTER BOT", content });
})();
