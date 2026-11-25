#!/bin/bash
# Nach dem Entfernen: Verknüpfung und AppArmor-Profil wieder weg
if [ "$1" = "remove" ] || [ "$1" = "purge" ]; then
    if type update-alternatives >/dev/null 2>&1; then
        update-alternatives --remove 'planer' '/opt/Planer/planer' || true
    else
        rm -f '/usr/bin/planer'
    fi
    rm -f /usr/share/applications/planer-schule.desktop
    if [ -f /etc/apparmor.d/planer ]; then
        if hash apparmor_parser 2>/dev/null; then apparmor_parser -R /etc/apparmor.d/planer 2>/dev/null || true; fi
        rm -f /etc/apparmor.d/planer
    fi
fi
exit 0
