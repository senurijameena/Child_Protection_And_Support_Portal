package com.example.childPortal.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
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
import org.springframework.http.HttpMethod;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "*"
        ));

        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));

        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));

        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));

        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Autowired
    private SecurityExceptionHandler securityExceptionHandler;
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http

            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .csrf(csrf -> csrf.disable())

            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(securityExceptionHandler)
                .accessDeniedHandler(securityExceptionHandler)
            )

            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers("/error").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/cases/public/**").permitAll()
                .requestMatchers("/statistics/public").permitAll()
                .requestMatchers("/api/feedback/public").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/stations", "/api/stations/**").permitAll()
                .requestMatchers("/api/contact/public").permitAll()

                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/police/**").hasAuthority("ROLE_PO")
                .requestMatchers("/api/cases/officer/**").hasAuthority("ROLE_PO")
                .requestMatchers("/api/services/offer").hasAuthority("ROLE_SW")
                .requestMatchers("/api/help-requests/assign").hasAuthority("ROLE_SW")

                .requestMatchers("/api/user/**").authenticated()
                .requestMatchers("/api/cases/**").authenticated()
                .requestMatchers("/api/help-requests/**").authenticated()
                .requestMatchers("/api/feedback/**").authenticated()
                .requestMatchers("/api/services/**").authenticated()
                .requestMatchers("/api/transfers/**").authenticated()
                .requestMatchers("/api/timeline/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                .requestMatchers("/api/status/**").authenticated()
                .requestMatchers("/api/duplicates/**").authenticated()
                .requestMatchers("/api/dashboard/**").authenticated()
                .requestMatchers("/api/anonymity/**").authenticated()

                // Combined app: allow GET to non-API paths (static frontend, SPA routes)
                .requestMatchers(request -> HttpMethod.GET.name().equals(request.getMethod())
                        && request.getRequestURI() != null
                        && !request.getRequestURI().startsWith("/api"))
                .permitAll()

                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}