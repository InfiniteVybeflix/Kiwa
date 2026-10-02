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
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // FrameLayout wraps the WebView so we can apply system-bar insets
        // as padding on the parent. Padding on the WebView itself does NOT
        // shrink its internal CSS viewport, which is why sticky elements
        // (topbar) ignored the inset. Padding on a parent ViewGroup does.
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
