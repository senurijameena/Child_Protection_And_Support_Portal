<<<<<<< HEAD
package com.example.childPortal.security;
=======
﻿package com.example.childPortal.security;
>>>>>>> b57aa1fcea2d349e326d066b296146fe5273c2d7

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
<<<<<<< HEAD

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer "){
            String token = header.substring(7);

            if (jwtUtil.validateToken(token){
                String email = jwtUtil.getEmailFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                );

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

=======
        
        String header = request.getHeader("Authorization");
        
        if (header != null && header.startsWith("Bearer "){
            String token = header.substring(7);
            
            if (jwtUtil.validateToken(token){
                String email = jwtUtil.getEmailFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);
                
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    email, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                );
                
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        
>>>>>>> b57aa1fcea2d349e326d066b296146fe5273c2d7
        chain.doFilter(request, response);
    }
}
