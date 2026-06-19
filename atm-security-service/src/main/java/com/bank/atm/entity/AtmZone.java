package com.bank.atm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "atm_zones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtmZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "atm_id", nullable = false)
    private AtmMachine atmMachine;

    @Column(name = "zone_number", nullable = false)
    private Integer zoneNumber;

    @Column(name = "zone_name", nullable = false)
    private String zoneName;
}