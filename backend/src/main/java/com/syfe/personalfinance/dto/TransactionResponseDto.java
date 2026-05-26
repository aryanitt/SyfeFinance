package com.syfe.personalfinance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.syfe.personalfinance.entity.CategoryType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponseDto {
    private Long id;
    private BigDecimal amount;
    private LocalDate date;
    private String description;
    private String categoryName;
    private CategoryType categoryType;

    @JsonProperty("category")
    public String getCategory() {
        return categoryName;
    }

    @JsonProperty("type")
    public CategoryType getType() {
        return categoryType;
    }
}

