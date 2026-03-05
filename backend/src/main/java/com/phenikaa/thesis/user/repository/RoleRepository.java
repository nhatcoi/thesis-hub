package com.phenikaa.thesis.user.repository;

import com.phenikaa.thesis.user.entity.Role;
import com.phenikaa.thesis.user.entity.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByCode(UserRole code);
}
