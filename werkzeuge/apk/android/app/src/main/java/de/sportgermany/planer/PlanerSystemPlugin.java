package de.sportgermany.planer;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Android-Besonderheiten für das Design „Material You“:
 * colors – Farben aus dem Hintergrundbild (Android 12+, „Monet“), bars – Farbe und Symbolfarbe von Status- und Navigationsleiste,
 * haptic – kurze Rückmeldung beim Abhaken (ohne Berechtigung, über die Ansicht).
 */
@CapacitorPlugin(name = "PlanerSystem")
public class PlanerSystemPlugin extends Plugin {

    private static final int[] TONES = { 10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 };

    /** Systemfarben als Tonleitern: accent1–3, neutral1–2, je Ton (10…900) eine Farbe #rrggbb. Vor Android 12: dynamic = false. */
    @PluginMethod
    public void colors(PluginCall call) {
        JSObject r = new JSObject();
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            r.put("dynamic", false);
            call.resolve(r);
            return;
        }
        String[] names = { "accent1", "accent2", "accent3", "neutral1", "neutral2" };
        for (String n : names) {
            JSObject t = new JSObject();
            for (int tone : TONES) {
                int id = getContext().getResources().getIdentifier("system_" + n + "_" + tone, "color", "android");
                if (id != 0) t.put(String.valueOf(tone), hex(getContext().getColor(id)));
            }
            r.put(n, t);
        }
        r.put("dynamic", true);
        call.resolve(r);
    }

    /** Status- und Navigationsleiste: Hintergrund (bei Android 15+ zeichnet die App selbst darunter) und helle/dunkle Symbole. */
    @PluginMethod
    public void bars(PluginCall call) {
        String bg = call.getString("bg", "#141218");
        boolean light = call.getBoolean("light", false);
        Activity a = getActivity();
        a.runOnUiThread(() -> {
            try {
                Window w = a.getWindow();
                int c = Color.parseColor(bg);
                if (Build.VERSION.SDK_INT < 35) {
                    w.setStatusBarColor(c);
                    w.setNavigationBarColor(c);
                }
                w.getDecorView().setBackgroundColor(c);
                WindowInsetsControllerCompat ic = WindowCompat.getInsetsController(w, w.getDecorView());
                ic.setAppearanceLightStatusBars(light);
                ic.setAppearanceLightNavigationBars(light);
                call.resolve();
            } catch (Exception e) {
                call.reject(e.getMessage());
            }
        });
    }

    /** Kurze Rückmeldung (abhaken, erledigt, langer Druck). */
    @PluginMethod
    public void haptic(PluginCall call) {
        String kind = call.getString("kind", "tap");
        Activity a = getActivity();
        a.runOnUiThread(() -> {
            View v = a.getWindow().getDecorView();
            int c = HapticFeedbackConstants.KEYBOARD_TAP;
            if ("done".equals(kind) && Build.VERSION.SDK_INT >= 30) c = HapticFeedbackConstants.CONFIRM;
            else if ("long".equals(kind)) c = HapticFeedbackConstants.LONG_PRESS;
            v.performHapticFeedback(c);
            call.resolve();
        });
    }

    private static String hex(int c) {
        return String.format("#%06X", 0xFFFFFF & c);
    }
}
