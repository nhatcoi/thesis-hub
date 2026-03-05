package com.phenikaa.thesis.user.entity;

import com.phenikaa.thesis.common.entity.BaseEntity;
import com.phenikaa.thesis.user.entity.enums.UserStatus;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(length = 50, unique = true, nullable = false)
    private String username;

    @Column(name = "external_id", length = 100, unique = true)
    private String externalId;

    @Column(length = 150, unique = true, nullable = false)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "first_name", length = 80, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 80, nullable = false)
    private String lastName;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private java.util.Set<Role> roles = new java.util.HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "user_status")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private UserStatus status;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    @OneToOne(mappedBy = "user")
    private Student student;

    @OneToOne(mappedBy = "user")
    private Lecturer lecturer;
}
