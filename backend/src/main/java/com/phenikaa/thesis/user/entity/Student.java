package com.phenikaa.thesis.user.entity;

import com.phenikaa.thesis.common.entity.BaseEntity;
import com.phenikaa.thesis.organization.entity.Major;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_id", nullable = false)
    private Major major;

    @Column(length = 20, nullable = false)
    private String cohort;

    @Column(name = "eligible_for_thesis")
    private Boolean eligibleForThesis;
}
