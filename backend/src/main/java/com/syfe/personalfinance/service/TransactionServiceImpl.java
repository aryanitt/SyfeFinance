package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.TransactionRequestDto;
import com.syfe.personalfinance.dto.TransactionResponseDto;
import com.syfe.personalfinance.entity.Category;
import com.syfe.personalfinance.entity.CategoryType;
import com.syfe.personalfinance.entity.Transaction;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.exception.BadRequestException;
import com.syfe.personalfinance.exception.ForbiddenException;
import com.syfe.personalfinance.exception.ResourceNotFoundException;
import com.syfe.personalfinance.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryService categoryService;

    public TransactionServiceImpl(TransactionRepository transactionRepository, CategoryService categoryService) {
        this.transactionRepository = transactionRepository;
        this.categoryService = categoryService;
    }

    @Override
    @Transactional
    public TransactionResponseDto createTransaction(TransactionRequestDto requestDto, User user) {
        if (requestDto.getDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("Transaction date cannot be in the future");
        }

        Category category = categoryService.getCategoryByNameAndUser(requestDto.getCategoryName(), user);

        Transaction transaction = Transaction.builder()
                .amount(requestDto.getAmount())
                .date(requestDto.getDate())
                .description(requestDto.getDescription())
                .user(user)
                .category(category)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return convertToDto(saved);
    }

    @Override
    public List<TransactionResponseDto> getTransactions(User user, LocalDate startDate, LocalDate endDate, String categoryName, CategoryType type) {
        List<Transaction> transactions = transactionRepository.findByUserOrderByDateDescIdDesc(user);

        Stream<Transaction> stream = transactions.stream();

        if (startDate != null) {
            stream = stream.filter(t -> !t.getDate().isBefore(startDate));
        }
        if (endDate != null) {
            stream = stream.filter(t -> !t.getDate().isAfter(endDate));
        }

        if (categoryName != null && !categoryName.trim().isEmpty()) {
            stream = stream.filter(t -> t.getCategory().getName().equalsIgnoreCase(categoryName));
        }

        if (type != null) {
            stream = stream.filter(t -> t.getCategory().getType() == type);
        }

        return stream
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TransactionResponseDto updateTransaction(Long id, TransactionRequestDto requestDto, User user) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to modify this transaction");
        }

        // The date field should be completely ignored (original date remains unchanged)

        if (requestDto.getAmount() != null) {
            if (requestDto.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Amount must be a positive decimal value");
            }
            transaction.setAmount(requestDto.getAmount());
        }

        if (requestDto.getDescription() != null) {
            transaction.setDescription(requestDto.getDescription());
        }

        if (requestDto.getCategoryName() != null && !requestDto.getCategoryName().trim().isEmpty()) {
            Category category = categoryService.getCategoryByNameAndUser(requestDto.getCategoryName(), user);
            transaction.setCategory(category);
        }

        Transaction updated = transactionRepository.save(transaction);
        return convertToDto(updated);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long id, User user) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to delete this transaction");
        }

        transactionRepository.delete(transaction);
    }

    private TransactionResponseDto convertToDto(Transaction transaction) {
        return TransactionResponseDto.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .date(transaction.getDate())
                .description(transaction.getDescription())
                .categoryName(transaction.getCategory().getName())
                .categoryType(transaction.getCategory().getType())
                .build();
    }
}
