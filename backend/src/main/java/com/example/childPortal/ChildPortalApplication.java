package com.example.childPortal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.example.childPortal")
public class ChildPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChildPortalApplication.class, args);
    }
}