package com.bank.atm.repository;

import com.bank.atm.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByBankId(Long bankId);
    List<Branch> findByBankIdAndStatus(Long bankId, Branch.Status status);
    boolean existsByBranchCode(String branchCode);
}