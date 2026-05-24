package com.syfe.personalfinance.repository;

import com.syfe.personalfinance.entity.Category;
import com.syfe.personalfinance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    @Query("SELECT c FROM Category c WHERE c.user IS NULL OR c.user = :user")
    List<Category> findAllAccessibleToUser(@Param("user") User user);

    @Query("SELECT c FROM Category c WHERE c.name = :name AND (c.user IS NULL OR c.user = :user)")
    Optional<Category> findByNameAndUserAccessible(@Param("name") String name, @Param("user") User user);

    Optional<Category> findByNameAndUser(String name, User user);

    boolean existsByNameAndUser(String name, User user);

    Optional<Category> findByNameAndUserIsNull(String name);
}
