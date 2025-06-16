package com.example.RhNova;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties

public class RhNovaApplication {

	public static void main(String[] args) {
		SpringApplication.run(RhNovaApplication.class, args);
	}

}