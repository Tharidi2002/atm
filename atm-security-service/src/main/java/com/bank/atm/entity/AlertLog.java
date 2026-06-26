package com.bank.atm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alert_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "atm_id", nullable = false)
    private Long atmId;

    @Column(name = "bank_id", nullable = false)
    private Long bankId;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "zone_number")
    private Integer zoneNumber = 0;

    @Column(name = "zone_numbers")
    private String zoneNumbers = "00";

    @Column(name = "alert_type", nullable = false)
    private String alertType;

    @Column(name = "raw_message")
    private String rawMessage;

    @Column(name = "received_at")
    private LocalDateTime receivedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @Column(name = "acknowledged_by")
    private Long acknowledgedBy;

    @Column(name = "resolved_by")
    private Long resolvedBy;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    private String notes;

    public enum Status {
        PENDING, ACKNOWLEDGED, RESOLVED
    }
}