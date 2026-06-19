package com.bank.atm.service;

import com.bank.atm.entity.AlertLog;
import com.bank.atm.entity.AtmMachine;
import com.bank.atm.repository.AlertLogRepository;
import com.bank.atm.repository.AtmMachineRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AlertService {

    private final AlertLogRepository alertLogRepository;
    private final AtmMachineRepository atmMachineRepository;

    public AlertService(AlertLogRepository alertLogRepository, AtmMachineRepository atmMachineRepository) {
        this.alertLogRepository = alertLogRepository;
        this.atmMachineRepository = atmMachineRepository;
    }

    // 1. මැෂින් එකෙන් එන SMS එක Process කරලා Save කරන ක්‍රියාවලිය
    public AlertLog processIncomingSMS(String fromSimNumber, String smsContent) {
        AlertLog alertLog = new AlertLog();
        alertLog.setReceivedAt(LocalDateTime.now());
        alertLog.setStatus("PENDING");

        // SIM නම්බර් එකෙන් අදාළ ATM එක හොයනවා
        Optional<AtmMachine> machineOpt = atmMachineRepository.findBySimNumber(fromSimNumber);
        
        if (machineOpt.isPresent()) {
            alertLog.setAtmMachine(machineOpt.get());
        } else {
            // සිම් එක සිස්ටම් එකේ නැත්නම් තාවකාලිකව null තබයි
            alertLog.setAtmMachine(null);
        }

        // Z8B මැෂින් එකෙන් සාමාන්‍යයෙන් එන SMS රටාව: "Alarm! Zone:05 Fire" වගේ එකක්
        // අපි සරලව සෙන්සර් කලාපය (Zone) සහ අනතුර (Alert Type) වෙන් කරගනිමු (Parsing)
        try {
            if (smsContent.contains("Zone:")) {
                int zoneIndex = smsContent.indexOf("Zone:");
                // Zone:05 කියන කොටසෙන් 05 කියන අංකය ගන්නවා
                String zoneStr = smsContent.substring(zoneIndex + 5, zoneIndex + 7).trim();
                alertLog.setZoneNumber(Integer.parseInt(zoneStr));
            } else {
                alertLog.setZoneNumber(0); // පොදු අනතුරක් නම් (උදා: Power Failure)
            }
        } catch (Exception e) {
            alertLog.setZoneNumber(0);
        }

        alertLog.setAlertType(smsContent); // සම්පූර්ණ SMS එකම සටහන් කරගනී
        return alertLogRepository.save(alertLog);
    }

    // 2. සියලුම අනතුරු ඇඟවීම් ලැයිස්තුව ලබාගැනීම (Dashboard එක සඳහා)
    public List<AlertLog> getAllAlerts() {
        return alertLogRepository.findAllByOrderByReceivedAtDesc();
    }
}