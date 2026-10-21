package de.sportgermany.planer;

import android.Manifest;
import android.content.ContentProviderOperation;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.database.Cursor;
import android.net.Uri;
import android.provider.CalendarContract;
import android.provider.CalendarContract.Calendars;
import android.provider.CalendarContract.Events;
import android.provider.CalendarContract.Instances;
import android.provider.CalendarContract.Reminders;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;
import org.json.JSONObject;

/**
 * Handykalender für die App Planer (Android-Kalenderanbieter, auch Samsung „Mein Kalender“ ohne Konto).
 * - Die App schreibt ihre Termine in einen eigenen, lokalen Kalender „Planer“ (Konto-Typ LOCAL). Jeder Eintrag trägt
 *   seinen Schlüssel aus der App in SYNC_DATA1 und eine Prüfsumme in SYNC_DATA2 – so wird nur Geändertes geschrieben.
 * - Gelesen werden die Termine aller sichtbaren Kalender (ohne „Planer“), als einzelne Vorkommen (Instances).
 * - Handytermine kann die App ändern oder löschen (update/remove).
 */
@CapacitorPlugin(
    name = "PlanerKalender",
    permissions = { @Permission(alias = "kalender", strings = { Manifest.permission.READ_CALENDAR, Manifest.permission.WRITE_CALENDAR }) }
)
public class PlanerKalenderPlugin extends Plugin {

    static final String ACCOUNT = "Planer";

    private ContentResolver cr() {
        return getContext().getContentResolver();
    }

    private boolean granted(PluginCall call) {
        if (getPermissionState("kalender") == PermissionState.GRANTED) return true;
        call.reject("Kein Zugriff auf den Kalender erlaubt", "NO_PERMISSION");
        return false;
    }

    private static Uri asSync(Uri uri) {
        return uri
            .buildUpon()
            .appendQueryParameter(CalendarContract.CALLER_IS_SYNCADAPTER, "true")
            .appendQueryParameter(Calendars.ACCOUNT_NAME, ACCOUNT)
            .appendQueryParameter(Calendars.ACCOUNT_TYPE, CalendarContract.ACCOUNT_TYPE_LOCAL)
            .build();
    }

    @PluginMethod
    public void status(PluginCall call) {
        JSObject r = new JSObject();
        r.put("permission", getPermissionState("kalender").toString());
        r.put("calendarId", getPermissionState("kalender") == PermissionState.GRANTED ? ownId() : -1);
        call.resolve(r);
    }

    @PluginMethod
    public void request(PluginCall call) {
        if (getPermissionState("kalender") == PermissionState.GRANTED) {
            status(call);
            return;
        }
        requestPermissionForAlias("kalender", call, "permissionDone");
    }

    @PermissionCallback
    private void permissionDone(PluginCall call) {
        status(call);
    }

    private long ownId() {
        try (
            Cursor c = cr()
                .query(
                    Calendars.CONTENT_URI,
                    new String[] { Calendars._ID },
                    Calendars.ACCOUNT_NAME + "=? AND " + Calendars.ACCOUNT_TYPE + "=?",
                    new String[] { ACCOUNT, CalendarContract.ACCOUNT_TYPE_LOCAL },
                    null
                )
        ) {
            if (c != null && c.moveToFirst()) return c.getLong(0);
        } catch (Exception e) {
            return -1;
        }
        return -1;
    }

    /** Kalender „Planer“ anlegen (falls nötig) und seine ID liefern. */
    @PluginMethod
    public void ensure(PluginCall call) {
        if (!granted(call)) return;
        long id = ownId();
        if (id < 0) {
            ContentValues v = new ContentValues();
            v.put(Calendars.ACCOUNT_NAME, ACCOUNT);
            v.put(Calendars.ACCOUNT_TYPE, CalendarContract.ACCOUNT_TYPE_LOCAL);
            v.put(Calendars.NAME, "planer");
            v.put(Calendars.CALENDAR_DISPLAY_NAME, "Planer");
            v.put(Calendars.CALENDAR_COLOR, call.getInt("color", 0xFF529CCA));
            v.put(Calendars.CALENDAR_ACCESS_LEVEL, Calendars.CAL_ACCESS_OWNER);
            v.put(Calendars.OWNER_ACCOUNT, ACCOUNT);
            v.put(Calendars.VISIBLE, 1);
            v.put(Calendars.SYNC_EVENTS, 1);
            v.put(Calendars.CALENDAR_TIME_ZONE, TimeZone.getDefault().getID());
            Uri u = cr().insert(asSync(Calendars.CONTENT_URI), v);
            id = u == null ? -1 : ContentUris.parseId(u);
        }
        JSObject r = new JSObject();
        r.put("calendarId", id);
        call.resolve(r);
    }

