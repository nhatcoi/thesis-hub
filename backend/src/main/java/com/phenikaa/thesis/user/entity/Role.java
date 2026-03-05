package com.phenikaa.thesis.user.entity;

import com.phenikaa.thesis.common.entity.BaseEntity;
import com.phenikaa.thesis.user.entity.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(length = 50, unique = true, nullable = false)
    private UserRole code;

    @Column(length = 100, nullable = false)
    private String name;
}
