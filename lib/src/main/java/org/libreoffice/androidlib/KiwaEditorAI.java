package org.libreoffice.androidlib;

import android.content.Context;
import android.content.SharedPreferences;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONObject;

import java.io.File;

public class KiwaEditorAI {
    private static final String PREFS = "kiwa_prefs";
    private static final String CLIPBOARD_FILE = "LibreofficeClipboardFile.data";
    private final Context context;
    private final WebView webView;

    public KiwaEditorAI(Context context, WebView webView) {
        this.context = context;
        this.webView = webView;
    }

    @JavascriptInterface
    public void askAI(final String callId, final String json) {
        new Thread(() -> {
            String result = KiwaAI.request(json, false);
            deliver(callId, result);
        }).start();
    }

    @JavascriptInterface
    public String getSettings() {
        SharedPreferences sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        return sp.getString("json", "{}");
    }

    @JavascriptInterface
    public void saveEditorSettings(final String json) {
        try {
            SharedPreferences sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            sp.edit().putString("json", json).apply();
        } catch (Exception e) { /* ignore */ }
    }

    /**
     * Synchronous call from JS to retrieve the current document text.
     * The JS side triggers `uno .uno:SelectAll` followed by `uno .uno:Copy`,
     * waits a moment for the native clipboard population to complete, then
     * calls this method. We read the clipboard file written by
     * LOActivity.populateClipboard() and return its text content.
     *
     * This is far more reliable than scraping the DOM (Collabora renders
     * to tiles, not text nodes) or calling app.map.getSelectionText()
     * (which is not always available on the mobile build).
     *
     * Returns the text content (UTF-8) or an empty string if the file is
     * missing or cannot be parsed. Never throws.
     */
    @JavascriptInterface
    public String getDocumentText() {
        try {
            File clipboardFile = new File(context.getCacheDir(), CLIPBOARD_FILE);
            if (!clipboardFile.exists()) return "";
            org.libreoffice.androidlib.lok.LokClipboardData data =
                    org.libreoffice.androidlib.lok.LokClipboardData.createFromFile(clipboardFile);
            if (data == null) return "";
            String text = data.getText();
            return text == null ? "" : text;
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Check whether the clipboard file exists. JS uses this to know if the
     * `uno .uno:Copy` step has finished writing the file before calling
     * getDocumentText().
     */
    @JavascriptInterface
    public boolean clipboardFileExists() {
        try {
            File clipboardFile = new File(context.getCacheDir(), CLIPBOARD_FILE);
            return clipboardFile.exists() && clipboardFile.length() > 0;
        } catch (Exception e) {
            return false;
        }
    }

    /** Called from the editor panel JS when an extraction response arrives. */
    @JavascriptInterface
    public void onStructure(final String json) {
        deliverJS("window.KiwaOnStructure", json);
    }

    /** Called from the editor panel JS with any incoming message for debug. */
    @JavascriptInterface
    public void onRawMessage(final String text) {
        deliverJS("window.KiwaOnRawMessage", text);
    }

    /** Called from the editor panel JS when the extraction request fails. */
    @JavascriptInterface
    public void onError(final String message) {
        deliverJS("window.KiwaOnError", message);
    }

    private void deliverJS(final String func, final String payload) {
        if (webView == null) return;
        final String quotedFunc;
        final String quotedPayload;
        try {
            quotedFunc = JSONObject.quote(func);
            quotedPayload = JSONObject.quote(payload == null ? "" : payload);
        } catch (Exception e) { return; }
        webView.post(() -> {
            if (webView == null) return;
            String js = "try{ (typeof " + func + " === 'function') " + func + "(" + quotedPayload + "); }catch(e){}";
            try { webView.evaluateJavascript(js, null); } catch (Exception ignored) {}
        });
    }

    private void deliver(final String callId, final String json) {
        if (webView == null) return;
        final String safeId;
        final String safeJson;
        try {
            safeId = JSONObject.quote(callId);
            safeJson = JSONObject.quote(json == null ? "{}" : json);
        } catch (Exception e) { return; }

        webView.post(() -> {
            if (webView == null) return;
            String js = "try{ if(window.KiwaEditorResponse) window.KiwaEditorResponse("
                    + safeId + "," + safeJson + "); }catch(e){}";
            try { webView.evaluateJavascript(js, null); } catch (Exception ignored) {}
        });
    }
}
