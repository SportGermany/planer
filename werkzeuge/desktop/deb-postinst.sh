#!/bin/bash
# Nach der Installation (werkzeuge/desktop/package.json › deb.afterInstall).
# Ubuntu ab 23.10/24.04 verbietet normalen Programmen eigene Benutzer-Namensräume (AppArmor) – Electron startet dann nicht
# („Start nicht möglich“). Die Standard-Prüfung von electron-builder läuft als root und merkt das nicht. Darum hier:
#   1. AppArmor-Profil für Planer (erlaubt Namensräume, wie Ubuntu es für Chrome/Electron-Programme vorsieht)
#   2. chrome-sandbox immer mit SUID (Rückfall, falls AppArmor fehlt oder das Profil nicht geladen werden kann)
if type update-alternatives >/dev/null 2>&1; then
    if [ -L '/usr/bin/planer' -a -e '/usr/bin/planer' -a "`readlink '/usr/bin/planer'`" != '/etc/alternatives/planer' ]; then
        rm -f '/usr/bin/planer'
    fi
    update-alternatives --install '/usr/bin/planer' 'planer' '/opt/Planer/planer' 100 || ln -sf '/opt/Planer/planer' '/usr/bin/planer'
else
    ln -sf '/opt/Planer/planer' '/usr/bin/planer'
fi
chown root:root '/opt/Planer/chrome-sandbox' || true
chmod 4755 '/opt/Planer/chrome-sandbox' || true
if [ -d /etc/apparmor.d ] && [ -e /etc/apparmor.d/abi/4.0 ]; then
    cat > /etc/apparmor.d/planer <<'PROFIL'
# Planer (SportGermany) – Electron braucht eigene Benutzer-Namensräume für seine Sandbox
abi <abi/4.0>,
include <tunables/global>

profile planer /opt/Planer/planer flags=(unconfined) {
  userns,

  include if exists <local/planer>
}
PROFIL
    if hash apparmor_parser 2>/dev/null; then
        apparmor_parser -r -T -W /etc/apparmor.d/planer 2>/dev/null || true
    fi
fi
# zweiter Starter „Schule“ (öffnet die Schul-App im eigenen Fenster, gleiche Daten wie im Planer)
if [ -f /opt/Planer/resources/planer-schule.desktop ]; then
    install -m 644 /opt/Planer/resources/planer-schule.desktop /usr/share/applications/planer-schule.desktop || true
fi
if hash update-mime-database 2>/dev/null; then
    update-mime-database /usr/share/mime || true
fi
if hash update-desktop-database 2>/dev/null; then
    update-desktop-database /usr/share/applications || true
fi
exit 0
