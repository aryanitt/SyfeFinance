package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.CategoryReportDto;
import com.syfe.personalfinance.dto.MonthlyReportDto;
import com.syfe.personalfinance.dto.YearlyReportDto;
import com.syfe.personalfinance.entity.CategoryType;
import com.syfe.personalfinance.entity.Transaction;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private final TransactionRepository transactionRepository;

    public ReportServiceImpl(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Override
    public MonthlyReportDto generateMonthlyReport(int year, int month, User user) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetweenOrderByDateDescIdDesc(user, startDate, endDate);

        return buildMonthlyReport(year, month, transactions);
    }

    @Override
    public YearlyReportDto generateYearlyReport(int year, User user) {
        LocalDate startOfYear = LocalDate.of(year, 1, 1);
        LocalDate endOfYear = LocalDate.of(year, 12, 31);

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetweenOrderByDateDescIdDesc(user, startOfYear, endOfYear);

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getCategory().getType() == CategoryType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> t.getCategory().getType() == CategoryType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netSavings = totalIncome.subtract(totalExpenses);

        Map<Integer, List<Transaction>> transactionsByMonth = transactions.stream()
                .collect(Collectors.groupingBy(t -> t.getDate().getMonthValue()));

        List<MonthlyReportDto> monthlyBreakdown = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            List<Transaction> monthTxList = transactionsByMonth.getOrDefault(m, new ArrayList<>());
            monthlyBreakdown.add(buildMonthlyReport(year, m, monthTxList));
        }

        return YearlyReportDto.builder()
                .year(year)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netSavings(netSavings)
                .monthlyBreakdown(monthlyBreakdown)
                .build();
    }

    private MonthlyReportDto buildMonthlyReport(int year, int month, List<Transaction> transactions) {
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getCategory().getType() == CategoryType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> t.getCategory().getType() == CategoryType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netSavings = totalIncome.subtract(totalExpenses);

        Map<String, BigDecimal> incomeGrouped = transactions.stream()
                .filter(t -> t.getCategory().getType() == CategoryType.INCOME)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        List<CategoryReportDto> incomeByCategory = incomeGrouped.entrySet().stream()
                .map(e -> new CategoryReportDto(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        Map<String, BigDecimal> expenseGrouped = transactions.stream()
                .filter(t -> t.getCategory().getType() == CategoryType.EXPENSE)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        List<CategoryReportDto> expenseByCategory = expenseGrouped.entrySet().stream()
                .map(e -> new CategoryReportDto(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return MonthlyReportDto.builder()
                .year(year)
                .month(month)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netSavings(netSavings)
                .incomeByCategory(incomeByCategory)
                .expenseByCategory(expenseByCategory)
                .build();
    }
}
