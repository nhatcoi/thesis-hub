package com.phenikaa.thesis.thesis.entity;

import com.phenikaa.thesis.thesis.entity.enums.DefenseRegStatus;
import com.phenikaa.thesis.user.entity.Lecturer;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "defense_registrations")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DefenseRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thesis_id", nullable = false)
    private Thesis thesis;

    // Report
    @Column(name = "report_path", nullable = false, length = 500)
    private String reportPath;
    @Column(name = "report_name", nullable = false, length = 255)
    private String reportName;
    @Column(name = "report_size")
    private Long reportSize;

    // Source code
    @Column(name = "source_code_path", nullable = false, length = 500)
    private String sourceCodePath;
    @Column(name = "source_code_name", nullable = false, length = 255)
    private String sourceCodeName;
    @Column(name = "source_code_size")
    private Long sourceCodeSize;

    // Slide
    @Column(name = "slide_path", nullable = false, length = 500)
    private String slidePath;
    @Column(name = "slide_name", nullable = false, length = 255)
    private String slideName;
    @Column(name = "slide_size")
    private Long slideSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "defense_reg_status")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private DefenseRegStatus status;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "reviewer_comment", columnDefinition = "TEXT")
    private String reviewerComment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private Lecturer reviewedBy;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    @Column(name = "submitted_at", nullable = false)
    private OffsetDateTime submittedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
