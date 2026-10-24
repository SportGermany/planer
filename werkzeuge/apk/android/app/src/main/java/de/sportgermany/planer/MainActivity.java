package de.sportgermany.planer;

import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
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
        // Design „Material You“: Farben aus dem Hintergrundbild, Leistenfarbe, Rückmeldung per Vibration
        registerPlugin(PlanerSystemPlugin.class);
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

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        takeCalendarIntent(intent);
    }

    @Override
    public void onStart() {
        super.onStart();
        // beim Kaltstart über „Öffnen mit Planer“ / „Teilen“
        takeCalendarIntent(getIntent());
    }

    /** Kalenderdatei oder geteilten Termintext aus dem Intent lesen und an die App geben (einmal je Intent). */
    private void takeCalendarIntent(Intent in) {
        if (in == null || in.getBooleanExtra("planerTaken", false)) return;
        String act = in.getAction();
        if (!Intent.ACTION_VIEW.equals(act) && !Intent.ACTION_SEND.equals(act) && !Intent.ACTION_SEND_MULTIPLE.equals(act)) return;
        in.putExtra("planerTaken", true);
        final Intent it = in;
        new Thread(() -> {
            try {
                StringBuilder text = new StringBuilder();
                String name = "";
                ArrayList<Uri> uris = new ArrayList<>();
                if (Intent.ACTION_VIEW.equals(act) && it.getData() != null) uris.add(it.getData());
                if (Intent.ACTION_SEND.equals(act)) {
                    Uri u = it.getParcelableExtra(Intent.EXTRA_STREAM);
                    if (u != null) uris.add(u);
                }
                if (Intent.ACTION_SEND_MULTIPLE.equals(act)) {
                    ArrayList<Uri> list = it.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
                    if (list != null) uris.addAll(list);
                }
                for (Uri u : uris) {
                    if (name.isEmpty()) name = displayName(u);
                    text.append(readText(u)).append("\n");
                }
                if (uris.isEmpty()) {
                    CharSequence t = it.getCharSequenceExtra(Intent.EXTRA_TEXT);
                    if (t != null) text.append(t);
                    String subj = it.getStringExtra(Intent.EXTRA_SUBJECT);
                    if (subj != null && text.indexOf("BEGIN:") < 0) text.insert(0, subj + "\n");
                    name = "geteiltem Text";
                }
                if (text.length() > 0) PlanerSystemPlugin.offerFile(name.isEmpty() ? "Kalenderdatei" : name, text.toString());
            } catch (Exception e) {
                android.util.Log.w("Planer", "Kalenderdatei konnte nicht gelesen werden: " + e.getMessage());
            }
        }).start();
    }

    private String readText(Uri u) throws Exception {
        try (InputStream is = getContentResolver().openInputStream(u)) {
            if (is == null) return "";
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            int n, total = 0;
            while ((n = is.read(buf)) > 0 && total < 8 * 1024 * 1024) {
                bo.write(buf, 0, n);
                total += n;
            }
            return new String(bo.toByteArray(), StandardCharsets.UTF_8);
        }
    }

    private String displayName(Uri u) {
        try (Cursor c = getContentResolver().query(u, new String[] { OpenableColumns.DISPLAY_NAME }, null, null, null)) {
            if (c != null && c.moveToFirst() && !c.isNull(0)) return c.getString(0);
        } catch (Exception ignored) {}
        String p = u.getLastPathSegment();
        return p != null ? p : "";
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
