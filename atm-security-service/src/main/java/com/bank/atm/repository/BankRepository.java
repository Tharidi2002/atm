package com.bank.atm.repository;

import com.bank.atm.entity.Bank;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BankRepository extends JpaRepository<Bank, Long> {
    List<Bank> findByStatus(Bank.Status status);
    boolean existsByBankCode(String bankCode);
}