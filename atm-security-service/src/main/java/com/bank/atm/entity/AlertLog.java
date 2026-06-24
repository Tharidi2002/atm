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

    @Column(name = "zone_numbers")
    private String zoneNumbers;  // Multiple zones සඳහා (උදා: "01,08,03")

    @Column(name = "alert_type", nullable = false, length = 255)
    private String alertType;  // Clean message එක (Payload)

    @Column(name = "raw_message", columnDefinition = "TEXT")
    private String rawMessage;  // Original SMS එක

    @Column(name = "received_at")
    private LocalDateTime receivedAt = LocalDateTime.now();

    @Column(length = 20)
    private String status = "PENDING";
}