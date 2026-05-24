package com.syfe.personalfinance.config;

import com.syfe.personalfinance.entity.Category;
import com.syfe.personalfinance.entity.CategoryType;
import com.syfe.personalfinance.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public DatabaseSeeder(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        seedDefaultCategories();
    }

    private void seedDefaultCategories() {
        seedCategory("Salary", CategoryType.INCOME);

        List<String> expenseCategories = Arrays.asList("Food", "Rent", "Transportation", "Entertainment", "Healthcare", "Utilities");
        for (String catName : expenseCategories) {
            seedCategory(catName, CategoryType.EXPENSE);
        }
    }

    private void seedCategory(String name, CategoryType type) {
        categoryRepository.findByNameAndUserIsNull(name)
                .orElseGet(() -> {
                    Category category = Category.builder()
                            .name(name)
                            .type(type)
                            .isCustom(false)
                            .user(null)
                            .build();
                    return categoryRepository.save(category);
                });
    }
}
