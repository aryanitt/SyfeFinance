package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.TransactionRequestDto;
import com.syfe.personalfinance.dto.TransactionResponseDto;
import com.syfe.personalfinance.entity.Category;
import com.syfe.personalfinance.entity.CategoryType;
import com.syfe.personalfinance.entity.Transaction;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.exception.BadRequestException;
import com.syfe.personalfinance.exception.ForbiddenException;
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
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private User user;
    private User otherUser;
    private Category category;
    private Transaction transaction;
    private TransactionRequestDto requestDto;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).username("test@example.com").build();
        otherUser = User.builder().id(2L).username("other@example.com").build();

        category = Category.builder()
                .id(1L)
                .name("Food")
                .type(CategoryType.EXPENSE)
                .isCustom(false)
                .build();

        transaction = Transaction.builder()
                .id(100L)
                .amount(new BigDecimal("50.00"))
                .date(LocalDate.now().minusDays(1))
                .description("Lunch")
                .user(user)
                .category(category)
                .build();

        requestDto = TransactionRequestDto.builder()
                .amount(new BigDecimal("50.00"))
                .date(LocalDate.now().minusDays(1))
                .categoryName("Food")
                .description("Lunch")
                .build();
    }

    @Test
    void createTransaction_Success() {
        when(categoryService.getCategoryByNameAndUser("Food", user)).thenReturn(category);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);

        TransactionResponseDto response = transactionService.createTransaction(requestDto, user);

        assertNotNull(response);
        assertEquals(new BigDecimal("50.00"), response.getAmount());
        assertEquals("Food", response.getCategoryName());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void createTransaction_ThrowsBadRequestForFutureDate() {
        requestDto.setDate(LocalDate.now().plusDays(1));

        assertThrows(BadRequestException.class, () -> transactionService.createTransaction(requestDto, user));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void getTransactions_FilterAndSorting() {
        Transaction tx1 = Transaction.builder()
                .id(101L)
                .amount(new BigDecimal("1000.00"))
                .date(LocalDate.now())
                .user(user)
                .category(Category.builder().name("Salary").type(CategoryType.INCOME).build())
                .build();

        when(transactionRepository.findByUserOrderByDateDescIdDesc(user))
                .thenReturn(Arrays.asList(tx1, transaction));

        List<TransactionResponseDto> result = transactionService.getTransactions(user, null, null, null, CategoryType.EXPENSE);

        assertEquals(1, result.size());
        assertEquals(new BigDecimal("50.00"), result.get(0).getAmount());
    }

    @Test
    void updateTransaction_Success() {
        TransactionRequestDto updateDto = TransactionRequestDto.builder()
                .amount(new BigDecimal("60.00"))
                .date(transaction.getDate())
                .categoryName("Food")
                .description("Expensive lunch")
                .build();

        when(transactionRepository.findById(100L)).thenReturn(Optional.of(transaction));
        when(categoryService.getCategoryByNameAndUser("Food", user)).thenReturn(category);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);

        TransactionResponseDto updated = transactionService.updateTransaction(100L, updateDto, user);

        assertNotNull(updated);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void updateTransaction_ThrowsForbiddenForOtherUser() {
        when(transactionRepository.findById(100L)).thenReturn(Optional.of(transaction));

        assertThrows(ForbiddenException.class, () -> transactionService.updateTransaction(100L, requestDto, otherUser));
    }

    @Test
    void updateTransaction_ThrowsBadRequestWhenDateChanges() {
        requestDto.setDate(LocalDate.now().minusDays(5));
        when(transactionRepository.findById(100L)).thenReturn(Optional.of(transaction));

        assertThrows(BadRequestException.class, () -> transactionService.updateTransaction(100L, requestDto, user));
    }
}
