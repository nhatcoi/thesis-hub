package com.phenikaa.thesis.user.entity;

import com.phenikaa.thesis.common.entity.BaseEntity;
import com.phenikaa.thesis.organization.entity.Faculty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lecturers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lecturer extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "lecturer_code", length = 20, unique = true, nullable = false)
    private String lecturerCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @Column(name = "max_students_per_batch")
    private Integer maxStudentsPerBatch;
}
