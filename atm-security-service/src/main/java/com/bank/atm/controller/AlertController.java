package com.bank.atm.controller;

import com.bank.atm.entity.AlertLog;
import com.bank.atm.entity.AtmMachine;
import com.bank.atm.repository.AtmMachineRepository;
import com.bank.atm.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;
    private final AtmMachineRepository atmMachineRepository;

    @PostMapping("/sms-simulate")
    public ResponseEntity<AlertLog> simulateSMS(@RequestBody Map<String, String> smsData) {
        String simNumber = smsData.get("simNumber");
        String message = smsData.get("message");
        return ResponseEntity.ok(alertService.processIncomingSMS(simNumber, message));
    }

    @GetMapping
    public ResponseEntity<List<AlertLog>> getAllAlerts() {
        List<AlertLog> alerts = alertService.getAllAlerts();
        // Each alert එකට ATM details load කරන්න
        alerts.forEach(alert -> {
            if (alert.getAtmId() != null) {
                atmMachineRepository.findById(alert.getAtmId()).ifPresent(atm -> {
                    alert.setAtmMachine(atm);
                });
            }
        });
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<AlertLog>> getAlertsByBranch(@PathVariable Long branchId) {
        List<AlertLog> alerts = alertService.getAlertsByBranch(branchId);
        alerts.forEach(alert -> {
            if (alert.getAtmId() != null) {
                atmMachineRepository.findById(alert.getAtmId()).ifPresent(atm -> {
                    alert.setAtmMachine(atm);
                });
            }
        });
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/bank/{bankId}")
    public ResponseEntity<List<AlertLog>> getAlertsByBank(@PathVariable Long bankId) {
        List<AlertLog> alerts = alertService.getAlertsByBank(bankId);
        alerts.forEach(alert -> {
            if (alert.getAtmId() != null) {
                atmMachineRepository.findById(alert.getAtmId()).ifPresent(atm -> {
                    alert.setAtmMachine(atm);
                });
            }
        });
        return ResponseEntity.ok(alerts);
    }

    @PutMapping("/{alertId}/resolve")
    public ResponseEntity<AlertLog> resolveAlert(
            @PathVariable Long alertId,
            @RequestBody Map<String, Long> request) {
        return ResponseEntity.ok(alertService.resolveAlert(alertId, request.get("userId")));
    }
}