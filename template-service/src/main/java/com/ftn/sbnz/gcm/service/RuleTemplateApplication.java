package com.ftn.sbnz.gcm.service;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication(scanBasePackages = "com.ftn.sbnz.gcm")
@EnableJpaRepositories(basePackages = "com.ftn.sbnz.gcm.service.repository")
@EntityScan(basePackages = "com.ftn.sbnz.gcm.model.models")

@EnableScheduling
public class RuleTemplateApplication {

	public static void main(String[] args) {
		SpringApplication.run(RuleTemplateApplication.class, args);
	}
}
