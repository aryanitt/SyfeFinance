package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.TransactionRequestDto;
import com.syfe.personalfinance.dto.TransactionResponseDto;
import com.syfe.personalfinance.entity.CategoryType;
import com.syfe.personalfinance.entity.User;
import java.time.LocalDate;
import java.util.List;

public interface TransactionService {
    TransactionResponseDto createTransaction(TransactionRequestDto requestDto, User user);
    List<TransactionResponseDto> getTransactions(User user, LocalDate startDate, LocalDate endDate, String categoryName, CategoryType type);
    TransactionResponseDto updateTransaction(Long id, TransactionRequestDto requestDto, User user);
    void deleteTransaction(Long id, User user);
}
