package org.libreoffice.androidapp.ui;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

public class KiwaHomeActivity extends AppCompatActivity {
    private static final int REQ_CREATE = 2001;
    private static final int REQ_IMPORT = 2002;
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        FrameLayout container = new FrameLayout(this);
        container.setBackgroundColor(0xFF0A0A0C);
        container.setFitsSystemWindows(false);

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF0A0A0C);
        container.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        setContentView(container);

        ViewCompat.setOnApplyWindowInsetsListener(container, (v, insets) -> {
            Insets bars = insets.getInsets(
                    WindowInsetsCompat.Type.systemBars()
                            | WindowInsetsCompat.Type.displayCutout()
            );
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return WindowInsetsCompat.CONSUMED;
        });

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUrl(request.getUrl().toString());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(url);
            }

            private boolean handleUrl(String url) {
                if (url == null) return false;
                if (url.startsWith("mailto:")
                        || url.startsWith("tel:")
                        || url.startsWith("sms:")
                        || url.startsWith("smsto:")
                        || url.startsWith("whatsapp:")
                        || url.startsWith("intent:")) {
                    try {
                        Intent intent;
                        if (url.startsWith("intent:")) {
                            intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                        } else {
                            intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        }
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        if (url.startsWith("mailto:")) {
                            try {
                                Intent fallback = new Intent(Intent.ACTION_SENDTO, Uri.parse(url));
                                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                startActivity(fallback);
                                return true;
                            } catch (ActivityNotFoundException e2) {
                                Toast.makeText(KiwaHomeActivity.this,
                                        "No email app installed", Toast.LENGTH_LONG).show();
                                return true;
                            }
                        }
                        Toast.makeText(KiwaHomeActivity.this,
                                "No app can handle this link", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }
                return false;
            }
        });

        webView.addJavascriptInterface(new KiwaNativeBridge(this), "KiwaNative");
        webView.loadUrl("file:///android_asset/kiwa_studio_v2.html");
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.post(() -> {
                try {
                    webView.evaluateJavascript(
                            "try{ if(window.KiwaReload) window.KiwaReload(); }catch(e){}",
                            null);
                } catch (Exception ignored) {}
            });
        }
    }

    public void createAndOpenFile(String type) {
        String mime;
        String name;
        switch (type == null ? "" : type) {
            case "sheet":
                mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                name = "Untitled Spreadsheet.xlsx";
                break;
            case "slide":
                mime = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                name = "Untitled Presentation.pptx";
                break;
            default:
                mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                name = "Untitled Document.docx";
                break;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mime);
        intent.putExtra(Intent.EXTRA_TITLE, name);
        try {
            startActivityForResult(intent, REQ_CREATE);
        } catch (Exception e) {
            Toast.makeText(this, "Cannot create: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    public void importAndOpenFile() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        String[] mimes = new String[] {
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/msword",
                "application/vnd.ms-excel",
                "application/vnd.ms-powerpoint",
                "application/vnd.oasis.opendocument.text",
                "application/vnd.oasis.opendocument.spreadsheet",
                "application/vnd.oasis.opendocument.presentation",
                "application/pdf",
                "text/plain",
                "text/csv",
                "text/rtf"
        };
        intent.putExtra(Intent.EXTRA_MIME_TYPES, mimes);
        try {
            startActivityForResult(intent, REQ_IMPORT);
        } catch (Exception e) {
            Toast.makeText(this, "Cannot open file picker: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode != RESULT_OK || data == null) return;
        Uri uri = data.getData();
        if (uri == null) return;

        if (requestCode == REQ_CREATE) {
            Intent open = new Intent(this, org.libreoffice.androidlib.LOActivity.class);
            open.setAction(Intent.ACTION_EDIT);
            open.setData(uri);
            try {
                startActivity(open);
            } catch (Exception e) {
                Toast.makeText(this, "Cannot open: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        } else if (requestCode == REQ_IMPORT) {
            Intent open = new Intent(this, org.libreoffice.androidlib.LOActivity.class);
            open.setAction(Intent.ACTION_VIEW);
            open.setData(uri);
            open.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            try {
                startActivity(open);
            } catch (Exception e) {
                Toast.makeText(this, "Cannot open: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        }
    }

    /** Called from a background thread by the bridge. Posts JS back to the WebView. */
    public void deliverAIResponse(final String callId, final String json) {
        if (webView == null) return;
        final String safeCallId = org.json.JSONObject.quote(callId);
        final String safeJson = org.json.JSONObject.quote(json == null ? "{}" : json);
        webView.post(() -> {
            if (webView == null) return;
            String js = "try{ if(window.KiwaAIResponse) window.KiwaAIResponse("
                    + safeCallId + ", " + safeJson + "); }catch(e){}";
            try {
                webView.evaluateJavascript(js, null);
            } catch (Exception ignored) {}
        });
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
