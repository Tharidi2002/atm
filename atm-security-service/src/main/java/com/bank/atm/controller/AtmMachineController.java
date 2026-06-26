package com.bank.atm.controller;

import com.bank.atm.entity.AtmMachine;
import com.bank.atm.service.AtmMachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/atms")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtmMachineController {

    private final AtmMachineService atmMachineService;

    @PostMapping
    public ResponseEntity<AtmMachine> createAtm(@RequestBody AtmMachine atm) {
        return ResponseEntity.ok(atmMachineService.createAtm(atm));
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<AtmMachine>> getAtmsByBranchId(@PathVariable Long branchId) {
        return ResponseEntity.ok(atmMachineService.getAtmsByBranchId(branchId));
    }

    @GetMapping("/bank/{bankId}")
    public ResponseEntity<List<AtmMachine>> getAtmsByBankId(@PathVariable Long bankId) {
        return ResponseEntity.ok(atmMachineService.getAtmsByBankId(bankId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtmMachine> getAtmById(@PathVariable Long id) {
        return ResponseEntity.ok(atmMachineService.getAtmById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtmMachine> updateAtm(@PathVariable Long id, @RequestBody AtmMachine atm) {
        return ResponseEntity.ok(atmMachineService.updateAtm(id, atm));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAtm(@PathVariable Long id) {
        atmMachineService.deleteAtm(id);
        return ResponseEntity.ok().build();
    }
}