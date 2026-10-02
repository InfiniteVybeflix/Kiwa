package org.libreoffice.androidapp.ui;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class KiwaNativeBridge {
    private final KiwaHomeActivity host;
    private final Activity activity;
    private static final String PREFS = "kiwa_prefs";

    public KiwaNativeBridge(KiwaHomeActivity host) {
        this.host = host;
        this.activity = host;
    }

    // ==================== APP INFO ====================

    @JavascriptInterface
    public String getAppInfo() {
        try {
            JSONObject o = new JSONObject();
            o.put("version", "1.0.0");
            o.put("platform", "android");
            o.put("sdk", Build.VERSION.SDK_INT);
            o.put("hasStoragePermission", hasStoragePermission());
            return o.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    @JavascriptInterface
    public boolean hasStoragePermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            return Environment.isExternalStorageManager();
        }
        return true;
    }

    @JavascriptInterface
    public void requestStoragePermission() {
        host.runOnUiThread(() -> {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                try {
                    Intent i = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                    i.setData(Uri.parse("package:" + activity.getPackageName()));
                    activity.startActivity(i);
                } catch (Exception e) {
                    try {
                        activity.startActivity(new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION));
                    } catch (Exception e2) {
                        Toast.makeText(activity, "Cannot open settings", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });
    }

    // ==================== FILE SCANNING ====================

    @JavascriptInterface
    public String listFiles() {
        JSONArray arr = new JSONArray();
        List<File> all = new ArrayList<>();
        String[] exts = {
                ".docx", ".doc", ".odt", ".rtf", ".txt", ".md",
                ".xlsx", ".xls", ".ods", ".csv",
                ".pptx", ".ppt", ".odp",
                ".pdf"
        };

        File docs = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
        File downloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        File[] roots = new File[] { docs, downloads };
        for (File root : roots) {
            if (root != null && root.exists() && root.canRead()) {
                scanRecursive(root, exts, all, 3);
            }
        }

        Collections.sort(all, new Comparator<File>() {
            @Override
            public int compare(File a, File b) {
                return Long.compare(b.lastModified(), a.lastModified());
            }
        });

        int limit = Math.min(all.size(), 200);
        for (int i = 0; i < limit; i++) {
            File f = all.get(i);
            try {
                JSONObject o = new JSONObject();
                o.put("name", f.getName());
                o.put("path", f.getAbsolutePath());
                String ext = getExt(f.getName());
                o.put("type", typeForExt(ext));
                o.put("badge", ext.toUpperCase());
                o.put("size", humanSize(f.length()));
                o.put("time", humanTime(f.lastModified()));
                o.put("star", false);
                o.put("ai", false);
                arr.put(o);
            } catch (Exception e) { /* skip */ }
        }
        return arr.toString();
    }

    private void scanRecursive(File dir, String[] exts, List<File> out, int depth) {
        if (depth < 0) return;
        File[] children = dir.listFiles();
        if (children == null) return;
        for (File f : children) {
            if (f.isDirectory()) {
                String n = f.getName();
                if (!n.startsWith(".") && !n.equals("Android") && !n.equals("data")) {
                    scanRecursive(f, exts, out, depth - 1);
                }
            } else {
                String lower = f.getName().toLowerCase();
                for (String e : exts) {
                    if (lower.endsWith(e)) { out.add(f); break; }
                }
            }
        }
    }

    private String getExt(String name) {
        int i = name.lastIndexOf('.');
        if (i < 0) return "";
        return name.substring(i + 1).toLowerCase();
    }

    private String typeForExt(String ext) {
        if (ext.equals("docx") || ext.equals("doc") || ext.equals("odt")
                || ext.equals("rtf") || ext.equals("txt") || ext.equals("md")) return "doc";
        if (ext.equals("xlsx") || ext.equals("xls") || ext.equals("ods") || ext.equals("csv")) return "sheet";
        if (ext.equals("pptx") || ext.equals("ppt") || ext.equals("odp")) return "slide";
        if (ext.equals("pdf")) return "pdf";
        return "doc";
    }

    private String humanSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format(java.util.Locale.US, "%.1f KB", bytes / 1024.0);
        if (bytes < 1024L * 1024L * 1024L) return String.format(java.util.Locale.US, "%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format(java.util.Locale.US, "%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }

    private String humanTime(long millis) {
        long diff = System.currentTimeMillis() - millis;
        long sec = diff / 1000;
        long min = sec / 60;
        long hr = min / 60;
        long day = hr / 24;
        if (sec < 60) return "Just now";
        if (min < 60) return min + " min ago";
        if (hr < 24) return hr + " hour" + (hr == 1 ? "" : "s") + " ago";
        if (day < 7) return day + " day" + (day == 1 ? "" : "s") + " ago";
        return android.text.format.DateFormat.format("MMM d", millis).toString();
    }

    // ==================== FILE ACTIONS ====================

    @JavascriptInterface
    public void openFile(String path) {
        host.runOnUiThread(() -> {
            try {
                Intent intent = new Intent(activity, org.libreoffice.androidlib.LOActivity.class);
                intent.setAction(Intent.ACTION_VIEW);
                intent.setData(Uri.fromFile(new File(path)));
                activity.startActivity(intent);
            } catch (Exception e) {
                Toast.makeText(activity, "Cannot open: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @JavascriptInterface
    public void createFile(String type) {
        host.runOnUiThread(() -> host.createAndOpenFile(type));
    }

    @JavascriptInterface
    public void importFile() {
        host.runOnUiThread(() -> host.importAndOpenFile());
    }

    // ==================== SETTINGS ====================

    @JavascriptInterface
    public String loadSettings() {
        SharedPreferences sp = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        return sp.getString("json", "{}");
    }

    @JavascriptInterface
    public void saveSettings(String json) {
        SharedPreferences sp = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        sp.edit().putString("json", json).apply();
    }

    // ==================== SYSTEM ====================

    @JavascriptInterface
    public String getStorageInfo() {
        try {
            File data = Environment.getDataDirectory();
            android.os.StatFs stat = new android.os.StatFs(data.getPath());
            long total = stat.getBlockCountLong() * stat.getBlockSizeLong();
            long free = stat.getAvailableBlocksLong() * stat.getBlockSizeLong();
            long used = total - free;
            JSONObject o = new JSONObject();
            o.put("totalBytes", total);
            o.put("freeBytes", free);
            o.put("usedBytes", used);
            o.put("totalHuman", humanSize(total));
            o.put("freeHuman", humanSize(free));
            o.put("usedHuman", humanSize(used));
            o.put("percentUsed", total > 0 ? (int)(100.0 * used / total) : 0);
            return o.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    @JavascriptInterface
    public void openUrl(String url) {
        host.runOnUiThread(() -> {
            try {
                Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(i);
            } catch (Exception e) {
                Toast.makeText(activity, "Cannot open link", Toast.LENGTH_SHORT).show();
            }
        });
    }

    // ==================== AI: NETWORK ====================

    @JavascriptInterface
    public void testAIConnection(final String callId, final String json) {
        new Thread(() -> {
            String result = doChatInternal(json, true);
            host.deliverAIResponse(callId, result);
        }).start();
    }

    @JavascriptInterface
    public void sendAIMessage(final String callId, final String json) {
        new Thread(() -> {
            String result = doChatInternal(json, false);
            host.deliverAIResponse(callId, result);
        }).start();
    }

    /**
     * Builds and sends an HTTP request. When testMode is true, we
     * force a short "ping"-style prompt regardless of the caller payload.
     * Returns a JSON string (never throws to the caller).
     */
    private String doChatInternal(String payloadJson, boolean testMode) {
        return KiwaAI.request(payloadJson, testMode);
    }

    private static String readStream(InputStream is) {
        if (is == null) return "";
        StringBuilder sb = new StringBuilder();
        try {
            BufferedReader r = new BufferedReader(new InputStreamReader(is, "UTF-8"));
            String line;
            while ((line = r.readLine()) != null) sb.append(line);
            r.close();
        } catch (Exception e) { /* ignore */ }
        return sb.toString();
    }

    private static String truncate(String s, int n) {
        if (s == null) return "";
        return s.length() <= n ? s : s.substring(0, n) + "...";
    }

    private static String errorJson(String message) {
        try {
            JSONObject o = new JSONObject();
            o.put("ok", false);
            o.put("error", message == null ? "Unknown error" : message);
            return o.toString();
        } catch (Exception e) {
            return "{\"ok\":false,\"error\":\"Unknown\"}";
        }
    }
}
