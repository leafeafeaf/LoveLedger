package com.ssafy.loveledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class LoveledgerApplication {

	public static void main(String[] args) {
		SpringApplication.run(LoveledgerApplication.class, args);
	}

}
