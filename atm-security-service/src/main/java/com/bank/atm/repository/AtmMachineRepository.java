package com.bank.atm.repository;

import com.bank.atm.entity.AtmMachine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AtmMachineRepository extends JpaRepository<AtmMachine, Long> {
    List<AtmMachine> findByBranchId(Long branchId);
    List<AtmMachine> findByBankId(Long bankId);
    Optional<AtmMachine> findBySimNumber(String simNumber);
    Optional<AtmMachine> findByAtmCode(String atmCode);  // 🔥 New
    boolean existsByAtmCode(String atmCode);
}