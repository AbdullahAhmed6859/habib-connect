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