package org.libreoffice.androidapp.ui;

import org.libreoffice.androidlib.KiwaAI;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.pdf.PdfRenderer;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.ParcelFileDescriptor;
import android.provider.Settings;
import android.util.LruCache;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class KiwaNativeBridge {
    private final KiwaHomeActivity host;
    private final Activity activity;
    private static final String PREFS = "kiwa_prefs";
    // Maximum size for the in-memory thumbnail LRU cache. Roughly ~32 entries at 256x256 ARGB_8888.
    private static final int THUMB_CACHE_BYTES = 32 * 1024 * 1024;
    private final LruCache<String, String> thumbCache = new LruCache<>(THUMB_CACHE_BYTES);

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
                // Real first-page thumbnail for PDFs (built-in PdfRenderer),
                // empty for other types — JS uses a styled colored card
                // with the file-type icon for those. We cache the data URL
                // so we don't re-render every time the home screen reloads.
                if ("pdf".equals(typeForExt(ext))) {
                    String thumb = thumbCache.get(f.getAbsolutePath());
                    if (thumb == null) {
                        thumb = renderPdfThumbnail(f);
                        if (thumb != null) thumbCache.put(f.getAbsolutePath(), thumb);
                    }
                    o.put("thumb", thumb != null ? thumb : "");
                } else {
                    o.put("thumb", "");
                }
                arr.put(o);
            } catch (Exception e) { /* skip */ }
        }
        return arr.toString();
    }

    /** Render the first page of a PDF to a 320x430 (A4 portrait ratio) PNG
     *  data URL. Returns null on any failure. Runs on the calling thread. */
    private String renderPdfThumbnail(File pdfFile) {
        if (pdfFile == null || !pdfFile.exists()) return null;
        ParcelFileDescriptor fd = null;
        PdfRenderer renderer = null;
        try {
            fd = ParcelFileDescriptor.open(pdfFile, ParcelFileDescriptor.MODE_READ_ONLY);
            renderer = new PdfRenderer(fd);
            if (renderer.getPageCount() <= 0) {
                renderer.close();
                fd.close();
                return null;
            }
            PdfRenderer.Page page = renderer.openPage(0);
            int targetW = 320;
            int targetH = (int) Math.round(targetW * (page.getHeight() / (double) Math.max(1, page.getWidth())));
            // Cap height to keep memory bounded.
            if (targetH > 600) targetH = 600;
            Bitmap bmp = Bitmap.createBitmap(targetW, targetH, Bitmap.Config.ARGB_8888);
            bmp.eraseColor(Color.WHITE);
            Canvas canvas = new Canvas(bmp);
            Paint p = new Paint();
            p.setAntiAlias(true);
            p.setFilterBitmap(true);
            page.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);
            page.close();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            bmp.compress(Bitmap.CompressFormat.JPEG, 80, baos);
            bmp.recycle();
            byte[] bytes = baos.toByteArray();
            String b64 = android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP);
            return "data:image/jpeg;base64," + b64;
        } catch (Throwable t) {
            return null;
        } finally {
            try { if (renderer != null) renderer.close(); } catch (Throwable ignored) {}
            try { if (fd != null) fd.close(); } catch (Throwable ignored) {}
        }
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
                File f = new File(path);
                if (!f.exists()) {
                    Toast.makeText(activity, "File not found: " + path, Toast.LENGTH_SHORT).show();
                    return;
                }
                Uri fileUri = androidx.core.content.FileProvider.getUriForFile(
                        activity,
                        activity.getPackageName() + ".fileprovider",
                        f);
                Intent intent = new Intent(activity, org.libreoffice.androidlib.LOActivity.class);
                intent.setAction(Intent.ACTION_VIEW);
                intent.setData(fileUri);
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                activity.startActivity(intent);
            } catch (Exception e) {
                Toast.makeText(activity, "Cannot open: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private String pendingAIContent = null;
    private String pendingName = null;
    private String pendingTemplateAsset = null;  // asset name to seed a new file with

    @JavascriptInterface
    public void createFile(String type) {
        pendingAIContent = null;
        pendingName = null;
        pendingTemplateAsset = null;
        host.runOnUiThread(() -> host.createAndOpenFile(type, null));
    }

    @JavascriptInterface
    public void createFileWithContent(String type, String content) {
        pendingAIContent = content;
        pendingName = deriveName(content);
        pendingTemplateAsset = null;
        host.runOnUiThread(() -> host.createAndOpenFile(type, null));
    }

    /**
     * Create a new file seeded with the content of a bundled template asset
     * (e.g. "templates/modern_resume.docx"). The asset is copied to a
     * temp file, then the editor is launched with that file as the source.
     * After the SAF create dialog returns a target URI, the host will
     * call consumePendingTemplateAsset() to get the asset name and copy
     * the asset content into the user-chosen location.
     */
    @JavascriptInterface
    public void createFileFromTemplate(String templateId, String type) {
        // The template registry in JS already knows which asset belongs to
        // which template id. We just stash the id so the host can resolve
        // it via the template registry. For now we accept the asset path
        // directly in the form "templates/<filename>".
        pendingTemplateAsset = templateId;
        pendingAIContent = null;
        pendingName = null;
        host.runOnUiThread(() -> host.createAndOpenFile(type, templateId));
    }

    /** Called by the host after the SAF create dialog returns a URI. */
    public String consumePendingAIContent() {
        String c = pendingAIContent;
        pendingAIContent = null;
        return c;
    }

    /** Called by the host when choosing a filename for a new file. */
    public String consumePendingName() {
        String n = pendingName;
        pendingName = null;
        return n;
    }

    /** Called by the host to know whether to seed the new file from a
     *  bundled template asset. Returns the asset name (e.g. "templates/foo.docx")
     *  or null. The host should call copyAssetToUri() with this name to
     *  seed the new file. */
    public String consumePendingTemplateAsset() {
        String a = pendingTemplateAsset;
        pendingTemplateAsset = null;
        return a;
    }

    /** Copies an asset (relative path inside the assets dir) to a content
     *  URI returned by the SAF create dialog. Used to seed a new file
     *  with a bundled template. Returns true on success. */
    public boolean copyAssetToUri(String assetName, Uri targetUri) {
        InputStream is = null;
        OutputStream os = null;
        try {
            is = activity.getAssets().open(assetName);
            os = activity.getContentResolver().openOutputStream(targetUri, "wt");
            if (os == null) {
                os = activity.getContentResolver().openOutputStream(targetUri);
            }
            if (os == null) return false;
            byte[] buf = new byte[8192];
            int n;
            while ((n = is.read(buf)) > 0) os.write(buf, 0, n);
            os.flush();
            return true;
        } catch (IOException e) {
            return false;
        } finally {
            try { if (is != null) is.close(); } catch (IOException ignored) {}
            try { if (os != null) os.close(); } catch (IOException ignored) {}
        }
    }

    private String deriveName(String content) {
        if (content == null || content.isEmpty()) return null;
        String[] lines = content.split("\\r?\\n");
        for (String line : lines) {
            String t = line.trim();
            if (t.isEmpty()) continue;
            // strip markdown heading markers
            t = t.replaceAll("^#+\\s*", "");
            // strip leading list markers
            t = t.replaceAll("^[\\*\\-0-9.\\)]+\\s+", "");
            // cap length
            if (t.length() > 40) t = t.substring(0, 40).trim();
            // remove filename-invalid characters
            t = t.replaceAll("[/\\\\:*?\"<>|]", "");
            if (!t.isEmpty()) return t;
        }
        return null;
    }

    @JavascriptInterface
    public void importFile() {
        host.runOnUiThread(() -> host.importAndOpenFile());
    }

    /**
     * Share a file via the Android share sheet. Takes the absolute file
     * path (as returned by listFiles) and uses a FileProvider to grant
     * read access to other apps.
     */
    @JavascriptInterface
    public void shareFile(final String path) {
        host.runOnUiThread(() -> {
            try {
                if (path == null || path.isEmpty()) {
                    Toast.makeText(activity, "No file to share", Toast.LENGTH_SHORT).show();
                    return;
                }
                File f = new File(path);
                if (!f.exists()) {
                    Toast.makeText(activity, "File not found", Toast.LENGTH_SHORT).show();
                    return;
                }
                Uri uri = androidx.core.content.FileProvider.getUriForFile(
                        activity,
                        activity.getPackageName() + ".fileprovider",
                        f);
                Intent share = new Intent(Intent.ACTION_SEND);
                share.setType("*/*");
                share.putExtra(Intent.EXTRA_STREAM, uri);
                share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                Intent chooser = Intent.createChooser(share, "Share " + f.getName());
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(chooser);
            } catch (Exception e) {
                Toast.makeText(activity, "Cannot share: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    /**
     * Trigger a SAF "delete" intent for the given file. Currently we open
     * the document in the editor's delete flow via DocumentsContract — but
     * since Android SAF doesn't expose a single-file delete intent for
     * arbitrary paths, we just open the system file picker so the user can
     * delete from there. The simplest robust path is to delete the file
     * directly via java.io.File.delete() — only call this for files the
     * user explicitly asked to remove.
     */
    @JavascriptInterface
    public boolean deleteFile(String path) {
        if (path == null || path.isEmpty()) return false;
        try {
            File f = new File(path);
            if (!f.exists()) return false;
            return f.delete();
        } catch (Exception e) {
            return false;
        }
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

    // ==================== TEMPLATE REGISTRY ====================
    //
    // We expose a single canonical list of bundled templates to JS so the
    // HTML side does not need to maintain its own parallel array. The
    // metadata (name, type, asset path) is generated at build time and
    // shipped as `kiwa_templates.json` in the app assets.

    @JavascriptInterface
    public String listTemplates() {
        try {
            InputStream is = activity.getAssets().open("kiwa_templates.json");
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = is.read(buf)) > 0) baos.write(buf, 0, n);
            is.close();
            return baos.toString("UTF-8");
        } catch (IOException e) {
            // Fall back to an empty array so the UI doesn't break.
            return "[]";
        }
    }

    // ==================== AI TEMPLATE GENERATION ====================
    //
    // Premium feature: ask the AI to generate a complete document based on
    // the user's natural-language prompt. The AI returns a structured
    // document (markdown-like), which we then convert into editable
    // content and pass to the editor via the existing pending-AI-content
    // flow.

    /**
     * Asynchronously generate a document's content from a user prompt
     * and the selected template type. The result is delivered back to
     * JS via host.deliverAIResponse() so the UI can show a "Creating..."
     * indicator and then trigger the SAF create dialog.
     *
     * @param callId     unique id used to match the response
     * @param prompt     the user's natural-language request (e.g.
     *                   "write me a professional resignation letter for
     *                   a graphic designer with 4 years experience")
     * @param type       "doc" | "sheet" | "slide"  (drives the file extension)
     */
    @JavascriptInterface
    public void generateDocumentFromPrompt(final String callId, final String prompt, final String type) {
        new Thread(() -> {
            String result = generateDocumentFromPromptInternal(prompt, type);
            host.deliverAIResponse(callId, result);
        }).start();
    }

    /**
     * Build the AI request, send it, and return the response as JSON
     * {ok: true, content: "...", type: "..."} on success,
     * {ok: false, error: "..."} on failure.
     */
    private String generateDocumentFromPromptInternal(String userPrompt, String type) {
        try {
            SharedPreferences sp = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String settingsJson = sp.getString("json", "{}");
            JSONObject settings = new JSONObject(settingsJson);
            String provider = settings.optString("provider", "aevibron");
            String apiKey = settings.optString("apiKey", "");
            String baseUrl = settings.optString("baseUrl", "https://aevibron-gateway.vercel.app/api/v1");
            String model = settings.optString("model", "aevibron-core-v3");

            // Build a strong system prompt that produces a clean, editable
            // document. We ask for plain markdown-ish text (no code fences)
            // because the editor will receive it as plain text via
            // .uno:InsertText.
            String typeHint = "a Word document (.docx)";
            if ("sheet".equals(type)) typeHint = "a spreadsheet (.xlsx) — produce one row per line, columns separated by | (pipe)";
            else if ("slide".equals(type)) typeHint = "a presentation (.pptx) — start each slide with a # heading, then bullet points";

            String systemPrompt =
                "You are Kiwa AI, a document generator inside the Kiwa Studio office suite.\n" +
                "The user is asking you to generate the content for " + typeHint + ".\n" +
                "Produce complete, professional, ready-to-use content — not a stub.\n" +
                "Rules:\n" +
                "1. Output ONLY the document content. No preamble, no commentary, no markdown code fences.\n" +
                "2. Use plain text formatting. Use blank lines between paragraphs.\n" +
                "3. For headings, use a single # for H1, ## for H2, ### for H3.\n" +
                "4. For bullet lists, use - prefix. For numbered lists, use 1. 2. 3.\n" +
                "5. For tables, use markdown table syntax (| header | header |\\n|---|---|\\n| cell | cell |).\n" +
                "6. Be specific and realistic — use real-sounding names, dates, numbers, and details where appropriate.\n" +
                "7. Match the requested document type and the user's stated purpose.\n" +
                "8. Aim for a complete document the user could actually use with minimal edits (300-1500 words for documents).\n" +
                "9. Do not invent instructions for the user; just produce the content.";

            JSONArray messages = new JSONArray();
            JSONObject userMsg = new JSONObject();
            userMsg.put("role", "user");
            userMsg.put("content", userPrompt);
            messages.put(userMsg);

            JSONObject payload = new JSONObject();
            payload.put("provider", provider);
            payload.put("apiKey", apiKey);
            payload.put("baseUrl", baseUrl);
            payload.put("model", model);
            payload.put("messages", messages);
            payload.put("systemPrompt", systemPrompt);

            String aiResponse = KiwaAI.request(payload.toString(), false);
            JSONObject resp = new JSONObject(aiResponse);
            if (!resp.optBoolean("ok", false)) {
                return aiResponse;  // forward the error JSON
            }
            // Wrap the content for the JS side
            JSONObject out = new JSONObject();
            out.put("ok", true);
            out.put("content", resp.optString("text", ""));
            out.put("type", type);
            out.put("provider", resp.optString("provider", provider));
            out.put("model", resp.optString("model", model));
            return out.toString();
        } catch (Exception e) {
            return errorJson("Template generation failed: " + e.getMessage());
        }
    }

    /**
     * After the AI has generated content and the user confirms, JS calls
     * this to start the file-create flow with that content pre-loaded.
     * Same as createFileWithContent, but with a separate name so the JS
     * can attach UI feedback ("Generated by AI").
     */
    @JavascriptInterface
    public void createFileWithAIContent(String type, String content) {
        // Reuse the existing flow — same behavior, just a clearer JS API.
        createFileWithContent(type, content);
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
