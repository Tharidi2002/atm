package com.bank.atm.service;

import com.bank.atm.entity.Bank;
import com.bank.atm.repository.BankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BankService {

    private final BankRepository bankRepository;

    public Bank createBank(Bank bank) {
        if (bankRepository.existsByBankCode(bank.getBankCode())) {
            throw new RuntimeException("Bank code already exists");
        }
        return bankRepository.save(bank);
    }

    public List<Bank> getAllBanks() {
        return bankRepository.findAll();
    }

    public Bank getBankById(Long id) {
        return bankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bank not found"));
    }

    public Bank updateBank(Long id, Bank bankDetails) {
        Bank bank = getBankById(id);
        bank.setBankName(bankDetails.getBankName());
        bank.setAddress(bankDetails.getAddress());
        bank.setContactNumber(bankDetails.getContactNumber());
        bank.setEmail(bankDetails.getEmail());
        bank.setStatus(bankDetails.getStatus());
        return bankRepository.save(bank);
    }

    public void deleteBank(Long id) {
        Bank bank = getBankById(id);
        bank.setStatus(Bank.Status.INACTIVE);
        bankRepository.save(bank);
    }
}