package de.sportgermany.planer;

import android.net.Uri;
import android.os.Bundle;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import java.util.Map;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // eigenes Plugin: Abgleich mit dem Kalender des Handys
        registerPlugin(PlanerKalenderPlugin.class);
        super.onCreate(savedInstanceState);
        // Die App benutzt Ordner-Adressen wie /planer/app/ oder /planer/training/ (wie auf GitHub Pages).
        // Capacitors Server liefert für Adressen ohne Dateiendung nichts aus – hier wird daraus …/index.html.
        // (Die Adresse im WebView bleibt /planer/app/, relative Pfade stimmen also.)
        bridge.setWebViewClient(
            new BridgeWebViewClient(bridge) {
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    Uri u = request.getUrl();
                    String p = u.getPath();
                    if (p != null && p.endsWith("/") && p.length() > 1 && bridge.getHost().equalsIgnoreCase(u.getHost())) {
                        WebResourceResponse r = bridge.getLocalServer().shouldInterceptRequest(new IndexRequest(request));
                        if (r != null) return r;
                    }
                    return super.shouldInterceptRequest(view, request);
                }

                // Stürzt der Seiten-Prozess ab (z. B. Speicher knapp), würde Android sonst die ganze App beenden –
                // stattdessen die App neu aufbauen (die Daten liegen im Speicher und bleiben erhalten).
                @Override
                public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                    android.util.Log.w("Planer", "WebView-Prozess beendet (Absturz: " + detail.didCrash() + ") – App wird neu aufgebaut");
                    runOnUiThread(() -> recreate());
                    return true;
                }
            }
        );
    }

    /** Dieselbe Anfrage, nur mit index.html am Ende des Pfads. */
    static final class IndexRequest implements WebResourceRequest {

        private final WebResourceRequest r;
        private final Uri url;

        IndexRequest(WebResourceRequest r) {
            this.r = r;
            Uri u = r.getUrl();
            this.url = u.buildUpon().path(u.getPath() + "index.html").build();
        }

        @Override
        public Uri getUrl() {
            return url;
        }

        @Override
        public boolean isForMainFrame() {
            return r.isForMainFrame();
        }

        @Override
        public boolean isRedirect() {
            return r.isRedirect();
        }

        @Override
        public boolean hasGesture() {
            return r.hasGesture();
        }

        @Override
        public String getMethod() {
            return r.getMethod();
        }

        @Override
        public Map<String, String> getRequestHeaders() {
            return r.getRequestHeaders();
        }
    }
}
