package com.bank.atm.service;

import com.bank.atm.entity.AlertLog;
import com.bank.atm.entity.AtmMachine;
import com.bank.atm.entity.Bank;
import com.bank.atm.entity.Branch;
import com.bank.atm.repository.AlertLogRepository;
import com.bank.atm.repository.AtmMachineRepository;
import com.bank.atm.repository.BankRepository;
import com.bank.atm.repository.BranchRepository;
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
    private final BankRepository bankRepository;
    private final BranchRepository branchRepository;

    // 🔥 Updated: Accept atmCode parameter
    public AlertLog processIncomingSMS(String fromSimNumber, String smsContent, String atmCode) {
        AlertLog alertLog = new AlertLog();
        alertLog.setReceivedAt(LocalDateTime.now());
        alertLog.setStatus(AlertLog.Status.PENDING);

        // 🔥 Priority 1: Find ATM by ATM Code (from ESP32)
        Optional<AtmMachine> machineOpt = Optional.empty();
        
        if (atmCode != null && !atmCode.isEmpty()) {
            machineOpt = atmMachineRepository.findByAtmCode(atmCode);
            if (machineOpt.isPresent()) {
                System.out.println("[ATM]: Found ATM by Code: " + atmCode);
            }
        }
        
        // 🔥 Priority 2: If not found by ATM Code, try SIM number
        if (!machineOpt.isPresent() && fromSimNumber != null && !fromSimNumber.isEmpty()) {
            machineOpt = atmMachineRepository.findBySimNumber(fromSimNumber);
            if (machineOpt.isPresent()) {
                System.out.println("[ATM]: Found ATM by SIM: " + fromSimNumber);
            }
        }
        
        // 🔥 Priority 3: Try to extract ATM Code from message
        if (!machineOpt.isPresent()) {
            String extractedAtmCode = extractAtmCode(smsContent);
            if (extractedAtmCode != null) {
                machineOpt = atmMachineRepository.findByAtmCode(extractedAtmCode);
                if (machineOpt.isPresent()) {
                    System.out.println("[ATM]: Found ATM by extracted Code: " + extractedAtmCode);
                }
            }
        }
        
        // 🔥 Set ATM details if found
        if (machineOpt.isPresent()) {
            AtmMachine atm = machineOpt.get();
            alertLog.setAtmId(atm.getId());
            alertLog.setBankId(atm.getBankId());
            alertLog.setBranchId(atm.getBranchId());
            alertLog.setAtmMachine(atm);
            
            // Load Bank and Branch details
            bankRepository.findById(atm.getBankId()).ifPresent(bank -> {
                alertLog.setBank(bank);
            });
            branchRepository.findById(atm.getBranchId()).ifPresent(branch -> {
                alertLog.setBranch(branch);
            });
            
            System.out.println("[ATM]: ATM ID: " + atm.getId() + 
                             ", Bank: " + atm.getBankId() + 
                             ", Branch: " + atm.getBranchId());
        } else {
            System.out.println("[ATM]: ⚠️ ATM not found! SIM: " + fromSimNumber + ", Code: " + atmCode);
            alertLog.setAtmId(null);
            alertLog.setBankId(null);
            alertLog.setBranchId(null);
        }

        // Clean message
        String cleanMessage = smsContent;
        if (fromSimNumber != null && !fromSimNumber.isEmpty()) {
            cleanMessage = cleanMessage.replace(fromSimNumber, "").trim();
        }

        // Extract zone numbers
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

    // 🔥 Extract ATM Code from message
    private String extractAtmCode(String smsContent) {
        if (smsContent == null || smsContent.isEmpty()) {
            return null;
        }
        // Pattern for ATM code like ATM-MAIN-01, ATM-Z8B-01 etc.
        Pattern pattern = Pattern.compile("(ATM-[A-Z0-9-]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(smsContent);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    // 🔥 Extract zone numbers from message
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
        List<AlertLog> alerts = alertLogRepository.findByBranchIdOrderByReceivedAtDesc(branchId);
        loadAlertDetails(alerts);
        return alerts;
    }

    public List<AlertLog> getAlertsByBank(Long bankId) {
        List<AlertLog> alerts = alertLogRepository.findByBankIdOrderByReceivedAtDesc(bankId);
        loadAlertDetails(alerts);
        return alerts;
    }

    public List<AlertLog> getAllAlerts() {
        List<AlertLog> alerts = alertLogRepository.findAllByOrderByReceivedAtDesc();
        loadAlertDetails(alerts);
        return alerts;
    }

    public AlertLog resolveAlert(Long alertId, Long userId) {
        AlertLog alert = alertLogRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setStatus(AlertLog.Status.RESOLVED);
        alert.setResolvedBy(userId);
        alert.setResolvedAt(LocalDateTime.now());
        return alertLogRepository.save(alert);
    }

    // 🔥 Helper: Load ATM, Bank, Branch details
    private void loadAlertDetails(List<AlertLog> alerts) {
        alerts.forEach(alert -> {
            if (alert.getAtmId() != null) {
                atmMachineRepository.findById(alert.getAtmId()).ifPresent(atm -> {
                    alert.setAtmMachine(atm);
                });
            }
            if (alert.getBankId() != null) {
                bankRepository.findById(alert.getBankId()).ifPresent(bank -> {
                    alert.setBank(bank);
                });
            }
            if (alert.getBranchId() != null) {
                branchRepository.findById(alert.getBranchId()).ifPresent(branch -> {
                    alert.setBranch(branch);
                });
            }
        });
    }
}