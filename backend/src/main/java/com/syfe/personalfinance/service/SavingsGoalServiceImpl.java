package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.SavingsGoalRequestDto;
import com.syfe.personalfinance.dto.SavingsGoalResponseDto;
import com.syfe.personalfinance.entity.CategoryType;
import com.syfe.personalfinance.entity.SavingsGoal;
import com.syfe.personalfinance.entity.Transaction;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.exception.BadRequestException;
import com.syfe.personalfinance.exception.ForbiddenException;
import com.syfe.personalfinance.exception.ResourceNotFoundException;
import com.syfe.personalfinance.repository.SavingsGoalRepository;
import com.syfe.personalfinance.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SavingsGoalServiceImpl implements SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final TransactionRepository transactionRepository;

    public SavingsGoalServiceImpl(SavingsGoalRepository savingsGoalRepository, TransactionRepository transactionRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    @Transactional
    public SavingsGoalResponseDto createGoal(SavingsGoalRequestDto requestDto, User user) {
        if (requestDto.getTargetDate().isBefore(LocalDate.now()) || requestDto.getTargetDate().isEqual(LocalDate.now())) {
            throw new BadRequestException("Target date must be in the future");
        }

        LocalDate startDate = requestDto.getStartDate();
        if (startDate == null) {
            startDate = LocalDate.now();
        }

        if (startDate.isAfter(requestDto.getTargetDate())) {
            throw new BadRequestException("Start date cannot be after target date");
        }

        SavingsGoal goal = SavingsGoal.builder()
                .goalName(requestDto.getGoalName())
                .targetAmount(requestDto.getTargetAmount())
                .targetDate(requestDto.getTargetDate())
                .startDate(startDate)
                .user(user)
                .build();

        SavingsGoal saved = savingsGoalRepository.save(goal);
        return convertToDto(saved, user);
    }

    @Override
    public List<SavingsGoalResponseDto> getGoalsForUser(User user) {
        List<SavingsGoal> goals = savingsGoalRepository.findByUser(user);
        return goals.stream()
                .map(goal -> convertToDto(goal, user))
                .collect(Collectors.toList());
    }

    @Override
    public SavingsGoalResponseDto getGoalById(Long id, User user) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Savings Goal not found with id: " + id));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to view this savings goal");
        }

        return convertToDto(goal, user);
    }

    @Override
    @Transactional
    public SavingsGoalResponseDto updateGoal(Long id, SavingsGoalRequestDto requestDto, User user) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Savings Goal not found with id: " + id));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to modify this savings goal");
        }

        if (requestDto.getGoalName() != null && !requestDto.getGoalName().trim().isEmpty()) {
            goal.setGoalName(requestDto.getGoalName());
        }

        if (requestDto.getTargetAmount() != null) {
            if (requestDto.getTargetAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Target amount must be a positive decimal value");
            }
            goal.setTargetAmount(requestDto.getTargetAmount());
        }

        if (requestDto.getTargetDate() != null) {
            if (requestDto.getTargetDate().isBefore(LocalDate.now()) || requestDto.getTargetDate().isEqual(LocalDate.now())) {
                throw new BadRequestException("Target date must be a future date");
            }
            LocalDate currentStartDate = goal.getStartDate() != null ? goal.getStartDate() : LocalDate.now();
            if (currentStartDate.isAfter(requestDto.getTargetDate())) {
                throw new BadRequestException("Start date cannot be after target date");
            }
            goal.setTargetDate(requestDto.getTargetDate());
        }

        SavingsGoal updated = savingsGoalRepository.save(goal);
        return convertToDto(updated, user);
    }

    @Override
    @Transactional
    public void deleteGoal(Long id, User user) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Savings Goal not found with id: " + id));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to delete this savings goal");
        }

        savingsGoalRepository.delete(goal);
    }

    private SavingsGoalResponseDto convertToDto(SavingsGoal goal, User user) {
        List<Transaction> transactions = transactionRepository.findByUserAndDateGreaterThanEqual(user, goal.getStartDate());

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getCategory().getType() == CategoryType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getCategory().getType() == CategoryType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentProgress = totalIncome.subtract(totalExpense);

        BigDecimal progressPercentage = BigDecimal.ZERO;
        if (currentProgress.compareTo(BigDecimal.ZERO) > 0) {
            progressPercentage = currentProgress
                    .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal remainingAmount = goal.getTargetAmount().subtract(currentProgress);
        if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
            remainingAmount = BigDecimal.ZERO;
        }

        return SavingsGoalResponseDto.builder()
                .id(goal.getId())
                .goalName(goal.getGoalName())
                .targetAmount(goal.getTargetAmount())
                .targetDate(goal.getTargetDate())
                .startDate(goal.getStartDate())
                .currentProgress(currentProgress)
                .progressPercentage(progressPercentage)
                .remainingAmount(remainingAmount)
                .build();
    }
}
