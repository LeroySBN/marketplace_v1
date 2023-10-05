package com.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class StatusController {

    @GetMapping("/status")
    public ResponseEntity<Object> getStatus() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "ok");
        return ResponseEntity.ok(status);
    }
}
