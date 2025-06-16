package com.example.RhNova.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow authentication endpoints (except internal user creation)
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                // Restrict internal user creation to HR and admin
                .requestMatchers("/api/auth/create-internal-user").permitAll()
                // .hasAnyRole("ADMIN", "RESPONSABLERH")
                // Allow public job offers (for candidates to see)
                .requestMatchers("/api/joboffers/all", "/api/joboffers/{id}").permitAll()
                // Allow candidate registration and profile creation
                .requestMatchers("/api/candidatures/**").permitAll()
                .requestMatchers("/api/profil/**").permitAll()
                // Protect admin endpoints
                .requestMatchers("/api/admin/**").permitAll()
                .requestMatchers("/api/dashboard/**").permitAll()
                // hasRole("ADMIN")
                // Protect HR endpoints
                .requestMatchers("/api/entretiens/**").permitAll()
                // hasAnyRole("ADMIN", "RESPONSABLERH")
                .requestMatchers("/api/joboffers/create", "/api/joboffers/update/**", "/api/joboffers/delete/**").permitAll()
                // hasAnyRole("ADMIN", "RESPONSABLERH")
                // Protect Manager endpoints
                .requestMatchers("/api/equipes/**").permitAll()
                // hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/taches/**").permitAll()
                // hasAnyRole("ADMIN", "MANAGER", "MEMBRE_EQUIPE")
                // Protect candidate endpoints
                .requestMatchers("/api/candidats/**").
                permitAll()
                // hasAnyRole("ADMIN", "RESPONSABLERH", "CANDIDAT")
                // Allow other requests but require authentication
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}