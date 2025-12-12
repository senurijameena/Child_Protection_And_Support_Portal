package com.example.childPortal.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz

                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/cases/report").permitAll() 
                .requestMatchers("/api/help-requests/request").permitAll() 
                .requestMatchers("/api/feedback/public").permitAll()
                .requestMatchers("/api/track/**").permitAll() 
                .requestMatchers("/api/health").permitAll() 

                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/transfers/pending").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/transfers/urgent").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/transfers/*/approve").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/transfers/*/reject").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/feedback/all").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/feedback/*/respond").hasAuthority("ROLE_ADMIN")
                
                // Police Officer endpoints
                .requestMatchers("/api/cases/assign/officer").hasAuthority("ROLE_PO")
                .requestMatchers("/api/transfers/case/request").hasAnyAuthority("ROLE_PO", "ROLE_SW")
                
                // Social Worker endpoints
                .requestMatchers("/api/help-requests/assign").hasAuthority("ROLE_SW")
                .requestMatchers("/api/services/offer").hasAuthority("ROLE_SW")
                .requestMatchers("/api/transfers/help-request/request").hasAuthority("ROLE_SW")
                
                // Authenticated users (all roles)
                .requestMatchers("/api/user/**").authenticated()
                .requestMatchers("/api/cases/my-cases").authenticated()
                .requestMatchers("/api/help-requests/my-requests").authenticated()
                .requestMatchers("/api/feedback/submit").authenticated()
                .requestMatchers("/api/services/user/**").authenticated()
                .requestMatchers("/api/transfers/user/**").authenticated()
                .requestMatchers("/api/timeline/**").authenticated()
                
                // Default - require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}