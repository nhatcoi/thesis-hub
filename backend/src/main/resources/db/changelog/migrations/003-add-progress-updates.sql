-- liquibase formatted sql

-- changeset thesis:add-progress-noti-types runInTransaction:false
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'notification_type' AND e.enumlabel = 'PROGRESS_UPDATED') THEN
        ALTER TYPE notification_type ADD VALUE 'PROGRESS_UPDATED';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'notification_type' AND e.enumlabel = 'PROGRESS_REVIEWED') THEN
        ALTER TYPE notification_type ADD VALUE 'PROGRESS_REVIEWED';
    END IF;
END $$;

-- changeset thesis:create-progress-status-enum runInTransaction:false
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'progress_status') THEN
        CREATE TYPE progress_status AS ENUM ('SUBMITTED', 'REVIEWED', 'NEEDS_REVISION');
    END IF;
END $$;

-- changeset thesis:create-progress-updates-table
CREATE TABLE IF NOT EXISTS progress_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesis_id UUID NOT NULL REFERENCES theses(id),
    week_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    status progress_status NOT NULL DEFAULT 'SUBMITTED',
    reviewer_comment TEXT,
    reviewed_by UUID REFERENCES lecturers(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_thesis ON progress_updates(thesis_id);
