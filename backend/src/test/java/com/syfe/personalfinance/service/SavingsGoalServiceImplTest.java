package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.SavingsGoalRequestDto;
import com.syfe.personalfinance.dto.SavingsGoalResponseDto;
import com.syfe.personalfinance.entity.Category;
import com.syfe.personalfinance.entity.CategoryType;
import com.syfe.personalfinance.entity.SavingsGoal;
import com.syfe.personalfinance.entity.Transaction;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.exception.BadRequestException;
import com.syfe.personalfinance.exception.ForbiddenException;
import com.syfe.personalfinance.repository.SavingsGoalRepository;
import com.syfe.personalfinance.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SavingsGoalServiceImplTest {

    @Mock
    private SavingsGoalRepository savingsGoalRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private SavingsGoalServiceImpl savingsGoalService;

    private User user;
    private User otherUser;
    private SavingsGoal goal;
    private SavingsGoalRequestDto requestDto;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).username("test@example.com").build();
        otherUser = User.builder().id(2L).username("other@example.com").build();

        goal = SavingsGoal.builder()
                .id(10L)
                .goalName("Car savings")
                .targetAmount(new BigDecimal("10000.00"))
                .targetDate(LocalDate.now().plusMonths(6))
                .startDate(LocalDate.now().minusDays(5))
                .user(user)
                .build();

        requestDto = SavingsGoalRequestDto.builder()
                .goalName("Car savings")
                .targetAmount(new BigDecimal("10000.00"))
                .targetDate(LocalDate.now().plusMonths(6))
                .build();
    }

    @Test
    void createGoal_Success() {
        when(savingsGoalRepository.save(any(SavingsGoal.class))).thenReturn(goal);
        when(transactionRepository.findByUserAndDateGreaterThanEqual(eq(user), any(LocalDate.class)))
                .thenReturn(Collections.emptyList());

        SavingsGoalResponseDto response = savingsGoalService.createGoal(requestDto, user);

        assertNotNull(response);
        assertEquals("Car savings", response.getGoalName());
        assertEquals(BigDecimal.ZERO, response.getCurrentProgress());
        verify(savingsGoalRepository, times(1)).save(any(SavingsGoal.class));
    }

    @Test
    void createGoal_ThrowsBadRequestForPastDate() {
        requestDto.setTargetDate(LocalDate.now().minusDays(1));

        assertThrows(BadRequestException.class, () -> savingsGoalService.createGoal(requestDto, user));
        verify(savingsGoalRepository, never()).save(any(SavingsGoal.class));
    }

    @Test
    void getGoalsForUser_WithProgressCalculations() {
        Category incomeCat = Category.builder().type(CategoryType.INCOME).build();
        Category expenseCat = Category.builder().type(CategoryType.EXPENSE).build();

        Transaction incomeTx = Transaction.builder().amount(new BigDecimal("3000.00")).category(incomeCat).build();
        Transaction expenseTx = Transaction.builder().amount(new BigDecimal("1000.00")).category(expenseCat).build();

        when(savingsGoalRepository.findByUser(user)).thenReturn(Arrays.asList(goal));
        when(transactionRepository.findByUserAndDateGreaterThanEqual(eq(user), eq(goal.getStartDate())))
                .thenReturn(Arrays.asList(incomeTx, expenseTx));

        List<SavingsGoalResponseDto> response = savingsGoalService.getGoalsForUser(user);

        assertNotNull(response);
        assertEquals(1, response.size());
        SavingsGoalResponseDto dto = response.get(0);
        assertEquals(new BigDecimal("2000.00"), dto.getCurrentProgress());
        assertEquals(new BigDecimal("20.00"), dto.getProgressPercentage());
        assertEquals(new BigDecimal("8000.00"), dto.getRemainingAmount());
    }

    @Test
    void updateGoal_ThrowsForbiddenForOtherUser() {
        when(savingsGoalRepository.findById(10L)).thenReturn(Optional.of(goal));

        assertThrows(ForbiddenException.class, () -> savingsGoalService.updateGoal(10L, requestDto, otherUser));
    }
}
