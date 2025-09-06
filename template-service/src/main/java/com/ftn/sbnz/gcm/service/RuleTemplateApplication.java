package com.ftn.sbnz.gcm.service;

import org.kie.api.KieServices;
import org.kie.api.runtime.KieContainer;
import org.kie.api.builder.KieScanner;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
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

	@Bean
	public KieContainer kieContainer() {
		KieServices ks = KieServices.Factory.get();
		KieContainer kContainer = ks.newKieContainer(ks.newReleaseId("com.ftn.sbnz", "gcm-kjar", "0.0.1-SNAPSHOT"));
		KieScanner kScanner = ks.newKieScanner(kContainer);
		kScanner.start(10_000);

		return kContainer;
	}
}
