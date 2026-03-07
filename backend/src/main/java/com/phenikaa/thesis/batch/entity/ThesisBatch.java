package com.phenikaa.thesis.batch.entity;

import com.phenikaa.thesis.batch.entity.enums.BatchStatus;
import com.phenikaa.thesis.common.entity.BaseEntity;
import com.phenikaa.thesis.organization.entity.AcademicYear;
import com.phenikaa.thesis.user.entity.User;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import lombok.*;


import java.time.OffsetDateTime;

@Entity
@Table(name = "thesis_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThesisBatch extends BaseEntity {

    @Column(length = 200, nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @Column(nullable = false)
    private Integer semester;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "batch_status")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private BatchStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "topic_reg_start", nullable = false)
    private OffsetDateTime topicRegStart;

    @Column(name = "topic_reg_end", nullable = false)
    private OffsetDateTime topicRegEnd;

    @Column(name = "outline_start", nullable = false)
    private OffsetDateTime outlineStart;

    @Column(name = "outline_end", nullable = false)
    private OffsetDateTime outlineEnd;

    @Column(name = "implementation_start", nullable = false)
    private OffsetDateTime implementationStart;

    @Column(name = "implementation_end", nullable = false)
    private OffsetDateTime implementationEnd;

    @Column(name = "defense_reg_start", nullable = false)
    private OffsetDateTime defenseRegStart;

    @Column(name = "defense_reg_end", nullable = false)
    private OffsetDateTime defenseRegEnd;

    @Column(name = "defense_start")
    private OffsetDateTime defenseStart;

    @Column(name = "defense_end")
    private OffsetDateTime defenseEnd;
}
