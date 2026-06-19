package com.bank.atm.repository;

import com.bank.atm.entity.AtmZone;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AtmZoneRepository extends JpaRepository<AtmZone, Long> {
}