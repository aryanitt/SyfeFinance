package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.CategoryDto;
import com.syfe.personalfinance.entity.Category;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.exception.BadRequestException;
import com.syfe.personalfinance.exception.ConflictException;
import com.syfe.personalfinance.exception.ResourceNotFoundException;
import com.syfe.personalfinance.repository.CategoryRepository;
import com.syfe.personalfinance.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, TransactionRepository transactionRepository) {
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public List<CategoryDto> getCategoriesForUser(User user) {
        return categoryRepository.findAllAccessibleToUser(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryDto createCustomCategory(CategoryDto categoryDto, User user) {
        boolean exists = categoryRepository.existsByNameAndUser(categoryDto.getName(), user) || 
                         categoryRepository.findByNameAndUserIsNull(categoryDto.getName()).isPresent();
        if (exists) {
            throw new ConflictException("Category name must be unique. '" + categoryDto.getName() + "' already exists.");
        }

        Category category = Category.builder()
                .name(categoryDto.getName())
                .type(categoryDto.getType())
                .isCustom(true)
                .user(user)
                .build();

        Category saved = categoryRepository.save(category);
        return convertToDto(saved);
    }

    @Override
    @Transactional
    public void deleteCustomCategory(String name, User user) {
        if (categoryRepository.findByNameAndUserIsNull(name).isPresent()) {
            throw new BadRequestException("Default categories cannot be deleted or modified: " + name);
        }

        Category category = categoryRepository.findByNameAndUser(name, user)
                .orElseThrow(() -> new ResourceNotFoundException("Custom category not found: " + name));

        if (transactionRepository.existsByCategory(category)) {
            throw new BadRequestException("Category '" + name + "' is currently referenced by transactions and cannot be deleted.");
        }

        categoryRepository.delete(category);
    }

    @Override
    public Category getCategoryByNameAndUser(String name, User user) {
        return categoryRepository.findByNameAndUserAccessible(name, user)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found or access denied: " + name));
    }

    private CategoryDto convertToDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .isCustom(category.getIsCustom())
                .build();
    }
}
