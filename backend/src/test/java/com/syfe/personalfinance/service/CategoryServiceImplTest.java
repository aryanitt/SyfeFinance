package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.CategoryDto;
import com.syfe.personalfinance.entity.Category;
import com.syfe.personalfinance.entity.CategoryType;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.exception.BadRequestException;
import com.syfe.personalfinance.exception.ConflictException;
import com.syfe.personalfinance.repository.CategoryRepository;
import com.syfe.personalfinance.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private User user;
    private Category defaultCategory;
    private Category customCategory;
    private CategoryDto customCategoryDto;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).username("test@example.com").build();

        defaultCategory = Category.builder()
                .id(1L)
                .name("Food")
                .type(CategoryType.EXPENSE)
                .isCustom(false)
                .user(null)
                .build();

        customCategory = Category.builder()
                .id(2L)
                .name("Hobbies")
                .type(CategoryType.EXPENSE)
                .isCustom(true)
                .user(user)
                .build();

        customCategoryDto = CategoryDto.builder()
                .name("Hobbies")
                .type(CategoryType.EXPENSE)
                .build();
    }

    @Test
    void getCategoriesForUser_Success() {
        when(categoryRepository.findAllAccessibleToUser(user))
                .thenReturn(Arrays.asList(defaultCategory, customCategory));

        List<CategoryDto> result = categoryService.getCategoriesForUser(user);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Food", result.get(0).getName());
        assertEquals("Hobbies", result.get(1).getName());
    }

    @Test
    void createCustomCategory_Success() {
        when(categoryRepository.existsByNameAndUser(customCategoryDto.getName(), user)).thenReturn(false);
        when(categoryRepository.findByNameAndUserIsNull(customCategoryDto.getName())).thenReturn(Optional.empty());
        when(categoryRepository.save(any(Category.class))).thenReturn(customCategory);

        CategoryDto created = categoryService.createCustomCategory(customCategoryDto, user);

        assertNotNull(created);
        assertEquals("Hobbies", created.getName());
        assertTrue(created.getIsCustom());
    }

    @Test
    void createCustomCategory_ThrowsConflictException() {
        when(categoryRepository.existsByNameAndUser(customCategoryDto.getName(), user)).thenReturn(true);

        assertThrows(ConflictException.class, () -> categoryService.createCustomCategory(customCategoryDto, user));
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void deleteCustomCategory_Success() {
        when(categoryRepository.findByNameAndUserIsNull("Hobbies")).thenReturn(Optional.empty());
        when(categoryRepository.findByNameAndUser("Hobbies", user)).thenReturn(Optional.of(customCategory));
        when(transactionRepository.existsByCategory(customCategory)).thenReturn(false);

        assertDoesNotThrow(() -> categoryService.deleteCustomCategory("Hobbies", user));
        verify(categoryRepository, times(1)).delete(customCategory);
    }

    @Test
    void deleteCustomCategory_ThrowsBadRequestForDefaultCategory() {
        when(categoryRepository.findByNameAndUserIsNull("Food")).thenReturn(Optional.of(defaultCategory));

        assertThrows(BadRequestException.class, () -> categoryService.deleteCustomCategory("Food", user));
        verify(categoryRepository, never()).delete(any(Category.class));
    }

    @Test
    void deleteCustomCategory_ThrowsBadRequestWhenReferencedByTransactions() {
        when(categoryRepository.findByNameAndUserIsNull("Hobbies")).thenReturn(Optional.empty());
        when(categoryRepository.findByNameAndUser("Hobbies", user)).thenReturn(Optional.of(customCategory));
        when(transactionRepository.existsByCategory(customCategory)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> categoryService.deleteCustomCategory("Hobbies", user));
        verify(categoryRepository, never()).delete(any(Category.class));
    }
}
