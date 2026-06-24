package com.bank.atm.controller;

import com.bank.atm.entity.AlertLog;
import com.bank.atm.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*") // Test Lap එකේ Postman හෝ වෙනත් ඕනෑම බාහිර IP එකකට අවසර දීම සඳහා
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    // 1. Test Lap එකේ Postman එකෙන් SMS එකක් ආවා වගේ simulate කරලා My Lap DB එක update කරන API එක
    // URL: POST http://<MY_LAP_IP>:8080/api/alerts/sms-simulate
    @PostMapping("/sms-simulate")
    public ResponseEntity<AlertLog> simulateSMS(@RequestBody Map<String, String> smsData) {
        String simNumber = smsData.get("simNumber");
        String message = smsData.get("message");

        AlertLog savedLog = alertService.processIncomingSMS(simNumber, message);
        return ResponseEntity.ok(savedLog);
    }

    // 2. දැනට තියෙන ඔක්කොම Alerts ලැයිස්තුව බලන API එක
    // URL: GET http://<MY_LAP_IP>:8080/api/alerts
    @GetMapping
    public ResponseEntity<List<AlertLog>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }
}