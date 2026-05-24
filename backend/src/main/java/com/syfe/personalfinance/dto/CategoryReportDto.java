package com.syfe.personalfinance.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryReportDto {
    private String categoryName;
    private BigDecimal totalAmount;
}
