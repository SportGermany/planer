package de.sportgermany.planer;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Widget für den Startbildschirm – derselbe Baustein in jeder App (werkzeuge/PLAN-APPS.md, Schritt 8).
 * Den Inhalt (Kopf, Titel, Zeile, Sprungziel) setzt die Web-Seite über PlanerSystem.setWidget; hier wird nur gezeichnet.
 * Antippen öffnet die App an der Stelle „ziel“.
 */
public class PlanerWidget extends AppWidgetProvider {

    static final String PREFS = "planer_widget";

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) mgr.updateAppWidget(id, views(ctx));
    }

    static RemoteViews views(Context ctx) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.planer_widget);
        v.setTextViewText(R.id.w_kopf, p.getString("kopf", ctx.getString(R.string.app_name)));
        v.setTextViewText(R.id.w_titel, p.getString("titel", "App öffnen"));
        v.setTextViewText(R.id.w_zeile, p.getString("zeile", ""));
        Intent it = new Intent(ctx, MainActivity.class);
        it.setAction("de.sportgermany.WIDGET");
        it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        String ziel = p.getString("ziel", "");
        if (!ziel.isEmpty()) it.putExtra(PlanerSystemPlugin.EXTRA_ZIEL, ziel);
        v.setOnClickPendingIntent(R.id.w_root, PendingIntent.getActivity(ctx, 7, it, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        return v;
    }

    /** Neu zeichnen, nachdem die App neue Inhalte gespeichert hat. */
    static void refresh(Context ctx) {
        AppWidgetManager m = AppWidgetManager.getInstance(ctx);
        int[] ids = m.getAppWidgetIds(new ComponentName(ctx, PlanerWidget.class));
        if (ids.length > 0) m.updateAppWidget(ids, views(ctx));
    }
}