    /** Alle Kalender des Handys. */
    @PluginMethod
    public void calendars(PluginCall call) {
        if (!granted(call)) return;
        JSArray list = new JSArray();
        long own = ownId();
        try (
            Cursor c = cr()
                .query(
                    Calendars.CONTENT_URI,
                    new String[] {
                        Calendars._ID,
                        Calendars.CALENDAR_DISPLAY_NAME,
                        Calendars.ACCOUNT_NAME,
                        Calendars.ACCOUNT_TYPE,
                        Calendars.CALENDAR_COLOR,
                        Calendars.VISIBLE,
                        Calendars.CALENDAR_ACCESS_LEVEL,
                        Calendars.SYNC_EVENTS
                    },
                    null,
                    null,
                    null
                )
        ) {
            while (c != null && c.moveToNext()) {
                JSObject o = new JSObject();
                o.put("id", c.getLong(0));
                o.put("name", c.getString(1));
                o.put("account", c.getString(2));
                o.put("type", c.getString(3));
                o.put("color", String.format("#%06X", 0xFFFFFF & c.getInt(4)));
                o.put("visible", c.getInt(5) == 1);
                o.put("writable", c.getInt(6) >= Calendars.CAL_ACCESS_CONTRIBUTOR);
                o.put("own", c.getLong(0) == own);
                // Google-Kalender, die nur per Internetadresse eingebunden sind, stehen oft mit „nicht synchronisieren“ im Handy
                o.put("sync", c.isNull(7) || c.getInt(7) == 1);
                list.put(o);
            }
        }
        JSObject r = new JSObject();
        r.put("calendars", list);
        call.resolve(r);
    }

    /**
     * Kalender auf dem Handy synchronisieren lassen (z. B. per Link eingebundene Google-Kalender):
     * SYNC_EVENTS und VISIBLE dürfen auch Apps setzen; danach Abgleich des Kontos anstoßen.
     */
    @PluginMethod
    public void enableSync(PluginCall call) {
        if (!granted(call)) return;
        long id = call.getLong("id", -1L);
        if (id < 0) {
            call.reject("id fehlt", "NO_ID");
            return;
        }
        String accName = null, accType = null;
        try (Cursor c = cr().query(ContentUris.withAppendedId(Calendars.CONTENT_URI, id), new String[] { Calendars.ACCOUNT_NAME, Calendars.ACCOUNT_TYPE }, null, null, null)) {
            if (c != null && c.moveToFirst()) {
                accName = c.getString(0);
                accType = c.getString(1);
            }
        }
        ContentValues v = new ContentValues();
        v.put(Calendars.SYNC_EVENTS, 1);
        v.put(Calendars.VISIBLE, 1);
        int n = 0;
        try {
            n = cr().update(ContentUris.withAppendedId(Calendars.CONTENT_URI, id), v, null, null);
        } catch (Exception e) {
            call.reject("Das Handy erlaubt das Einschalten hier nicht: " + e.getMessage(), "DENIED");
            return;
        }
        boolean asked = false;
        if (accName != null && accType != null) {
            try {
                android.os.Bundle ex = new android.os.Bundle();
                ex.putBoolean(ContentResolver.SYNC_EXTRAS_MANUAL, true);
                ex.putBoolean(ContentResolver.SYNC_EXTRAS_EXPEDITED, true);
                ContentResolver.requestSync(new android.accounts.Account(accName, accType), CalendarContract.AUTHORITY, ex);
                asked = true;
            } catch (Exception ignored) {}
        }
        JSObject r = new JSObject();
        r.put("updated", n);
        r.put("syncRequested", asked);
        call.resolve(r);
    }

