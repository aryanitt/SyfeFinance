package com.syfe.personalfinance.controller;

import com.syfe.personalfinance.dto.MonthlyReportDto;
import com.syfe.personalfinance.dto.YearlyReportDto;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.service.ReportService;
import com.syfe.personalfinance.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final UserService userService;

    public ReportController(ReportService reportService, UserService userService) {
        this.reportService = reportService;
        this.userService = userService;
    }

    @GetMapping("/monthly/{year}/{month}")
    public ResponseEntity<MonthlyReportDto> getMonthlyReport(
            @PathVariable("year") int year,
            @PathVariable("month") int month,
            Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        MonthlyReportDto report = reportService.generateMonthlyReport(year, month, user);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/yearly/{year}")
    public ResponseEntity<YearlyReportDto> getYearlyReport(
            @PathVariable("year") int year,
            Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        YearlyReportDto report = reportService.generateYearlyReport(year, user);
        return ResponseEntity.ok(report);
    }
}
