/* ============================================================
   GITHUB-SYNC-ENGINE
   Speichert eine JSON-Datei über die GitHub-Contents-API im
   eigenen Repository des Nutzers. Reine Netzwerk-/Datenlogik,
   kein DOM-Zugriff. Der Zugriffsschlüssel verlässt diese Datei
   nie in Richtung der synchronisierten Nutzdaten.
   ============================================================ */
(function(root){
"use strict";
var W = root.WK;

function ghHeaders(token){
  return {
    "Authorization": "Bearer " + token,
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json"
  };
}
function normalizeCfg(cfg){
  var c = cfg || {};
  return {
    token: String(c.token || "").trim(),
    owner: String(c.owner || "").trim(),
    repo:  String(c.repo || "").trim(),
    branch: String(c.branch || "main").trim() || "main",
    path:  String(c.path || "trainingsblog-data.json").trim().replace(/^\/+/, "") || "trainingsblog-data.json"
  };
}
function cfgComplete(cfg){
  var c = normalizeCfg(cfg);
  return !!(c.token && c.owner && c.repo && c.path);
}
function contentsUrl(cfg){
  var c = normalizeCfg(cfg);
  return "https://api.github.com/repos/" + encodeURIComponent(c.owner) + "/" +
    encodeURIComponent(c.repo) + "/contents/" + c.path.split("/").map(encodeURIComponent).join("/");
}
/* UTF-8-sicheres Base64 (Emoji, Umlaute etc. dürfen im Datensatz vorkommen) */
function b64encode(str){
  return btoa(unescape(encodeURIComponent(str)));
}
function b64decode(b64){
  return decodeURIComponent(escape(atob(String(b64).replace(/\n/g, ""))));
}

/* Verbindung + Zugriffsrechte prüfen, ohne etwas zu verändern */
function testConnection(cfg){
  var c = normalizeCfg(cfg);
  if (!cfgComplete(c)) return Promise.reject(new Error("Bitte Zugriffsschlüssel, Konto und Repository eintragen."));
  var url = "https://api.github.com/repos/" + encodeURIComponent(c.owner) + "/" + encodeURIComponent(c.repo);
  return fetch(url, {headers: ghHeaders(c.token)}).then(function(res){
    if (res.status === 401) throw new Error("Zugriffsschlüssel ungültig oder abgelaufen.");
    if (res.status === 404) throw new Error("Repository nicht gefunden oder keine Berechtigung.");
    if (!res.ok) throw new Error("GitHub antwortet mit Fehler " + res.status + ".");
    return res.json();
  }).then(function(data){
    return {ok:true, private: !!data.private, fullName: data.full_name};
  });
}

/* Datei lesen: {exists:false} wenn noch keine Sicherung existiert */
function getFile(cfg){
  var c = normalizeCfg(cfg);
  // "cache: no-store" + Zeitstempel im Query erzwingen eine wirklich frische
  // Anfrage bei GitHub. Ohne das könnte der Browser eine zwischengespeicherte,
  // veraltete Antwort liefern – dann würde der Konfliktausgleich beim Hochladen
  // immer wieder mit derselben alten Version rechnen und am Ende doch die
  // Fehlermeldung zeigen, obwohl in Wirklichkeit gar kein echter Konflikt mehr da ist.
  var url = contentsUrl(c) + "?ref=" + encodeURIComponent(c.branch) + "&_=" + Date.now();
  return fetch(url, {headers: ghHeaders(c.token), cache: "no-store"})
    .then(function(res){
      if (res.status === 404) return {exists:false};
      if (res.status === 401) throw new Error("Zugriffsschlüssel ungültig oder abgelaufen.");
      if (!res.ok) return res.json().catch(function(){ return {}; }).then(function(e){
        throw new Error("GitHub-Fehler " + res.status + (e.message ? ": " + e.message : ""));
      });
      return res.json().then(function(data){
        var content = null;
        try { content = JSON.parse(b64decode(data.content)); }
        catch(e){ throw new Error("Die Datei im Repository ist kein gültiges JSON."); }
        return {exists:true, sha:data.sha, content:content, raw:data};
      });
    });
}

/* Datei schreiben. sha wird mitgegeben, wenn eine bestehende Datei ersetzt
   wird (von GitHub für Updates verlangt), bleibt leer bei Neuanlage.
   Bei einem reinen sha-Konflikt (409, oder 422 mit "sha"-Hinweis in der
   Fehlermeldung) wird das als .conflict=true markiert, damit push() das
   still selbst behebt. Alle anderen Fehler (z. B. 422 aus einem anderen
   Grund) werden mit ihrem echten Grund gemeldet statt pauschal als
   "veraltete Version" missgedeutet. */
function putFile(cfg, dataObj, sha){
  var c = normalizeCfg(cfg);
  var body = {
    message: "Trainingsblog-Sicherung · " + new Date().toISOString(),
    content: b64encode(JSON.stringify(dataObj, null, 2)),
    branch: c.branch
  };
  if (sha) body.sha = sha;
  return fetch(contentsUrl(c), {method:"PUT", headers: ghHeaders(c.token), body: JSON.stringify(body)})
    .then(function(res){
      if (res.status === 401) throw new Error("Zugriffsschlüssel ungültig oder abgelaufen.");
      if (res.status === 404) throw new Error("Repository oder Pfad nicht gefunden – bitte Konto, Repository und Branch prüfen.");
      if (res.status === 403) return res.json().catch(function(){ return {}; }).then(function(e){
        throw new Error("Zugriff verweigert (403)" + (e.message ? ": " + e.message : "") + " – hat der Zugriffsschlüssel Schreibrechte auf dieses Repository?");
      });
      if (res.status === 409 || res.status === 422){
        return res.json().catch(function(){ return {}; }).then(function(e){
          var msg = (e && e.message) || "";
          var err = new Error(msg || ("GitHub-Fehler " + res.status));
          // Nur wenn es wirklich um eine veraltete sha geht, automatisch
          // im Hintergrund erneut versuchen. Alles andere wird als echter
          // Fehler gemeldet statt stillschweigend wiederholt.
          err.conflict = res.status === 409 || /sha/i.test(msg);
          throw err;
        });
      }
      if (!res.ok) return res.json().catch(function(){ return {}; }).then(function(e){
        throw new Error("GitHub-Fehler " + res.status + (e.message ? ": " + e.message : ""));
      });
      return res.json();
    })
    .then(function(data){ return {sha: data.content && data.content.sha}; });
}

/* Einfacher Rundumschlag: hochladen und dabei die bestehende Datei im
   Repository einfach ersetzen. Kein Nachfragen, keine "veraltete
   Sicherung"-Meldung – bei einem reinen sha-Konflikt (ein anderes Gerät
   hat zwischenzeitlich geschrieben) wird automatisch und still im
   Hintergrund die aktuelle Version erneut geholt und die eigene Sicherung
   direkt darüber geschrieben, notfalls viele Male hintereinander. Nur ein
   echtes, anderes Problem (falscher Zugriffsschlüssel, Repository nicht
   gefunden, keine Schreibrechte, kein Netzwerk) wird dem Nutzer gemeldet. */
function push(cfg, dataObj, attemptsLeft){
  if (attemptsLeft === undefined) attemptsLeft = 20;
  return getFile(cfg).then(function(cur){
    return putFile(cfg, dataObj, cur.exists ? cur.sha : null);
  }).catch(function(err){
    if (err.conflict && attemptsLeft > 1) return push(cfg, dataObj, attemptsLeft - 1);
    if (err.conflict){
      // Nach vielen Versuchen wirklich kein Erfolg: nicht mehr von
      // "veraltet" sprechen (verwirrend), sondern schlicht bitten, es
      // gleich noch einmal zu versuchen.
      throw new Error("Hochladen hat nicht geklappt, bitte gleich noch einmal versuchen.");
    }
    throw err;
  });
}

/* ============================================================
   APP-SELBST-AKTUALISIERUNG
   Dieselbe Grundmechanik wie oben (getFile/putFile/push), aber
   für einen FESTEN, eigenen Pfad ("index.html") statt für den in
   den Cloud-Sync-Einstellungen hinterlegten Datenpfad, und mit
   rohem Dateitext statt JSON – die App-Datei selbst wird ja nicht
   als JSON gespeichert. Nutzt denselben Zugriffsschlüssel und
   dasselbe Repository wie die Cloud-Sicherung der Trainingsdaten.
   ============================================================ */
function contentsUrlForPath(cfg, path){
  var c = normalizeCfg(cfg);
  return "https://api.github.com/repos/" + encodeURIComponent(c.owner) + "/" +
    encodeURIComponent(c.repo) + "/contents/" + path.split("/").map(encodeURIComponent).join("/");
}
function getRawFile(cfg, path){
  var c = normalizeCfg(cfg);
  var url = contentsUrlForPath(c, path) + "?ref=" + encodeURIComponent(c.branch) + "&_=" + Date.now();
  return fetch(url, {headers: ghHeaders(c.token), cache: "no-store"})
    .then(function(res){
      if (res.status === 404) return {exists:false};
      if (res.status === 401) throw new Error("Zugriffsschlüssel ungültig oder abgelaufen.");
      if (!res.ok) return res.json().catch(function(){ return {}; }).then(function(e){
        throw new Error("GitHub-Fehler " + res.status + (e.message ? ": " + e.message : ""));
      });
      return res.json().then(function(data){ return {exists:true, sha:data.sha, raw:data}; });
    });
}
function putRawFile(cfg, path, text, sha){
  var c = normalizeCfg(cfg);
  var body = {
    message: "App-Update über Trainingsblog · " + new Date().toISOString(),
    content: b64encode(text),
    branch: c.branch
  };
  if (sha) body.sha = sha;
  return fetch(contentsUrlForPath(c, path), {method:"PUT", headers: ghHeaders(c.token), body: JSON.stringify(body)})
    .then(function(res){
      if (res.status === 401) throw new Error("Zugriffsschlüssel ungültig oder abgelaufen.");
      if (res.status === 404) throw new Error("Repository oder Pfad nicht gefunden – bitte Konto, Repository und Branch prüfen.");
      if (res.status === 403) return res.json().catch(function(){ return {}; }).then(function(e){
        throw new Error("Zugriff verweigert (403)" + (e.message ? ": " + e.message : "") + " – hat der Zugriffsschlüssel Schreibrechte auf dieses Repository?");
      });
      if (res.status === 409 || res.status === 422){
        return res.json().catch(function(){ return {}; }).then(function(e){
          var msg = (e && e.message) || "";
          var err = new Error(msg || ("GitHub-Fehler " + res.status));
          err.conflict = res.status === 409 || /sha/i.test(msg);
          throw err;
        });
      }
      if (!res.ok) return res.json().catch(function(){ return {}; }).then(function(e){
        throw new Error("GitHub-Fehler " + res.status + (e.message ? ": " + e.message : ""));
      });
      return res.json();
    })
    .then(function(data){ return {sha: data.content && data.content.sha}; });
}
function pushRawFile(cfg, path, text, attemptsLeft){
  if (attemptsLeft === undefined) attemptsLeft = 20;
  return getRawFile(cfg, path).then(function(cur){
    return putRawFile(cfg, path, text, cur.exists ? cur.sha : null);
  }).catch(function(err){
    if (err.conflict && attemptsLeft > 1) return pushRawFile(cfg, path, text, attemptsLeft - 1);
    if (err.conflict) throw new Error("Hochladen hat nicht geklappt, bitte gleich noch einmal versuchen.");
    throw err;
  });
}
function pull(cfg){
  return getFile(cfg).then(function(cur){
    if (!cur.exists) { var e = new Error("Im Repository liegt noch keine Sicherung."); e.notfound = true; throw e; }
    return cur;
  });
}

/* ============================================================
   ENDE-ZU-ENDE-VERSCHLÜSSELUNG (optional)
   AES-GCM mit einem aus dem Synchronisationscode abgeleiteten
   Schlüssel (PBKDF2). Salt und IV sind öffentlich mit abgelegt,
   der Code selbst verlässt das Gerät nie. Wichtig gegenüber dem
   Nutzer: ein kurzer, rein numerischer Code ist kein Schutz gegen
   gezielte Angriffe, nur gegen zufälliges Mitlesen.
   ============================================================ */
var KDF_ITERATIONS = 600000;
function cryptoAvailable(){
  return !!(root.crypto && root.crypto.subtle && root.crypto.getRandomValues);
}
function randomBytes(n){ return root.crypto.getRandomValues(new Uint8Array(n)); }
function bytesToB64(bytes){
  var s = ""; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function b64ToBytes(b64){
  var s = atob(b64), out = new Uint8Array(s.length);
  for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
function deriveKey(pin, salt, iterations){
  var enc = new TextEncoder();
  return root.crypto.subtle.importKey("raw", enc.encode(pin), {name:"PBKDF2"}, false, ["deriveKey"])
    .then(function(keyMaterial){
      return root.crypto.subtle.deriveKey(
        {name:"PBKDF2", salt:salt, iterations:iterations, hash:"SHA-256"},
        keyMaterial, {name:"AES-GCM", length:256}, false, ["encrypt","decrypt"]
      );
    });
}
function isEncryptedPayload(obj){ return !!(obj && obj.__trainingsblog_enc === 1); }
function encryptPayload(obj, pin){
  if (!cryptoAvailable()) return Promise.reject(new Error("Verschlüsselung wird von diesem Browser nicht unterstützt."));
  var salt = randomBytes(16), iv = randomBytes(12);
  return deriveKey(pin, salt, KDF_ITERATIONS).then(function(key){
    var plain = new TextEncoder().encode(JSON.stringify(obj));
    return root.crypto.subtle.encrypt({name:"AES-GCM", iv:iv}, key, plain);
  }).then(function(cipherBuf){
    return {
      __trainingsblog_enc: 1, kdf: "PBKDF2-SHA256", iterations: KDF_ITERATIONS,
      salt: bytesToB64(salt), iv: bytesToB64(iv), data: bytesToB64(new Uint8Array(cipherBuf))
    };
  });
}
function decryptPayload(enc, pin){
  if (!cryptoAvailable()) return Promise.reject(new Error("Verschlüsselung wird von diesem Browser nicht unterstützt."));
  if (!pin) { var e0 = new Error("Bitte zuerst den Synchronisationscode eingeben."); e0.needsPin = true; return Promise.reject(e0); }
  var salt = b64ToBytes(enc.salt), iv = b64ToBytes(enc.iv);
  return deriveKey(pin, salt, enc.iterations || KDF_ITERATIONS).then(function(key){
    return root.crypto.subtle.decrypt({name:"AES-GCM", iv:iv}, key, b64ToBytes(enc.data));
  }).then(function(plainBuf){
    try { return JSON.parse(new TextDecoder().decode(plainBuf)); }
    catch(e){ var e1 = new Error("Die entschlüsselten Daten sind beschädigt."); throw e1; }
  }).catch(function(err){
    if (err.needsPin) throw err;
    var e2 = new Error("Falscher Synchronisationscode oder beschädigte Sicherung.");
    e2.wrongPin = true; throw e2;
  });
}

var API = {
  normalizeCfg:normalizeCfg, cfgComplete:cfgComplete, contentsUrl:contentsUrl,
  b64encode:b64encode, b64decode:b64decode,
  testConnection:testConnection, getFile:getFile, putFile:putFile, push:push, pull:pull,
  cryptoAvailable:cryptoAvailable, isEncryptedPayload:isEncryptedPayload,
  getRawFile:getRawFile, putRawFile:putRawFile, pushRawFile:pushRawFile,
  encryptPayload:encryptPayload, decryptPayload:decryptPayload, KDF_ITERATIONS:KDF_ITERATIONS
};
for (var k in API) W["gh" + k.charAt(0).toUpperCase() + k.slice(1)] = API[k];
root.GITHUB = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof globalThis !== "undefined" ? globalThis : this);