    /** Termine (einzelne Vorkommen) zwischen from und to (ms) aus allen sichtbaren Kalendern außer „Planer“. */
    @PluginMethod
    public void instances(PluginCall call) {
        if (!granted(call)) return;
        long from = call.getLong("from", System.currentTimeMillis());
        long to = call.getLong("to", from + 90L * 86400000L);
        long own = ownId();
        Uri.Builder b = Instances.CONTENT_URI.buildUpon();
        ContentUris.appendId(b, from);
        ContentUris.appendId(b, to);
        JSArray list = new JSArray();
        try (
            Cursor c = cr()
                .query(
                    b.build(),
                    new String[] {
                        Instances.EVENT_ID,
                        Instances.CALENDAR_ID,
                        Instances.TITLE,
                        Instances.BEGIN,
                        Instances.END,
                        Instances.ALL_DAY,
                        Instances.DESCRIPTION,
                        Instances.EVENT_LOCATION,
                        Instances.CALENDAR_DISPLAY_NAME,
                        Instances.DISPLAY_COLOR,
                        Instances.RRULE,
                        Instances.EVENT_TIMEZONE
                    },
                    Instances.VISIBLE + "=1",
                    null,
                    Instances.BEGIN + " ASC"
                )
        ) {
            while (c != null && c.moveToNext()) {
                if (c.getLong(1) == own) continue;
                JSObject o = new JSObject();
                o.put("eventId", c.getLong(0));
                o.put("calendarId", c.getLong(1));
                o.put("title", c.getString(2));
                o.put("begin", c.getLong(3));
                o.put("end", c.getLong(4));
                o.put("allDay", c.getInt(5) == 1);
                o.put("description", c.getString(6));
                o.put("location", c.getString(7));
                o.put("calendar", c.getString(8));
                o.put("color", String.format("#%06X", 0xFFFFFF & c.getInt(9)));
                o.put("recurring", c.getString(10) != null && !c.getString(10).isEmpty());
                list.put(o);
            }
        }
        JSObject r = new JSObject();
        r.put("events", list);
        call.resolve(r);
    }

