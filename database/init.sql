-- ============================================================
-- THESIS MANAGEMENT SYSTEM - DATABASE SCHEMA (SSO VERSION)
-- Hệ thống quản lý đồ án tốt nghiệp - Auth qua SSO trường
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ORGANIZATIONAL HIERARCHY
--    University → School → Faculty → Major
-- ============================================================

CREATE TABLE universities (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        VARCHAR(20) UNIQUE NOT NULL,
    name        VARCHAR(200) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE schools (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id   UUID NOT NULL REFERENCES universities(id),
    code            VARCHAR(20) UNIQUE NOT NULL,
    name            VARCHAR(200) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE faculties (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id   UUID NOT NULL REFERENCES schools(id),
    code        VARCHAR(20) UNIQUE NOT NULL,
    name        VARCHAR(200) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE majors (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id          UUID NOT NULL REFERENCES faculties(id),
    code                VARCHAR(20) UNIQUE NOT NULL,
    name                VARCHAR(200) NOT NULL,
    required_credits    INT NOT NULL DEFAULT 130,
    min_gpa_for_thesis  NUMERIC(3,2) NOT NULL DEFAULT 2.00,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE academic_years (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_academic_year_dates CHECK (end_date > start_date)
);

-- ============================================================
-- 2. USER & AUTHENTICATION (SSO)
--    RBAC: ADMIN, TRAINING_DEPT, DEPT_HEAD, LECTURER, STUDENT
-- ============================================================

CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(100) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE user_status AS ENUM (
    'ACTIVE',
    'LOCKED',
    'INACTIVE'
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(50) UNIQUE NOT NULL,
    external_id     VARCHAR(100) UNIQUE,
    email           VARCHAR(150) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    first_name      VARCHAR(80) NOT NULL,
    last_name       VARCHAR(80) NOT NULL,
    status          user_status NOT NULL DEFAULT 'ACTIVE',
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE students (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id),
    student_code        VARCHAR(20) UNIQUE NOT NULL,
    major_id            UUID NOT NULL REFERENCES majors(id),
    cohort              VARCHAR(20) NOT NULL,
    eligible_for_thesis BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lecturers (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID UNIQUE NOT NULL REFERENCES users(id),
    lecturer_code           VARCHAR(20) UNIQUE NOT NULL,
    faculty_id             UUID NOT NULL REFERENCES faculties(id),
    managed_major_code     VARCHAR(20),
    max_students_per_batch INT DEFAULT 5,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. THESIS BATCH (Đợt đồ án)
--    PĐT tạo, có khung thời gian từng giai đoạn
-- ============================================================

CREATE TYPE batch_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'CLOSED',
    'ARCHIVED'
);

CREATE TABLE thesis_batches (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                    VARCHAR(200) NOT NULL,
    academic_year_id        UUID REFERENCES academic_years(id),
    semester                INT NOT NULL CHECK (semester IN (1, 2, 3)),
    status                  batch_status NOT NULL DEFAULT 'DRAFT',
    created_by              UUID NOT NULL REFERENCES users(id),

    topic_reg_start         DATE NOT NULL,
    topic_reg_end           DATE NOT NULL,
    outline_start           DATE NOT NULL,
    outline_end             DATE NOT NULL,
    implementation_start    DATE NOT NULL,
    implementation_end      DATE NOT NULL,
    defense_reg_start       DATE NOT NULL,
    defense_reg_end         DATE NOT NULL,
    defense_start           DATE,
    defense_end             DATE,

    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_topic_dates       CHECK (topic_reg_end > topic_reg_start),
    CONSTRAINT chk_outline_dates     CHECK (outline_end > outline_start),
    CONSTRAINT chk_impl_dates        CHECK (implementation_end > implementation_start),
    CONSTRAINT chk_defense_reg_dates CHECK (defense_reg_end > defense_reg_start)
);

-- ============================================================
-- 4. TOPICS (Đề tài)
--    GV tạo đề tài mở, hoặc SV đề xuất
-- ============================================================

CREATE TYPE topic_status AS ENUM (
    'AVAILABLE',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'FULL',
    'CLOSED'
);

CREATE TYPE topic_source AS ENUM (
    'LECTURER',
    'STUDENT'
);

CREATE TABLE topics (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id        UUID NOT NULL REFERENCES thesis_batches(id),
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    requirements    TEXT,
    max_students    INT NOT NULL DEFAULT 1 CHECK (max_students > 0),
    current_students INT NOT NULL DEFAULT 0,
    source          topic_source NOT NULL DEFAULT 'LECTURER',
    status          topic_status NOT NULL DEFAULT 'AVAILABLE',
    major_id        UUID REFERENCES majors(id),

    proposed_by     UUID NOT NULL REFERENCES users(id),
    approved_by     UUID REFERENCES users(id),
    reject_reason   TEXT,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. THESIS (Hồ sơ đồ án – gắn SV, đề tài, GVHD)
-- ============================================================

CREATE TYPE thesis_status AS ENUM (
    'NOT_ELIGIBLE',
    'ELIGIBLE_FOR_THESIS',
    'TOPIC_PENDING_APPROVAL',
    'TOPIC_APPROVED',
    'TOPIC_REJECTED',
    'TOPIC_ASSIGNED',
    'OUTLINE_SUBMITTED',
    'OUTLINE_APPROVED',
    'OUTLINE_REJECTED',
    'IN_PROGRESS',
    'DEFENSE_REQUESTED',
    'DEFENSE_APPROVED',
    'DEFENSE_REJECTED',
    'READY_FOR_DEFENSE',
    'DEFENDING',
    'GRADED',
    'PASSED',
    'FAILED',
    'COMPLETED'
);

CREATE TABLE theses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id        UUID NOT NULL REFERENCES thesis_batches(id),
    student_id      UUID NOT NULL REFERENCES students(id),
    topic_id        UUID REFERENCES topics(id),
    advisor_id      UUID REFERENCES lecturers(id),
    status          thesis_status NOT NULL DEFAULT 'ELIGIBLE_FOR_THESIS',

    advisor_score       NUMERIC(4,2) CHECK (advisor_score >= 0 AND advisor_score <= 10),
    council_score       NUMERIC(4,2) CHECK (council_score >= 0 AND council_score <= 10),
    final_score         NUMERIC(4,2) CHECK (final_score >= 0 AND final_score <= 10),
    grade               VARCHAR(20),
    advisor_comment     TEXT,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_student_batch UNIQUE (student_id, batch_id)
);

-- ============================================================
-- 6. TOPIC REGISTRATION (Yêu cầu đăng ký đề tài)
-- ============================================================

CREATE TYPE registration_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TABLE topic_registrations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thesis_id       UUID NOT NULL REFERENCES theses(id),
    topic_id        UUID NOT NULL REFERENCES topics(id),
    student_id      UUID NOT NULL REFERENCES students(id),
    preferred_lecturer_id UUID REFERENCES lecturers(id),
    status          registration_status NOT NULL DEFAULT 'PENDING',
    reject_reason   TEXT,
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. OUTLINES (Đề cương)
-- ============================================================

CREATE TYPE outline_status AS ENUM (
    'SUBMITTED',
    'APPROVED',
    'REJECTED'
);

CREATE TABLE outlines (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thesis_id       UUID NOT NULL REFERENCES theses(id),
    version         INT NOT NULL DEFAULT 1,
    file_path       VARCHAR(500) NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_size       BIGINT,
    status          outline_status NOT NULL DEFAULT 'SUBMITTED',
    reviewer_comment TEXT,
    reviewed_by     UUID REFERENCES lecturers(id),
    reviewed_at     TIMESTAMPTZ,
    submitted_at    TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. PROGRESS REPORTS (Tiến độ thực hiện)
-- ============================================================

CREATE TYPE progress_evaluation AS ENUM (
    'NOT_REVIEWED',
    'PASSED',
    'FAILED'
);

CREATE TABLE progress_reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thesis_id       UUID NOT NULL REFERENCES theses(id),
    week_number     INT,
    title           VARCHAR(300),
    description     TEXT NOT NULL,
    file_path       VARCHAR(500),
    evaluation      progress_evaluation NOT NULL DEFAULT 'NOT_REVIEWED',
    reviewer_comment TEXT,
    reviewed_by     UUID REFERENCES lecturers(id),
    reviewed_at     TIMESTAMPTZ,
    submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. DEFENSE REGISTRATION (Đăng ký bảo vệ)
-- ============================================================

CREATE TYPE defense_reg_status AS ENUM (
    'REQUESTED',
    'APPROVED',
    'REJECTED'
);

CREATE TABLE defense_registrations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thesis_id       UUID NOT NULL REFERENCES theses(id),
    report_file     VARCHAR(500) NOT NULL,
    source_code     VARCHAR(500),
    slide_file      VARCHAR(500),
    status          defense_reg_status NOT NULL DEFAULT 'REQUESTED',
    reject_reason   TEXT,
    reviewed_by     UUID REFERENCES lecturers(id),
    reviewed_at     TIMESTAMPTZ,
    submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. COUNCILS (Hội đồng bảo vệ)
-- ============================================================

CREATE TYPE council_member_role AS ENUM (
    'CHAIR',
    'SECRETARY',
    'REVIEWER',
    'MEMBER'
);

CREATE TABLE councils (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id        UUID NOT NULL REFERENCES thesis_batches(id),
    name            VARCHAR(200) NOT NULL,
    major_id        UUID REFERENCES majors(id),
    max_theses      INT DEFAULT 20,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE council_members (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    council_id      UUID NOT NULL REFERENCES councils(id) ON DELETE CASCADE,
    lecturer_id     UUID NOT NULL REFERENCES lecturers(id),
    role            council_member_role NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_council_lecturer UNIQUE (council_id, lecturer_id)
);

-- ============================================================
-- 11. DEFENSE SESSIONS (Buổi bảo vệ)
-- ============================================================

CREATE TABLE rooms (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        VARCHAR(20) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    capacity    INT,
    building    VARCHAR(100)
);

CREATE TABLE defense_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    council_id      UUID NOT NULL REFERENCES councils(id),
    room_id         UUID REFERENCES rooms(id),
    defense_date    DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_session_time CHECK (end_time > start_time)
);

CREATE TABLE defense_assignments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES defense_sessions(id),
    thesis_id       UUID NOT NULL REFERENCES theses(id),
    slot_order      INT NOT NULL,
    slot_start      TIME,
    slot_end        TIME,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_thesis_session UNIQUE (thesis_id, session_id)
);

-- ============================================================
-- 12. SCORES (Chấm điểm chi tiết)
-- ============================================================

CREATE TYPE score_type AS ENUM (
    'ADVISOR',
    'CHAIR',
    'REVIEWER',
    'SECRETARY',
    'MEMBER'
);

CREATE TABLE scores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thesis_id       UUID NOT NULL REFERENCES theses(id),
    scorer_id       UUID NOT NULL REFERENCES lecturers(id),
    score_type      score_type NOT NULL,
    score           NUMERIC(4,2) NOT NULL CHECK (score >= 0 AND score <= 10),
    comment         TEXT,
    scored_at       TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_thesis_scorer_type UNIQUE (thesis_id, scorer_id, score_type)
);

CREATE TABLE score_approval (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thesis_id       UUID UNIQUE NOT NULL REFERENCES theses(id),
    final_score     NUMERIC(4,2) NOT NULL,
    grade           VARCHAR(20) NOT NULL,
    approved_by     UUID NOT NULL REFERENCES users(id),
    approved_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. DOCUMENTS (Tài liệu lưu trữ)
-- ============================================================

CREATE TYPE document_type AS ENUM (
    'OUTLINE',
    'PROGRESS_REPORT',
    'FINAL_REPORT',
    'SOURCE_CODE',
    'SLIDE',
    'DEFENSE_MINUTES',
    'OTHER'
);

CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thesis_id       UUID NOT NULL REFERENCES theses(id),
    doc_type        document_type NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    file_size       BIGINT,
    mime_type       VARCHAR(100),
    uploaded_by     UUID NOT NULL REFERENCES users(id),
    uploaded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. NOTIFICATIONS (Thông báo)
-- ============================================================

CREATE TYPE notification_type AS ENUM (
    'BATCH_OPENED',
    'TOPIC_APPROVED',
    'TOPIC_REJECTED',
    'ADVISOR_ASSIGNED',
    'OUTLINE_REVIEWED',
    'PROGRESS_REMINDER',
    'DEFENSE_SCHEDULED',
    'SCORE_PUBLISHED',
    'GENERAL'
);

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id    UUID NOT NULL REFERENCES users(id),
    type            notification_type NOT NULL DEFAULT 'GENERAL',
    title           VARCHAR(300) NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    reference_type  VARCHAR(50),
    reference_id    UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. AUDIT LOG (Nhật ký hệ thống)
-- ============================================================

CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       UUID,
    old_value       JSONB,
    new_value       JSONB,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_schools_university ON schools(university_id);
CREATE INDEX idx_faculties_school ON faculties(school_id);
CREATE INDEX idx_majors_faculty ON majors(faculty_id);
CREATE INDEX idx_students_major ON students(major_id);
CREATE INDEX idx_students_eligible ON students(eligible_for_thesis) WHERE eligible_for_thesis = TRUE;
CREATE INDEX idx_lecturers_faculty ON lecturers(faculty_id);

CREATE INDEX idx_thesis_batches_status ON thesis_batches(status);
CREATE INDEX idx_topics_batch ON topics(batch_id);
CREATE INDEX idx_topics_status ON topics(status);
CREATE INDEX idx_topics_major ON topics(major_id);

CREATE INDEX idx_theses_batch ON theses(batch_id);
CREATE INDEX idx_theses_student ON theses(student_id);
CREATE INDEX idx_theses_advisor ON theses(advisor_id);
CREATE INDEX idx_theses_status ON theses(status);

CREATE INDEX idx_progress_thesis ON progress_reports(thesis_id);
CREATE INDEX idx_outlines_thesis ON outlines(thesis_id);
CREATE INDEX idx_defense_reg_thesis ON defense_registrations(thesis_id);
CREATE INDEX idx_scores_thesis ON scores(thesis_id);
CREATE INDEX idx_documents_thesis ON documents(thesis_id);

CREATE INDEX idx_council_members_council ON council_members(council_id);
CREATE INDEX idx_council_members_lecturer ON council_members(lecturer_id);
CREATE INDEX idx_defense_sessions_council ON defense_sessions(council_id);
CREATE INDEX idx_defense_assignments_session ON defense_assignments(session_id);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================
-- SEED DATA (Dữ liệu mẫu)
-- ============================================================

INSERT INTO universities (code, name) VALUES
('PHENIKAA', 'Đại học Phenikaa');

INSERT INTO schools (university_id, code, name) VALUES
((SELECT id FROM universities WHERE code = 'PHENIKAA'), 'SICT',  'Trường Công nghệ Thông tin'),
((SELECT id FROM universities WHERE code = 'PHENIKAA'), 'SENG',  'Trường Kỹ thuật'),
((SELECT id FROM universities WHERE code = 'PHENIKAA'), 'SBUS',  'Trường Kinh tế'),
((SELECT id FROM universities WHERE code = 'PHENIKAA'), 'SMED',  'Trường Y - Dược');

INSERT INTO faculties (school_id, code, name) VALUES
-- Trường CNTT
((SELECT id FROM schools WHERE code = 'SICT'), 'KHMT',  'Khoa Khoa học Máy tính'),
((SELECT id FROM schools WHERE code = 'SICT'), 'HTTT',  'Khoa Hệ thống thông tin'),
((SELECT id FROM schools WHERE code = 'SICT'), 'MANG',  'Khoa Mạng và Hệ thống'),
-- Trường Kỹ thuật
((SELECT id FROM schools WHERE code = 'SENG'), 'CKCDT', 'Khoa Cơ khí - Cơ điện tử'),
((SELECT id FROM schools WHERE code = 'SENG'), 'DIEN',  'Khoa Điện - Điện tử'),
-- Trường Kinh tế
((SELECT id FROM schools WHERE code = 'SBUS'), 'QTKD',  'Khoa Quản trị Kinh doanh'),
-- Trường Y - Dược
((SELECT id FROM schools WHERE code = 'SMED'), 'Y',     'Khoa Y'),
((SELECT id FROM schools WHERE code = 'SMED'), 'DUOC',  'Khoa Dược');

INSERT INTO majors (faculty_id, code, name, required_credits, min_gpa_for_thesis) VALUES
-- Trường CNTT
((SELECT id FROM faculties WHERE code = 'KHMT'), 'KHM',   'Ngành Khoa học Máy tính',              130, 2.00),
((SELECT id FROM faculties WHERE code = 'KHMT'), 'TTNT',  'Ngành Trí tuệ Nhân tạo',               130, 2.00),
((SELECT id FROM faculties WHERE code = 'HTTT'), 'CNTT',  'Ngành Công nghệ Thông tin',            130, 2.00),
((SELECT id FROM faculties WHERE code = 'HTTT'), 'KTPM',  'Ngành Kỹ thuật Phần mềm',              130, 2.00),
((SELECT id FROM faculties WHERE code = 'MANG'), 'ATTT',  'Ngành An toàn Thông tin',              130, 2.00),
((SELECT id FROM faculties WHERE code = 'MANG'), 'MMT',   'Ngành Mạng Máy tính và Truyền thông',  130, 2.00),
-- Trường Kỹ thuật
((SELECT id FROM faculties WHERE code = 'CKCDT'), 'CDT',  'Ngành Kỹ thuật Cơ điện tử',            130, 2.00),
((SELECT id FROM faculties WHERE code = 'CKCDT'), 'OTO',  'Ngành Kỹ thuật Ô tô',                  130, 2.00),
((SELECT id FROM faculties WHERE code = 'DIEN'),  'DKTDH','Ngành Kỹ thuật Điều khiển và Tự động hóa', 130, 2.00),
-- Trường Kinh tế
((SELECT id FROM faculties WHERE code = 'QTKD'),  'QTKD', 'Ngành Quản trị Kinh doanh',            130, 2.00);

INSERT INTO academic_years (name, start_date, end_date) VALUES
('2025-2026', '2025-09-01', '2026-06-30');

INSERT INTO rooms (code, name, capacity, building) VALUES
('A301', 'Phòng A301', 40, 'Tòa A'),
('A302', 'Phòng A302', 40, 'Tòa A'),
('B201', 'Phòng B201', 30, 'Tòa B'),
('B202', 'Phòng B202', 30, 'Tòa B');

-- Seed roles
INSERT INTO roles (code, name) VALUES
('ADMIN', 'Quản trị hệ thống'),
('TRAINING_DEPT', 'Phòng Đào tạo'),
('DEPT_HEAD', 'Trưởng ngành / Ngành'),
('LECTURER', 'Giảng viên'),
('STUDENT', 'Sinh viên');

-- Seed users (SSO: external_id tạm để null, sẽ map sau)
INSERT INTO users (username, email, first_name, last_name, status) VALUES
('admin',       'admin@phenikaa.edu.vn',        'System',        'Admin',          'ACTIVE'),
('pdt01',       'nhatcoifacebook@gmail.com',          'Phòng',        'Đào tạo',        'ACTIVE'),
('truongnganh', 'vnhat64.work@gmail.com',  'Trưởng ngành', 'KTPM',           'ACTIVE'),
('gv_nhat',     'inodev.0604@gmail.com',      'Nguyễn Văn',   'Nhật GV',        'ACTIVE'),
('gv_viet',     'viet.gv@phenikaa.edu.vn',      'Nghiêm Đức',   'Việt GV',        'ACTIVE'),
('sv001',       '23010636@st.phenikaa.edu.vn',     'Sinh viên',    'Nguyễn A',       'ACTIVE'),
('sv002',       '23010887@st.phenikaa.edu.vn',     'Sinh viên',    'Trần B',         'ACTIVE');

-- Map user roles
INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE username = 'admin'), (SELECT id FROM roles WHERE code = 'ADMIN')),
((SELECT id FROM users WHERE username = 'pdt01'), (SELECT id FROM roles WHERE code = 'TRAINING_DEPT')),
-- Trưởng ngành có 2 role: DEPT_HEAD và LECTURER
((SELECT id FROM users WHERE username = 'truongnganh'), (SELECT id FROM roles WHERE code = 'DEPT_HEAD')),
((SELECT id FROM users WHERE username = 'truongnganh'), (SELECT id FROM roles WHERE code = 'LECTURER')),
((SELECT id FROM users WHERE username = 'gv_nhat'), (SELECT id FROM roles WHERE code = 'LECTURER')),
((SELECT id FROM users WHERE username = 'gv_viet'), (SELECT id FROM roles WHERE code = 'LECTURER')),
((SELECT id FROM users WHERE username = 'sv001'), (SELECT id FROM roles WHERE code = 'STUDENT')),
((SELECT id FROM users WHERE username = 'sv002'), (SELECT id FROM roles WHERE code = 'STUDENT'));

INSERT INTO lecturers (user_id, lecturer_code, faculty_id, managed_major_code) VALUES
((SELECT id FROM users WHERE username = 'gv_nhat'),  'GV001', (SELECT id FROM faculties WHERE code = 'HTTT'), NULL),
((SELECT id FROM users WHERE username = 'gv_viet'),  'GV002', (SELECT id FROM faculties WHERE code = 'HTTT'), NULL),
((SELECT id FROM users WHERE username = 'truongnganh'), 'GV000', (SELECT id FROM faculties WHERE code = 'HTTT'), 'KTPM');

INSERT INTO students (user_id, student_code, major_id, cohort, eligible_for_thesis) VALUES
((SELECT id FROM users WHERE username = 'sv001'), '23010887', (SELECT id FROM majors WHERE code = 'KTPM'), 'K17', TRUE),
((SELECT id FROM users WHERE username = 'sv002'), '23010636', (SELECT id FROM majors WHERE code = 'KTPM'), 'K17', TRUE);

