package com.example.childPortal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ChildPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChildPortalApplication.class, args);
    }
}
