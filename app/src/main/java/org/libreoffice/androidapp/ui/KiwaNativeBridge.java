package org.libreoffice.androidapp.ui;

import android.content.Context;
import android.webkit.JavascriptInterface;

public class KiwaNativeBridge {
    private final Context context;

    public KiwaNativeBridge(Context c) {
        this.context = c;
    }

    @JavascriptInterface
    public String getAppInfo() {
        return "{\"version\":\"1.0.0\",\"platform\":\"android\"}";
    }

    @JavascriptInterface
    public String listFiles() {
        return "[]";
    }

    @JavascriptInterface
    public void openFile(String path) {
        // Wired in Cycle 2 — for now this is a no-op
    }

    @JavascriptInterface
    public void createFile(String type) {
        // Wired in Cycle 2 — for now this is a no-op
    }

    @JavascriptInterface
    public String loadSettings() {
        return "{}";
    }

    @JavascriptInterface
    public void saveSettings(String json) {
        // Wired in Cycle 3
    }

    @JavascriptInterface
    public String testAIConnection(String json) {
        return "{\"ok\":false,\"reason\":\"cycle-4\"}";
    }

    @JavascriptInterface
    public String sendAIMessage(String json) {
        return "{\"text\":\"Kiwa AI is coming in the next build.\"}";
    }
}
