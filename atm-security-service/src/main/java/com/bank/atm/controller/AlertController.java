package com.bank.atm.controller;

import com.bank.atm.entity.AlertLog;
import com.bank.atm.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*") // React එක සමඟ ලේසියෙන් සම්බන්ධ වීමට
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    // 1. සැබෑ මැෂින් එකක් නැතිව SMS එකක් ආවා වගේ Simulate කරන්න හදන API එක
    // URL: POST http://localhost:8080/api/alerts/sms-simulate
    @PostMapping("/sms-simulate")
    public ResponseEntity<AlertLog> simulateSMS(@RequestBody Map<String, String> smsData) {
        String simNumber = smsData.get("simNumber");
        String message = smsData.get("message");

        AlertLog savedLog = alertService.processIncomingSMS(simNumber, message);
        return ResponseEntity.ok(savedLog);
    }

    // 2. දැනට තියෙන ඔක්කොම Alerts ලැයිස්තුව ගන්න API එක (React Dashboard එකට)
    // URL: GET http://localhost:8080/api/alerts
    @GetMapping
    public ResponseEntity<List<AlertLog>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }
}