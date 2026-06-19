package com.bank.atm.repository;

import com.bank.atm.entity.AlertLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertLogRepository extends JpaRepository<AlertLog, Long> {
    List<AlertLog> findAllByOrderByReceivedAtDesc();
}