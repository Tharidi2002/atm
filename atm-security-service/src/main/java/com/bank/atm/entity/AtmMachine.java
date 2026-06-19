package com.bank.atm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "atm_machines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtmMachine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "atm_code", unique = true, nullable = false)
    private String atmCode;

    @Column(nullable = false)
    private String location;

    @Column(name = "sim_number", nullable = false)
    private String simNumber;

    private String status = "ACTIVE";
}