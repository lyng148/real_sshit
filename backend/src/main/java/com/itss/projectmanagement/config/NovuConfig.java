package com.itss.projectmanagement.config;

import co.novu.common.base.Novu;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NovuConfig {

    @Value("${novu.api.key}")
    private String novuApiKey;

    @Bean
    public Novu novuClient() {
        return new Novu(novuApiKey);
    }
}
