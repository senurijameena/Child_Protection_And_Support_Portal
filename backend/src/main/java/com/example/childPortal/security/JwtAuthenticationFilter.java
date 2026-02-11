package com.example.childPortal.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;   

@Component   
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain)
            throws ServletException, IOException {
                String path = request.getRequestURI();
                String method = request.getMethod();

                if (path.startsWith("/api/auth") || path.contains("/api/auth/")) {
                    System.out.println("? JWT Filter: Allowing public auth endpoint - Method: " + method + ", Path: " + path);
                    chain.doFilter(request, response);
                    return;
                }

                if ("OPTIONS".equalsIgnoreCase(method)) {
                    System.out.println("? JWT Filter: Allowing OPTIONS request - Path: " + path);
                    chain.doFilter(request, response);
                    return;
                }

                if (path.startsWith("/api/cases/public") || 
                    path.startsWith("/api/health") ||
                    path.startsWith("/statistics/public") ||
                    path.startsWith("/api/feedback/public") ||
                    path.startsWith("/uploads/")) {
                    chain.doFilter(request, response);
                    return;
                }

                String header = request.getHeader("Authorization");

                if (header != null && header.startsWith("Bearer ")) {
                    try {
                        String token = header.substring(7).trim();
                        if (token != null && !token.isEmpty()) {
                            if (jwtUtil.validateToken(token)) {
                                String userId = jwtUtil.getUserIdFromToken(token);
                                String role = jwtUtil.getRoleFromToken(token);
                                
                                if (userId != null && role != null) {
                                    String normalizedRole = role.toUpperCase();

                                    String authority = "ROLE_" + normalizedRole;
                                    
                                    UsernamePasswordAuthenticationToken auth =
                                        new UsernamePasswordAuthenticationToken(
                                                userId,
                                                null,
                                                Collections.singletonList(
                                                        new SimpleGrantedAuthority(authority)
                                                )
                                        );
                                    SecurityContextHolder.getContext().setAuthentication(auth);

                                    System.out.println("? JWT Authentication successful - UserId: " + userId + ", Role: " + authority + ", Path: " + path);
                                } else {
                                    System.err.println("? JWT token missing userId or role - userId: " + userId + ", role: " + role + ", Path: " + path);
                                    sendErrorResponse(response, "Invalid token: missing user information");
                                    return;
                                }
                            } else {
                                System.err.println("? JWT token validation failed - Path: " + path);
                                sendErrorResponse(response, "Invalid or expired token");
                                return;
                            }
                        } else {
                            System.err.println("? JWT token is empty - Path: " + path);
                            sendErrorResponse(response, "Authorization token is empty");
                            return;
                        }
                    } catch (ExpiredJwtException e) {
                        System.err.println("? JWT token expired - Path: " + path);
                        sendErrorResponse(response, "Token has expired");
                        return;
                    } catch (JwtException e) {
                        System.err.println("? JWT parsing error: " + e.getClass().getSimpleName() + " - " + e.getMessage() + " - Path: " + path);
                        sendErrorResponse(response, "Invalid token format");
                        return;
                    } catch (Exception e) {
                        System.err.println("? JWT validation error: " + e.getClass().getSimpleName() + " - " + e.getMessage() + " - Path: " + path);
                        e.printStackTrace();
                        sendErrorResponse(response, "Token validation error");
                        return;
                    }
                } else {

                    System.err.println("? No Authorization header for protected path: " + path);
                    sendErrorResponse(response, "Authentication required");
                    return;
                }

                chain.doFilter(request, response);
    }
    
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"" + message + "\"}");
    }
}
