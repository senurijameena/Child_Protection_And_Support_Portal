package com.example.childPortal.controller;
import com.example.childPortal.model.Notification;
import com.example.childPortal.repository.NotificationRepository;
import com.example.childPortal.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; 
import org.springframework.web.bind.annotation.*;
