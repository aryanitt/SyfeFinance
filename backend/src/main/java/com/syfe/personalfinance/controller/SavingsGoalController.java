package com.syfe.personalfinance.controller;

import com.syfe.personalfinance.dto.SavingsGoalRequestDto;
import com.syfe.personalfinance.dto.SavingsGoalResponseDto;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.service.SavingsGoalService;
import com.syfe.personalfinance.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;
    private final UserService userService;

    public SavingsGoalController(SavingsGoalService savingsGoalService, UserService userService) {
        this.savingsGoalService = savingsGoalService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<SavingsGoalResponseDto> createGoal(
            @Valid @RequestBody SavingsGoalRequestDto requestDto, 
            Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        SavingsGoalResponseDto created = savingsGoalService.createGoal(requestDto, user);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SavingsGoalResponseDto>> getGoals(Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        List<SavingsGoalResponseDto> list = savingsGoalService.getGoalsForUser(user);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavingsGoalResponseDto> getGoalById(
            @PathVariable("id") Long id, 
            Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        SavingsGoalResponseDto goal = savingsGoalService.getGoalById(id, user);
        return ResponseEntity.ok(goal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoalResponseDto> updateGoal(
            @PathVariable("id") Long id,
            @RequestBody SavingsGoalRequestDto requestDto,
            Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        SavingsGoalResponseDto updated = savingsGoalService.updateGoal(id, requestDto, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteGoal(
            @PathVariable("id") Long id,
            Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        savingsGoalService.deleteGoal(id, user);
        return ResponseEntity.ok("Savings Goal deleted successfully");
    }
}
