package com.ssafy.loveledger.global.config;

import com.ssafy.loveledger.global.auth.filter.CustomLogoutFilter;
import com.ssafy.loveledger.global.auth.filter.JWTFilter;
import com.ssafy.loveledger.global.auth.handler.CustomSuccessHandler;
import com.ssafy.loveledger.global.auth.service.CustomOAuth2UserService;
import com.ssafy.loveledger.global.auth.util.JWTUtil;
import com.ssafy.loveledger.global.config.handler.CustomAuthenticationEntryPoint;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomSuccessHandler customSuccessHandler;
    private final JWTUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.exceptionHandling(ex ->
            ex.authenticationEntryPoint(customAuthenticationEntryPoint) // ✅ 인증 실패 시 403 JSON 응답 반환
        );

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
            .addFilterBefore(new JWTFilter(jwtUtil),
                UsernamePasswordAuthenticationFilter.class);

        //oauth2 설정
        http.oauth2Login((oauth2) -> oauth2
            .userInfoEndpoint(userInfoEndpointConfig -> userInfoEndpointConfig
                .userService(customOAuth2UserService))
            .successHandler(customSuccessHandler));

        http
            .addFilterBefore(new CustomLogoutFilter(jwtUtil, redisTemplate),
                LogoutFilter.class);

        //인가
        http.authorizeHttpRequests(

            (auth) -> auth.requestMatchers("/test/**", "/reissue").permitAll()
                .anyRequest().authenticated());

        // 세션 stateless
        http.sessionManagement(
            (session) -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();

    }
}
