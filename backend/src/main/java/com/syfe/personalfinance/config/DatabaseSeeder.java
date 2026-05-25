package com.syfe.personalfinance.config;

import com.syfe.personalfinance.entity.Category;
import com.syfe.personalfinance.entity.CategoryType;
import com.syfe.personalfinance.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);
    private final CategoryRepository categoryRepository;

    public DatabaseSeeder(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting database seeding process...");
        seedDefaultCategories();
        log.info("Database seeding process completed. Total default categories: {}", categoryRepository.count());
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
                    log.info("Seeding default category: {} ({})", name, type);
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
