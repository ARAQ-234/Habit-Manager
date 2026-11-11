package com.habitmanager.controller;

import com.habitmanager.entity.Category;
import com.habitmanager.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getAll(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(categoryService.getAllCategories(user.getUsername()));
    }

    public record CreateCategoryRequest(@NotBlank @Size(max = 40) String name, @NotBlank String iconKey) {}

    @PostMapping
    public ResponseEntity<Category> create(@Valid @RequestBody CreateCategoryRequest request, @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(201).body(categoryService.createCategory(user.getUsername(), request.name(), request.iconKey()));
    }

}
