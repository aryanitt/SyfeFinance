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

        String username = null;
        String password = null;

        if (url != null) {
            url = url.trim();
            String cleanUrl = url;
            if (cleanUrl.startsWith("jdbc:")) {
                cleanUrl = cleanUrl.substring("jdbc:".length());
            }
            
            if (cleanUrl.startsWith("postgres://") || cleanUrl.startsWith("postgresql://")) {
                String schema = cleanUrl.startsWith("postgres://") ? "postgres://" : "postgresql://";
                String remaining = cleanUrl.substring(schema.length());
                
                if (remaining.contains("@")) {
                    String[] parts = remaining.split("@", 2);
                    String userPass = parts[0];
                    String hostDb = parts[1];
                    
                    if (userPass.contains(":")) {
                        String[] up = userPass.split(":", 2);
                        username = up[0];
                        password = up[1];
                    } else {
                        username = userPass;
                        password = "";
                    }
                    url = "jdbc:postgresql://" + hostDb;
                } else {
                    url = "jdbc:postgresql://" + remaining;
                }
            }
        } else {
            // Fallback default H2
            url = "jdbc:h2:mem:syfedb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";
        }

        // If username not set from URL, fallback to properties and environment
        if (username == null || username.trim().isEmpty()) {
            username = properties.determineUsername();
        }
        if (username == null || username.trim().isEmpty()) {
            username = System.getenv("SPRING_DATASOURCE_USERNAME");
        }
        if (username == null || username.trim().isEmpty()) {
            username = "sa";
        }

        // If password not set from URL, fallback to properties and environment
        if (password == null || password.trim().isEmpty()) {
            password = properties.determinePassword();
        }
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
