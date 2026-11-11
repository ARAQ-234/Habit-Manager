package com.habitmanager.service;

import com.habitmanager.entity.Category;
import com.habitmanager.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.habitmanager.repository.UserRepository;
import com.habitmanager.entity.User;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired private UserRepository userRepository;

    private static final Set<String> ICONS = Set.of("HEART", "BOOK", "BRAIN", "DUMBBELL", "RUNNING", "LEAF", "BRIEFCASE", "MUSIC", "HOME", "STAR", "APPLE", "WATER", "SUN", "MOON", "PENCIL");

    public List<Category> getAllCategories(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return categoryRepository.findByUserIdIsNullOrUserIdOrderByNameAsc(user.getId());
    }

    public Category createCategory(String username, String name, String iconKey) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        String normalizedName = name == null ? "" : name.trim();
        String normalizedIcon = iconKey == null ? "" : iconKey.trim().toUpperCase(Locale.ROOT);
        if (normalizedName.isBlank() || normalizedName.length() > 40) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name must be between 1 and 40 characters");
        if (!ICONS.contains(normalizedIcon)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a supported category icon");
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(user.getId(), normalizedName)) throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a category with this name");
        Category category = new Category();
        category.setName(normalizedName);
        category.setIconKey(normalizedIcon);
        category.setColorCode("#718833");
        category.setUserId(user.getId());
        return categoryRepository.save(category);
    }

}
