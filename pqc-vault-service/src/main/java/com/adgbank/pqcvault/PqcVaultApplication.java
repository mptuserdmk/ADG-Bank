package com.adgbank.pqcvault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class PqcVaultApplication {

    public static void main(String[] args) {
        SpringApplication.run(PqcVaultApplication.class, args);
    }
}

