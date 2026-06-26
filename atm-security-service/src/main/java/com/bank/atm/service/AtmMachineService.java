package com.bank.atm.service;

import com.bank.atm.entity.AtmMachine;
import com.bank.atm.repository.AtmMachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AtmMachineService {

    private final AtmMachineRepository atmMachineRepository;

    public AtmMachine createAtm(AtmMachine atm) {
        if (atmMachineRepository.existsByAtmCode(atm.getAtmCode())) {
            throw new RuntimeException("ATM code already exists");
        }
        return atmMachineRepository.save(atm);
    }

    public List<AtmMachine> getAtmsByBranchId(Long branchId) {
        return atmMachineRepository.findByBranchId(branchId);
    }

    public List<AtmMachine> getAtmsByBankId(Long bankId) {
        return atmMachineRepository.findByBankId(bankId);
    }

    public AtmMachine getAtmById(Long id) {
        return atmMachineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ATM not found"));
    }

    public AtmMachine updateAtm(Long id, AtmMachine atmDetails) {
        AtmMachine atm = getAtmById(id);
        atm.setLocation(atmDetails.getLocation());
        atm.setSimNumber(atmDetails.getSimNumber());
        atm.setStatus(atmDetails.getStatus());
        return atmMachineRepository.save(atm);
    }

    public void deleteAtm(Long id) {
        AtmMachine atm = getAtmById(id);
        atm.setStatus(AtmMachine.Status.INACTIVE);
        atmMachineRepository.save(atm);
    }
}