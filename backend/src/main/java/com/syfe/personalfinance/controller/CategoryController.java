package com.syfe.personalfinance.controller;

import com.syfe.personalfinance.dto.CategoryDto;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.service.CategoryService;
import com.syfe.personalfinance.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final UserService userService;

    public CategoryController(CategoryService categoryService, UserService userService) {
        this.categoryService = categoryService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getCategories(Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        List<CategoryDto> categories = categoryService.getCategoriesForUser(user);
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryDto categoryDto, Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        CategoryDto created = categoryService.createCustomCategory(categoryDto, user);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<String> deleteCategory(@PathVariable("name") String name, Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        categoryService.deleteCustomCategory(name, user);
        return ResponseEntity.ok("Category '" + name + "' deleted successfully");
    }
}
