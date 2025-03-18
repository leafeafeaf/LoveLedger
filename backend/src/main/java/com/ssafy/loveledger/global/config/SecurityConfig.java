package com.ssafy.loveledger.global.config;

import com.ssafy.loveledger.global.auth.filter.JWTFilter;
import com.ssafy.loveledger.global.auth.handler.CustomSuccessHandler;
import com.ssafy.loveledger.global.auth.service.CustomOAuth2UserService;
import com.ssafy.loveledger.global.util.JWTUtil;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomSuccessHandler customSuccessHandler;
    private final JWTUtil jwtUtil;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        //cors
        http
            .cors(
                corsCustomizer -> corsCustomizer.configurationSource(new CorsConfigurationSource() {

                    @Override
                    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {

                        CorsConfiguration configuration = new CorsConfiguration();

                        configuration.setAllowedOrigins(
                            Collections.singletonList("http://localhost:3000")); // 3000 ?
                        configuration.setAllowedMethods(Collections.singletonList("*"));
                        configuration.setAllowedHeaders(Collections.singletonList("*"));
                        configuration.setAllowCredentials(true);
                        configuration.setMaxAge(3600L);

                        configuration.setExposedHeaders(
                            Arrays.asList("Set-Cookie", "Authorization"));

                        return configuration;
                    }
                }));

        http.csrf((auth) -> auth.disable());

        http.formLogin((auth) -> auth.disable());

        http.httpBasic((auth) -> auth.disable());

        http
            .addFilterBefore(new JWTFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);

        //oauth2 설정
        http.oauth2Login((oauth2) -> oauth2
            .userInfoEndpoint(userInfoEndpointConfig -> userInfoEndpointConfig
                .userService(customOAuth2UserService))
            .successHandler(customSuccessHandler));

        //인가
        http.authorizeHttpRequests(

            (auth) -> auth.requestMatchers("/test", "/").permitAll()
                .anyRequest().permitAll());

        // 세션 stateless
        http.sessionManagement(
            (session) -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();

    }
}
