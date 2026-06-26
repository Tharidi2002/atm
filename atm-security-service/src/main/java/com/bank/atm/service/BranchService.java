package com.bank.atm.service;

import com.bank.atm.entity.Branch;
import com.bank.atm.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;

    public Branch createBranch(Branch branch) {
        if (branchRepository.existsByBranchCode(branch.getBranchCode())) {
            throw new RuntimeException("Branch code already exists");
        }
        return branchRepository.save(branch);
    }

    public List<Branch> getBranchesByBankId(Long bankId) {
        return branchRepository.findByBankId(bankId);
    }

    public Branch getBranchById(Long id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
    }

    public Branch updateBranch(Long id, Branch branchDetails) {
        Branch branch = getBranchById(id);
        branch.setBranchName(branchDetails.getBranchName());
        branch.setAddress(branchDetails.getAddress());
        branch.setContactNumber(branchDetails.getContactNumber());
        branch.setEmail(branchDetails.getEmail());
        branch.setStatus(branchDetails.getStatus());
        return branchRepository.save(branch);
    }

    public void deleteBranch(Long id) {
        Branch branch = getBranchById(id);
        branch.setStatus(Branch.Status.INACTIVE);
        branchRepository.save(branch);
    }
}