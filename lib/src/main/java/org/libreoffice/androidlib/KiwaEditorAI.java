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
