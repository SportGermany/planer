/* Erzeugt planer/sg/suche-daten.js für die Suche der Hülle: Bahnen (Kurvenbuch-Katalog), Mobility-Übungen,
 * Gym-Übungen und Dehnübungen – ausgelesen aus den Seiten selbst, damit die Suche sie offline kennt, ohne die Seiten zu laden.
 * Aufruf (aus build.py): node werkzeuge/quellen/suchdaten.js <Wurzel> */
const fs = require("fs"), vm = require("vm"), R = process.argv[2];
function arr(file, start) {
  const t = fs.readFileSync(R + file, "utf8"), i = t.indexOf(start); if (i < 0) throw new Error(start + " fehlt in " + file);
  const j = t.indexOf("\n];", i); return vm.runInNewContext("(" + t.slice(i + start.length - 1, j + 2) + ")");
}
const bahnen = arr("training/bahnplan/js/1-app.js", "const CATALOG = [").map(b => [b.id, b.name, b.ort || "", b.land || ""]);
const mob = arr("training/mobility/js/1-app.js", "const EX=[").map(e => [e.id, e.name, e.reg || ""]);
global.WK = {};   // die Trainingsmodule hängen sich an WK an
const gym = require(R + "training/js/6-gym.js").GYM_EXERCISES.map(e => [e.id, e.n]);
const st = require(R + "training/js/4-stretch.js"), dehn = st.STRETCHES.map(e => [e.id, e.n, st.STRETCH_CAT[e.c] || e.c]);
const out = "/* Für die Suche: Bahnen, Übungen (Mobility, Gym, Dehnen) – erzeugt von werkzeuge/quellen/suchdaten.js. Nicht von Hand ändern. */\n" +
  "window.SG_SUCHDATEN = " + JSON.stringify({ bahnen, mob, gym, dehn }) + ";\n";
fs.writeFileSync(R + "sg/suche-daten.js", out);
console.log("suche-daten.js", bahnen.length, "Bahnen,", mob.length, "Mobility,", gym.length, "Gym,", dehn.length, "Dehnen");