    /**
     * Termine der App in den Kalender „Planer“ schreiben.
     * events: [{ key, h (Prüfsumme), title, start, end (ms), allDay, description, reminder (Min. vorher, -1 = keine) }]
     * prune: Einträge, deren Schlüssel nicht mehr vorkommt, löschen.
     */
    @PluginMethod
    public void write(PluginCall call) {
        if (!granted(call)) return;
        long cal = call.getLong("calendarId", ownId());
        if (cal < 0) {
            call.reject("Kalender „Planer“ fehlt", "NO_CALENDAR");
            return;
        }
        boolean prune = call.getBoolean("prune", true);
        JSArray events = call.getArray("events", new JSArray());
        Map<String, long[]> have = new HashMap<>();
        Map<String, String> hashes = new HashMap<>();
        try (
            Cursor c = cr()
                .query(
                    asSync(Events.CONTENT_URI),
                    new String[] { Events._ID, Events.SYNC_DATA1, Events.SYNC_DATA2 },
                    Events.CALENDAR_ID + "=? AND " + Events.DELETED + "=0",
                    new String[] { String.valueOf(cal) },
                    null
                )
        ) {
            while (c != null && c.moveToNext()) {
                String k = c.getString(1);
                if (k == null) continue;
                have.put(k, new long[] { c.getLong(0) });
                hashes.put(k, c.getString(2));
            }
        }
        ArrayList<ContentProviderOperation> ops = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        int added = 0, changed = 0, removed = 0;
        String tz = TimeZone.getDefault().getID();
        try {
            for (int i = 0; i < events.length(); i++) {
                JSONObject e = events.getJSONObject(i);
                String key = e.getString("key");
                if (!seen.add(key)) continue;
                String h = e.optString("h", "");
                long[] old = have.get(key);
                if (old != null && h.equals(hashes.get(key))) continue;
                boolean allDay = e.optBoolean("allDay", false);
                ContentValues v = new ContentValues();
                v.put(Events.CALENDAR_ID, cal);
                v.put(Events.TITLE, e.optString("title", "Termin"));
                v.put(Events.DESCRIPTION, e.optString("description", ""));
                v.put(Events.DTSTART, e.getLong("start"));
                v.put(Events.DTEND, e.getLong("end"));
                v.put(Events.ALL_DAY, allDay ? 1 : 0);
                v.put(Events.EVENT_TIMEZONE, allDay ? "UTC" : tz);
                v.put(Events.SYNC_DATA1, key);
                v.put(Events.SYNC_DATA2, h);
                int rem = e.optInt("reminder", -1);
                v.put(Events.HAS_ALARM, rem >= 0 ? 1 : 0);
                if (old != null) {
                    ops.add(ContentProviderOperation.newUpdate(asSync(ContentUris.withAppendedId(Events.CONTENT_URI, old[0]))).withValues(v).build());
                    ops.add(
                        ContentProviderOperation.newDelete(asSync(Reminders.CONTENT_URI))
                            .withSelection(Reminders.EVENT_ID + "=?", new String[] { String.valueOf(old[0]) })
                            .build()
                    );
                    if (rem >= 0) ops.add(
                        ContentProviderOperation.newInsert(asSync(Reminders.CONTENT_URI))
                            .withValue(Reminders.EVENT_ID, old[0])
                            .withValue(Reminders.MINUTES, rem)
                            .withValue(Reminders.METHOD, Reminders.METHOD_ALERT)
                            .build()
                    );
                    changed++;
                } else {
                    int at = ops.size();
                    ops.add(ContentProviderOperation.newInsert(asSync(Events.CONTENT_URI)).withValues(v).build());
                    if (rem >= 0) ops.add(
                        ContentProviderOperation.newInsert(asSync(Reminders.CONTENT_URI))
                            .withValueBackReference(Reminders.EVENT_ID, at)
                            .withValue(Reminders.MINUTES, rem)
                            .withValue(Reminders.METHOD, Reminders.METHOD_ALERT)
                            .build()
                    );
                    added++;
                }
                if (ops.size() > 300) {
                    cr().applyBatch(CalendarContract.AUTHORITY, ops);
                    ops.clear();
                }
            }
            if (prune) {
                for (Map.Entry<String, long[]> x : have.entrySet()) {
                    if (seen.contains(x.getKey())) continue;
                    ops.add(ContentProviderOperation.newDelete(asSync(ContentUris.withAppendedId(Events.CONTENT_URI, x.getValue()[0]))).build());
                    removed++;
                    if (ops.size() > 300) {
                        cr().applyBatch(CalendarContract.AUTHORITY, ops);
                        ops.clear();
                    }
                }
            }
            if (!ops.isEmpty()) cr().applyBatch(CalendarContract.AUTHORITY, ops);
        } catch (Exception ex) {
            call.reject("Schreiben in den Kalender fehlgeschlagen: " + ex.getMessage(), ex);
            return;
        }
        JSObject r = new JSObject();
        r.put("added", added);
        r.put("changed", changed);
        r.put("removed", removed);
        r.put("calendarId", cal);
        call.resolve(r);
    }

    /** Einen Handytermin ändern (aus der App heraus). Wiederholte Termine werden als Ganzes geändert. */
    @PluginMethod
    public void update(PluginCall call) {
        if (!granted(call)) return;
        long id = call.getLong("eventId", -1L);
        ContentValues v = new ContentValues();
        if (call.hasOption("title")) v.put(Events.TITLE, call.getString("title"));
        if (call.hasOption("description")) v.put(Events.DESCRIPTION, call.getString("description"));
        if (call.hasOption("start")) {
            boolean allDay = call.getBoolean("allDay", false);
            v.put(Events.DTSTART, call.getLong("start"));
            v.put(Events.DTEND, call.getLong("end"));
            v.put(Events.ALL_DAY, allDay ? 1 : 0);
            v.put(Events.EVENT_TIMEZONE, allDay ? "UTC" : TimeZone.getDefault().getID());
        }
        int n = cr().update(ContentUris.withAppendedId(Events.CONTENT_URI, id), v, null, null);
        JSObject r = new JSObject();
        r.put("updated", n);
        call.resolve(r);
    }

    /** Einen Handytermin löschen. */
    @PluginMethod
    public void remove(PluginCall call) {
        if (!granted(call)) return;
        long id = call.getLong("eventId", -1L);
        int n = cr().delete(ContentUris.withAppendedId(Events.CONTENT_URI, id), null, null);
        JSObject r = new JSObject();
        r.put("removed", n);
        call.resolve(r);
    }
}
