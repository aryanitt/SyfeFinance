package com.syfe.personalfinance.controller;

import com.syfe.personalfinance.dto.TransactionRequestDto;
import com.syfe.personalfinance.dto.TransactionResponseDto;
import com.syfe.personalfinance.entity.CategoryType;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.service.TransactionService;
import com.syfe.personalfinance.service.UserService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;

    public TransactionController(TransactionService transactionService, UserService userService) {
        this.transactionService = transactionService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponseDto> createTransaction(
            @Valid @RequestBody TransactionRequestDto requestDto, 
            Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        TransactionResponseDto created = transactionService.createTransaction(requestDto, user);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponseDto>> getTransactions(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "category", required = false) String categoryName,
            @RequestParam(value = "type", required = false) CategoryType type,
            Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        List<TransactionResponseDto> list = transactionService.getTransactions(user, startDate, endDate, categoryName, type);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponseDto> updateTransaction(
            @PathVariable("id") Long id,
            @Valid @RequestBody TransactionRequestDto requestDto,
            Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        TransactionResponseDto updated = transactionService.updateTransaction(id, requestDto, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTransaction(
            @PathVariable("id") Long id,
            Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        transactionService.deleteTransaction(id, user);
        return ResponseEntity.ok("Transaction deleted successfully");
    }
}
