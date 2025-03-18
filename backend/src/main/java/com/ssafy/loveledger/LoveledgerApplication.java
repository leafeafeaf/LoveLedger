package com.ssafy.loveledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.ssafy.loveledger.domain.user.domain.repository")
public class LoveledgerApplication {

    public static void main(String[] args) {
        SpringApplication.run(LoveledgerApplication.class, args);
    }

}
