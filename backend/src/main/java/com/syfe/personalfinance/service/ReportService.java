package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.MonthlyReportDto;
import com.syfe.personalfinance.dto.YearlyReportDto;
import com.syfe.personalfinance.entity.User;

public interface ReportService {
    MonthlyReportDto generateMonthlyReport(int year, int month, User user);
    YearlyReportDto generateYearlyReport(int year, User user);
}
