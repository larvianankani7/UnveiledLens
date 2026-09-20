package com.unveiledlens.scanner;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class SafeHttpScanner {

    public Map<String, Object> safeValidate(String targetUrl) {
        Map<String, Object> result = new HashMap<>();
        result.put("reachable", false);
        
        try {
            URI uri = new URI(targetUrl);
            String host = uri.getHost();
            if (host == null || isInternal(host)) {
                return result;
            }

            URL url = uri.toURL();
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(3000);
            connection.setReadTimeout(3000);
            connection.setInstanceFollowRedirects(false);

            int status = connection.getResponseCode();
            result.put("status", status);
            result.put("contentType", connection.getContentType());
            
            if (status >= 200 && status < 400) {
                result.put("reachable", true);
            }
            
        } catch (Exception e) {
            log.debug("Validation failed for {}: {}", targetUrl, e.getMessage());
        }
        
        return result;
    }

    private boolean isInternal(String host) {
        if (host.equalsIgnoreCase("localhost") || host.endsWith(".local") || host.contains("169.254.169.254")) {
            return true;
        }
        try {
            InetAddress address = InetAddress.getByName(host);
            byte[] addr = address.getAddress();
            
            // 127.0.0.0/8
            if (addr[0] == 127) return true;
            
            // 10.0.0.0/8
            if (addr[0] == 10) return true;
            
            // 172.16.0.0/12
            if ((addr[0] & 0xFF) == 172 && ((addr[1] & 0xFF) >= 16 && (addr[1] & 0xFF) <= 31)) return true;
            
            // 192.168.0.0/16
            if ((addr[0] & 0xFF) == 192 && (addr[1] & 0xFF) == 168) return true;
            
            // 169.254.0.0/16
            if ((addr[0] & 0xFF) == 169 && (addr[1] & 0xFF) == 254) return true;

            // 0.0.0.0/8
            if (addr[0] == 0) return true;
            
        } catch (Exception e) {
            return true; // if we can't resolve, consider unsafe
        }
        return false;
    }
}
