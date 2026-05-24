package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.SavingsGoalRequestDto;
import com.syfe.personalfinance.dto.SavingsGoalResponseDto;
import com.syfe.personalfinance.entity.User;
import java.util.List;

public interface SavingsGoalService {
    SavingsGoalResponseDto createGoal(SavingsGoalRequestDto requestDto, User user);
    List<SavingsGoalResponseDto> getGoalsForUser(User user);
    SavingsGoalResponseDto getGoalById(Long id, User user);
    SavingsGoalResponseDto updateGoal(Long id, SavingsGoalRequestDto requestDto, User user);
    void deleteGoal(Long id, User user);
}
