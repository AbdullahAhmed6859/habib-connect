BEGIN;


CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);


CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    short TEXT UNIQUE NOT NULL
);

CREATE TABLE email_suffixes (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);


CREATE TABLE email_role_choices (
    email_suffix_id INTEGER REFERENCES email_suffixes(id),
    school_id INTEGER REFERENCES schools(id),
    role_id INTEGER NOT NULL REFERENCES roles(id),
    PRIMARY KEY (email_suffix_id, school_id, role_id)
);


CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    short TEXT UNIQUE NOT NULL,
    school_id INTEGER NOT NULL REFERENCES schools(id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,


    -- structured email components
    email_prefix TEXT NOT NULL,
    email_suffix_id INTEGER NOT NULL,

    -- user info
    role_id INTEGER NOT NULL REFERENCES roles(id),
    program_id INTEGER REFERENCES programs(id),
    class_of INTEGER,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    password_hash TEXT NOT NULL
);


CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(name)
);

CREATE TABLE channel_allowed_roles (
    channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    PRIMARY KEY (channel_id, role_id)
);

-- Add notifications table to the database

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('comment', 'like', 'mention', 'channel_invite')),
    content TEXT NOT NULL,
    related_post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    related_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    related_channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;


-- Add events and event subscriptions tables

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    location TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel_id INTEGER REFERENCES channels(id) ON DELETE SET NULL,
    is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
    max_attendees INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS event_subscriptions (
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (event_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_channel_id ON events(channel_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_user_id ON event_subscriptions(user_id);

-- GPA Calculator Schema

-- Semesters table
CREATE TABLE IF NOT EXISTS semesters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Fall 2024", "Spring 2025"
    year INTEGER NOT NULL,
    season TEXT NOT NULL CHECK (season IN ('Fall', 'Spring', 'Summer')),
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, year, season)
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    semester_id INTEGER NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_code TEXT NOT NULL, -- e.g., "CS 101"
    course_name TEXT NOT NULL, -- e.g., "Intro to Computer Science"
    credit_hours DECIMAL(3,1) NOT NULL CHECK (credit_hours > 0), -- e.g., 3.0, 4.0
    grade TEXT NOT NULL CHECK (grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'F')),
    grade_points DECIMAL(3,2), -- Calculated based on grade
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Semester GPA summary (denormalized for performance)
CREATE TABLE IF NOT EXISTS semester_gpa (
    id SERIAL PRIMARY KEY,
    semester_id INTEGER NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_credits DECIMAL(5,1) NOT NULL DEFAULT 0,
    earned_credits DECIMAL(5,1) NOT NULL DEFAULT 0,
    gpa DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(semester_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_semesters_user_id ON semesters(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester_id ON courses(semester_id);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_semester_gpa_user_id ON semester_gpa(user_id);

-- Function to calculate grade points based on grade
CREATE OR REPLACE FUNCTION calculate_grade_points(grade TEXT)
RETURNS DECIMAL(3,2) AS $$
BEGIN
    RETURN CASE grade
        WHEN 'A+' THEN 4.00
        WHEN 'A' THEN 4.00
        WHEN 'A-' THEN 3.67
        WHEN 'B+' THEN 3.33
        WHEN 'B' THEN 3.00
        WHEN 'B-' THEN 2.67
        WHEN 'C+' THEN 2.33
        WHEN 'C' THEN 2.00
        WHEN 'C-' THEN 1.67
        WHEN 'F' THEN 0.00
        ELSE 0.00
    END;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate grade points when course is inserted/updated
CREATE OR REPLACE FUNCTION update_course_grade_points()
RETURNS TRIGGER AS $$
BEGIN
    NEW.grade_points := calculate_grade_points(NEW.grade);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_course_grade_points
    BEFORE INSERT OR UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_course_grade_points();

-- Course Swap Marketplace Schema

CREATE TABLE IF NOT EXISTS swap_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_code TEXT NOT NULL, -- e.g., "CS 101"
    course_name TEXT NOT NULL,
    current_section TEXT NOT NULL, -- Section they currently have
    desired_section TEXT NOT NULL, -- Section they want
    instructor_current TEXT, -- Current instructor
    instructor_desired TEXT, -- Desired instructor
    semester TEXT NOT NULL, -- e.g., "Fall 2024"
    notes TEXT, -- Additional information
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table to track when two users match for a swap
CREATE TABLE IF NOT EXISTS swap_matches (
    id SERIAL PRIMARY KEY,
    request_id_1 INTEGER NOT NULL REFERENCES swap_requests(id) ON DELETE CASCADE,
    request_id_2 INTEGER NOT NULL REFERENCES swap_requests(id) ON DELETE CASCADE,
    matched_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    UNIQUE(request_id_1, request_id_2)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_swap_requests_user_id ON swap_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_course_code ON swap_requests(course_code);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON swap_requests(status);
CREATE INDEX IF NOT EXISTS idx_swap_matches_request_ids ON swap_matches(request_id_1, request_id_2);

-- File Attachments Schema

-- Post attachments
CREATE TABLE IF NOT EXISTS post_attachments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL, -- URL or path to the file
    file_type TEXT NOT NULL, -- MIME type (e.g., 'image/png', 'application/pdf')
    file_size INTEGER NOT NULL, -- Size in bytes
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Event attachments
CREATE TABLE IF NOT EXISTS event_attachments (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT NOT NULL DEFAULT 'en',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_attachments_post_id ON post_attachments(post_id);
CREATE INDEX IF NOT EXISTS idx_event_attachments_event_id ON event_attachments(event_id);


CREATE TABLE channel_allowed_programs (
    channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    program_id INTEGER NOT NULL REFERENCES programs(id),
    PRIMARY KEY (channel_id, program_id)
);


CREATE TABLE channel_members (
    channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_posts_channel ON posts(channel_id);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE post_likes (
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

INSERT INTO roles (id, name) VALUES
    (1, 'student'),
    (2, 'faculty'),
    (3, 'staff');

INSERT INTO schools (id, name, short) VALUES
    (1, 'Dhanani School of Science and Engineering', 'DSSE'),
    (2, 'School of Arts, Humanities & Social Sciences', 'AHSS');


INSERT INTO email_suffixes (id, name) VALUES
    (1, 'st.habib.edu.pk'),
    (2, 'sse.habib.edu.pk'),
    (3, 'ahss.habib.edu.pk'),
    (4, 'habib.edu.pk');


INSERT INTO email_role_choices (email_suffix_id, school_id, role_id) VALUES
    (1, 1, 1), -- st.habib.edu.pk → student → DSSE
    (1, 2, 1), -- st.habib.edu.pk → student → AHSS

    (2, 1, 2), -- sse.habib.edu.pk → faculty → DSSE
    (3, 2, 2), -- ahss.habib.edu.pk → faculty → AHSS
    (4, NULL, 3); -- habib.edu.pk → staff → no school

INSERT INTO programs (id, name, short, school_id) VALUES
    (1, 'Social Development and Policy', 'SDP', 2),
    (2, 'Computer Engineering', 'CE', 1),
    (3, 'Computer Science', 'CS', 1),
    (4, 'Electrical Engineering', 'EE', 1),
    (5, 'Comparative Humanities', 'CH', 2),
    (6, 'Communication and Design', 'CND', 2);


INSERT INTO users (
    id, first_name, last_name,
    email_prefix, email_suffix_id, role_id,
    program_id, class_of, password_hash
) VALUES
    (
        1, 'Abdullah', 'Ahmed',
        'aa09303', 1, 1,
        2, 2027,
        '$2b$10$p1ZzSvLH6xI7lUS5ND8Qp.MpV8qnoMtditRLLvppQMjYr7vGFMnWq'
    ),
    (
        2, 'Maria', 'Samad',
        'maria.samad', 2, 2,
        3, NULL,
        '$2b$10$p1ZzSvLH6xI7lUS5ND8Qp.MpV8qnoMtditRLLvppQMjYr7vGFMnWq'
    );


INSERT INTO channels (name, description, created_by) VALUES
    ('CS Study Group', 'Discussion forum for Computer Science students', 1),
    ('DSSE Announcements', 'Official announcements for DSSE students', 1),
    ('General Discussion', 'Open forum for all students', 1);

-- Set allowed roles for channels
-- CS Study Group: Only students
INSERT INTO channel_allowed_roles (channel_id, role_id) VALUES (1, 1);

-- CS Study Group: Only CS and CE majors
INSERT INTO channel_allowed_programs (channel_id, program_id) VALUES 
    (1, 2), -- CE
    (1, 3); -- CS

-- DSSE Announcements: Students and Faculty
INSERT INTO channel_allowed_roles (channel_id, role_id) VALUES 
    (2, 1),
    (2, 2);

-- DSSE Announcements: All DSSE programs
INSERT INTO channel_allowed_programs (channel_id, program_id) VALUES 
    (2, 2), -- CE
    (2, 3), -- CS
    (2, 4); -- EE

-- General Discussion: All roles (no restrictions)
-- No entries in allowed_roles/programs means open to everyone

INSERT INTO channel_members (channel_id, user_id) VALUES
    (1, 1), -- Abdullah - CS Study Group
    (2, 1), -- Abdullah - DSSE Announcements
    (3, 1), -- Abdullah - General Discussion
    (3, 2); -- Maria - General Discussion

INSERT INTO posts (channel_id, user_id, title, content) VALUES
    (1, 1, 'Anyone taking Data Structures?', 'Looking for study partners for DS course this semester.'),
    (2, 1, 'Midterm Schedule', 'Midterms start next week. Good luck everyone!'),
    (3, 1, 'Campus Cafe Recommendations', 'What''s your favorite spot on campus?');


INSERT INTO comments (post_id, user_id, content) VALUES
    (1, 1, 'I''m taking it with Dr. Khan'),
    (3, 2, 'The library cafe has great coffee!');


INSERT INTO post_likes (post_id, user_id) VALUES
    (1, 1),
    (3, 1),
    (3, 2);


COMMIT;