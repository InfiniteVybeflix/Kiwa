package org.libreoffice.androidapp.ui;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Shared HTTP client for AI requests. Both KiwaHomeActivity and LOActivity
 * (via KiwaEditorAI) call into this. Returns JSON strings, never throws.
 */
public final class KiwaAI {

    private KiwaAI() {}

    public static String request(String payloadJson, boolean testMode) {
        HttpURLConnection conn = null;
        try {
            JSONObject payload = new JSONObject(payloadJson == null ? "{}" : payloadJson);
            String provider = payload.optString("provider", "aevibron");
            String baseUrl = payload.optString("baseUrl", "").trim();
            String apiKey = payload.optString("apiKey", "").trim();
            String model = payload.optString("model", "core-v3").trim();
            String systemPrompt = payload.optString("systemPrompt", "").trim();
            JSONArray messages = payload.optJSONArray("messages");

            if (baseUrl.isEmpty()) {
                return errorJson("No base URL configured. Open Settings and set a provider.");
            }
            while (baseUrl.endsWith("/")) baseUrl = baseUrl.substring(0, baseUrl.length() - 1);

            if (!provider.equals("aevibron") && apiKey.isEmpty()) {
                return errorJson("No API key set for " + provider + ".");
            }

            JSONObject body = new JSONObject();
            body.put("model", model);

            if (provider.equals("anthropic")) {
                if (!systemPrompt.isEmpty()) body.put("system", systemPrompt);
                JSONArray userMsgs = new JSONArray();
                if (testMode) {
                    JSONObject m = new JSONObject();
                    m.put("role", "user");
                    m.put("content", "Reply with the single word: ready");
                    userMsgs.put(m);
                } else if (messages != null) {
                    for (int i = 0; i < messages.length(); i++) {
                        JSONObject m = messages.getJSONObject(i);
                        String role = m.optString("role", "user");
                        if (!role.equals("system")) userMsgs.put(m);
                    }
                }
                body.put("messages", userMsgs);
                body.put("max_tokens", 2048);
            } else {
                JSONArray outgoing = new JSONArray();
                if (!systemPrompt.isEmpty()) {
                    JSONObject sys = new JSONObject();
                    sys.put("role", "system");
                    sys.put("content", systemPrompt);
                    outgoing.put(sys);
                }
                if (testMode) {
                    JSONObject m = new JSONObject();
                    m.put("role", "user");
                    m.put("content", "Reply with the single word: ready");
                    outgoing.put(m);
                } else if (messages != null) {
                    for (int i = 0; i < messages.length(); i++) {
                        outgoing.put(messages.get(i));
                    }
                }
                body.put("messages", outgoing);
                body.put("stream", false);
            }

            String endpoint = provider.equals("anthropic") ? "/messages" : "/chat/completions";
            URL url = new URL(baseUrl + endpoint);

            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=utf-8");
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(20000);
            conn.setReadTimeout(90000);
            conn.setDoOutput(true);

            if (provider.equals("aevibron")) {
                conn.setRequestProperty("X-Aevibron-Key", apiKey);
            } else if (provider.equals("anthropic")) {
                conn.setRequestProperty("x-api-key", apiKey);
                conn.setRequestProperty("anthropic-version", "2023-06-01");
            } else {
                conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            }

            byte[] bodyBytes = body.toString().getBytes("UTF-8");
            conn.setFixedLengthStreamingMode(bodyBytes.length);
            OutputStream os = conn.getOutputStream();
            os.write(bodyBytes);
            os.flush();
            os.close();

            int code = conn.getResponseCode();
            InputStream is = (code >= 200 && code < 300) ? conn.getInputStream() : conn.getErrorStream();
            String raw = readStream(is);

            if (code < 200 || code >= 300) {
                return errorJson("HTTP " + code + ": " + truncate(raw, 400));
            }

            JSONObject resp = new JSONObject(raw);
            String text = "";

            if (provider.equals("anthropic")) {
                JSONArray content = resp.optJSONArray("content");
                if (content != null && content.length() > 0) {
                    text = content.getJSONObject(0).optString("text", "");
                }
            } else {
                JSONArray choices = resp.optJSONArray("choices");
                if (choices != null && choices.length() > 0) {
                    JSONObject first = choices.getJSONObject(0);
                    JSONObject msg = first.optJSONObject("message");
                    if (msg != null) text = msg.optString("content", "");
                    if (text.isEmpty()) text = first.optString("text", "");
                }
            }

            if (text.isEmpty()) {
                return errorJson("Empty response from " + provider + ". Raw: " + truncate(raw, 200));
            }

            JSONObject out = new JSONObject();
            out.put("ok", true);
            out.put("text", text);
            out.put("provider", provider);
            out.put("model", model);
            return out.toString();

        } catch (java.net.SocketTimeoutException e) {
            return errorJson("Request timed out. Check your connection.");
        } catch (java.net.UnknownHostException e) {
            return errorJson("No internet connection.");
        } catch (Exception e) {
            return errorJson(e.getClass().getSimpleName() + ": " + (e.getMessage() == null ? "unknown" : e.getMessage()));
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    static String readStream(InputStream is) {
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

    static String truncate(String s, int n) {
        if (s == null) return "";
        return s.length() <= n ? s : s.substring(0, n) + "...";
    }

    static String errorJson(String message) {
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
