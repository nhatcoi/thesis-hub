package com.phenikaa.thesis.user.entity;

import com.phenikaa.thesis.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "student_code", length = 20, unique = true, nullable = false)
    private String studentCode;

    @Column(name = "major_code", length = 20, nullable = false)
    private String majorCode;

    @Column(length = 20, nullable = false)
    private String cohort;

    @Column(name = "class_name", length = 50)
    private String className;

    @Column(name = "eligible_for_thesis")
    private Boolean eligibleForThesis;
}
