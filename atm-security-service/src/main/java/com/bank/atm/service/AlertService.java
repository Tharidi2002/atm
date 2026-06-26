package com.bank.atm.service;

import com.bank.atm.entity.AlertLog;
import com.bank.atm.entity.AtmMachine;
import com.bank.atm.repository.AlertLogRepository;
import com.bank.atm.repository.AtmMachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertLogRepository alertLogRepository;
    private final AtmMachineRepository atmMachineRepository;

    public AlertLog processIncomingSMS(String fromSimNumber, String smsContent) {
        AlertLog alertLog = new AlertLog();
        alertLog.setReceivedAt(LocalDateTime.now());
        alertLog.setStatus(AlertLog.Status.PENDING);

        Optional<AtmMachine> machineOpt = atmMachineRepository.findBySimNumber(fromSimNumber);
        
        if (machineOpt.isPresent()) {
            AtmMachine atm = machineOpt.get();
            alertLog.setAtmId(atm.getId());
            alertLog.setBankId(atm.getBankId());
            alertLog.setBranchId(atm.getBranchId());
        }

        String cleanMessage = smsContent;
        if (fromSimNumber != null && !fromSimNumber.isEmpty()) {
            cleanMessage = cleanMessage.replace(fromSimNumber, "").trim();
        }

        String zoneNumbers = extractZoneNumbers(smsContent);
        
        if (!zoneNumbers.isEmpty()) {
            alertLog.setZoneNumbers(zoneNumbers);
            String firstZone = zoneNumbers.split(",")[0].trim();
            try {
                alertLog.setZoneNumber(Integer.parseInt(firstZone));
            } catch (NumberFormatException e) {
                alertLog.setZoneNumber(0);
            }
        } else {
            alertLog.setZoneNumber(0);
            alertLog.setZoneNumbers("00");
        }

        alertLog.setAlertType(cleanMessage);
        alertLog.setRawMessage(smsContent);
        
        return alertLogRepository.save(alertLog);
    }

    private String extractZoneNumbers(String smsContent) {
        List<String> zones = new ArrayList<>();
        
        if (smsContent == null || smsContent.isEmpty()) {
            return "";
        }
        
        Pattern pattern1 = Pattern.compile("Zone:\\s*(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher1 = pattern1.matcher(smsContent);
        while (matcher1.find()) {
            zones.add(matcher1.group(1));
        }
        
        Pattern pattern2 = Pattern.compile("ZONE\\s*(\\d+)\\s+ALARM!", Pattern.CASE_INSENSITIVE);
        Matcher matcher2 = pattern2.matcher(smsContent);
        while (matcher2.find()) {
            zones.add(matcher2.group(1));
        }
        
        Pattern pattern3 = Pattern.compile("ZONE\\s*(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher3 = pattern3.matcher(smsContent);
        while (matcher3.find()) {
            String zone = matcher3.group(1);
            if (!zones.contains(zone)) {
                zones.add(zone);
            }
        }
        
        List<String> uniqueZones = zones.stream().distinct().collect(Collectors.toList());
        return uniqueZones.isEmpty() ? "" : String.join(",", uniqueZones);
    }

    public List<AlertLog> getAlertsByBranch(Long branchId) {
        return alertLogRepository.findByBranchIdOrderByReceivedAtDesc(branchId);
    }

    public List<AlertLog> getAlertsByBank(Long bankId) {
        return alertLogRepository.findByBankIdOrderByReceivedAtDesc(bankId);
    }

    public List<AlertLog> getAllAlerts() {
        return alertLogRepository.findAllByOrderByReceivedAtDesc();
    }

    public AlertLog resolveAlert(Long alertId, Long userId) {
        AlertLog alert = alertLogRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setStatus(AlertLog.Status.RESOLVED);
        alert.setResolvedBy(userId);
        alert.setResolvedAt(LocalDateTime.now());
        return alertLogRepository.save(alert);
    }
}