package de.sportgermany.planer;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.ProcessedRoute;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Die App benutzt Ordner-Adressen wie /planer/app/ oder /planer/training/ (wie auf GitHub Pages).
        // Capacitor liefert sonst bei Adressen ohne Dateiendung immer die Start-index.html aus –
        // hier wird stattdessen die index.html des jeweiligen Ordners geladen.
        bridgeBuilder.setRouteProcessor((basePath, path) -> {
            String p = path == null || path.isEmpty() ? "/" : path;
            if (p.endsWith("/")) p = p + "index.html";
            ProcessedRoute r = new ProcessedRoute();
            r.setPath(basePath + p);
            r.setAsset(true);
            r.setIgnoreAssetPath(false);
            return r;
        });
        // eigenes Plugin: Abgleich mit dem Kalender des Handys
        registerPlugin(PlanerKalenderPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
