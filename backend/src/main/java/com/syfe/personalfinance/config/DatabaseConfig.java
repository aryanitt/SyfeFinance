package com.syfe.personalfinance.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();
        
        // If url is not set in properties, lookup from standard environment variables
        if (url == null || url.trim().isEmpty()) {
            url = System.getenv("SPRING_DATASOURCE_URL");
        }
        if (url == null || url.trim().isEmpty()) {
            url = System.getenv("RENDER_DATABASE_URL");
        }
        if (url == null || url.trim().isEmpty()) {
            url = System.getenv("DATABASE_URL");
        }

        if (url != null) {
            url = url.trim();
            // Programmatically prepend jdbc: prefix to any postgresql/postgres scheme
            if (url.startsWith("postgresql://")) {
                url = "jdbc:" + url;
            } else if (url.startsWith("postgres://")) {
                url = "jdbc:postgresql://" + url.substring("postgres://".length());
            }
        } else {
            // Fallback default H2
            url = "jdbc:h2:mem:syfedb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";
        }

        String username = properties.determineUsername();
        if (username == null || username.trim().isEmpty()) {
            username = System.getenv("SPRING_DATASOURCE_USERNAME");
        }
        if (username == null || username.trim().isEmpty()) {
            username = "sa";
        }

        String password = properties.determinePassword();
        if (password == null || password.trim().isEmpty()) {
            password = System.getenv("SPRING_DATASOURCE_PASSWORD");
        }
        if (password == null || password.trim().isEmpty()) {
            password = "password";
        }

        String driverClassName = properties.determineDriverClassName();
        if (driverClassName == null || driverClassName.trim().isEmpty()) {
            if (url.contains("h2")) {
                driverClassName = "org.h2.Driver";
            } else {
                driverClassName = "org.postgresql.Driver";
            }
        }

        return DataSourceBuilder.create()
                .driverClassName(driverClassName)
                .url(url)
                .username(username)
                .password(password)
                .build();
    }
}
