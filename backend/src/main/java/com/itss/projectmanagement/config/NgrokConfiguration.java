package com.itss.projectmanagement.config;

import com.github.alexdlaird.ngrok.NgrokClient;
import com.github.alexdlaird.ngrok.conf.JavaNgrokConfig;
import com.github.alexdlaird.ngrok.protocol.CreateTunnel;
import com.github.alexdlaird.ngrok.protocol.Region;
import com.github.alexdlaird.ngrok.protocol.Tunnel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Slf4j
@Configuration
public class NgrokConfiguration implements ApplicationListener<ApplicationReadyEvent> {

    @Value("${ngrok.enabled:false}")
    private boolean ngrokEnabled;

    @Value("${ngrok.auth-token:}")
    private String authToken;

    @Value("${ngrok.region:us}")
    private String region;

    @Value("${ngrok.subdomain:}")
    private String subdomain;

    @Value("${server.port:8080}")
    private int serverPort;

    private NgrokClient ngrokClient;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        if (!ngrokEnabled) {
            log.info("Ngrok is disabled. Set ngrok.enabled=true to enable tunneling.");
            return;
        }

        try {
            startNgrokTunnel();
        } catch (Exception e) {
            log.error("Failed to start ngrok tunnel: {}", e.getMessage(), e);
        }
    }

    private void startNgrokTunnel() {
        log.info("Starting ngrok tunnel...");

        // Build ngrok configuration
        JavaNgrokConfig.Builder configBuilder = new JavaNgrokConfig.Builder();
        
        if (StringUtils.hasText(authToken)) {
            configBuilder.withAuthToken(authToken);
        }
        
        if (StringUtils.hasText(region)) {
            try {
                configBuilder.withRegion(Region.valueOf(region.toUpperCase()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid region '{}', using default region US", region);
                configBuilder.withRegion(Region.US);
            }
        }

        // Create ngrok client
        ngrokClient = new NgrokClient.Builder()
                .withJavaNgrokConfig(configBuilder.build())
                .build();

        // Create tunnel configuration
        CreateTunnel.Builder tunnelBuilder = new CreateTunnel.Builder()
                .withAddr(serverPort)
                .withProto("http");

        if (StringUtils.hasText(subdomain)) {
            tunnelBuilder.withSubdomain(subdomain);
        }

        // Start the tunnel
        Tunnel tunnel = ngrokClient.connect(tunnelBuilder.build());
        
        String publicUrl = tunnel.getPublicUrl();
        log.info("╔══════════════════════════════════════════════════════════════╗");
        log.info("║                    🚀 NGROK TUNNEL STARTED                    ║");
        log.info("║                                                              ║");
        log.info("║  Local URL:  http://localhost:{}                         ║", serverPort);
        log.info("║  Public URL: {}                              ║", publicUrl);
        log.info("║                                                              ║");
        log.info("║  📋 Copy this URL to share your backend with others!         ║");
        log.info("╚══════════════════════════════════════════════════════════════╝");

        // Update frontend URL configuration
        System.setProperty("app.ngrok.public-url", publicUrl);
        
        // Add shutdown hook to close tunnel
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            if (ngrokClient != null) {
                log.info("Closing ngrok tunnel...");
                ngrokClient.disconnect(tunnel);
                ngrokClient.kill();
            }
        }));
    }

    public String getPublicUrl() {
        return System.getProperty("app.ngrok.public-url");
    }
} 