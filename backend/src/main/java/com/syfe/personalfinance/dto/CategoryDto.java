package com.syfe.personalfinance.dto;

import com.syfe.personalfinance.entity.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDto {
    private Long id;

    @NotBlank(message = "Category name cannot be blank")
    private String name;

    @NotNull(message = "Category type cannot be null")
    private CategoryType type; // INCOME or EXPENSE

    private Boolean isCustom;
}
