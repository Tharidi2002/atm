package com.bank.atm.controller;

import com.bank.atm.entity.AlertLog;
import com.bank.atm.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @PostMapping("/sms-simulate")
    public ResponseEntity<AlertLog> simulateSMS(@RequestBody Map<String, String> smsData) {
        String simNumber = smsData.get("simNumber");
        String message = smsData.get("message");
        return ResponseEntity.ok(alertService.processIncomingSMS(simNumber, message));
    }

    @GetMapping
    public ResponseEntity<List<AlertLog>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<AlertLog>> getAlertsByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(alertService.getAlertsByBranch(branchId));
    }

    @GetMapping("/bank/{bankId}")
    public ResponseEntity<List<AlertLog>> getAlertsByBank(@PathVariable Long bankId) {
        return ResponseEntity.ok(alertService.getAlertsByBank(bankId));
    }

    @PutMapping("/{alertId}/resolve")
    public ResponseEntity<AlertLog> resolveAlert(
            @PathVariable Long alertId,
            @RequestBody Map<String, Long> request) {
        return ResponseEntity.ok(alertService.resolveAlert(alertId, request.get("userId")));
    }
}