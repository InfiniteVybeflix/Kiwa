package org.libreoffice.androidlib;

import android.content.Context;
import android.content.SharedPreferences;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONObject;

public class KiwaEditorAI {
    private static final String PREFS = "kiwa_prefs";
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
