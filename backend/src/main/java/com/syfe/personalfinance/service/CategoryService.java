package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.CategoryDto;
import com.syfe.personalfinance.entity.Category;
import com.syfe.personalfinance.entity.User;
import java.util.List;

public interface CategoryService {
    List<CategoryDto> getCategoriesForUser(User user);
    CategoryDto createCustomCategory(CategoryDto categoryDto, User user);
    void deleteCustomCategory(String name, User user);
    Category getCategoryByNameAndUser(String name, User user);
}
