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

    @ManyToOne
    @JoinColumn(name = "atm_id")
    private AtmMachine atmMachine;

    @Column(name = "zone_number")
    private Integer zoneNumber;

    @Column(name = "alert_type", nullable = false)
    private String alertType;

    @Column(name = "received_at")
    private LocalDateTime receivedAt = LocalDateTime.now();

    private String status = "PENDING";
}