-- Sample Data Inserts for HUx Application
-- Run this AFTER running create_script.sql

BEGIN;

-- Clean up existing sample data (keeps schema, removes data)
-- This prevents duplicate key errors
-- ORDER MATTERS: Delete in reverse order of foreign key dependencies
DELETE FROM notifications;
DELETE FROM user_settings;
DELETE FROM swap_matches;
DELETE FROM swap_requests;
DELETE FROM semester_gpa;
DELETE FROM courses;
DELETE FROM semesters;
DELETE FROM event_subscriptions;
DELETE FROM events;
DELETE FROM post_likes;
DELETE FROM comments;
DELETE FROM posts;
DELETE FROM channel_members;
DELETE FROM channel_allowed_programs;
DELETE FROM channel_allowed_roles;
DELETE FROM channels;
DELETE FROM users;

-- Reset sequences to start from 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE channels_id_seq RESTART WITH 1;
ALTER SEQUENCE posts_id_seq RESTART WITH 1;
ALTER SEQUENCE comments_id_seq RESTART WITH 1;
ALTER SEQUENCE events_id_seq RESTART WITH 1;
ALTER SEQUENCE semesters_id_seq RESTART WITH 1;
ALTER SEQUENCE courses_id_seq RESTART WITH 1;
ALTER SEQUENCE swap_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;

-- Add users (students, faculty, staff)
-- All passwords are: password123
INSERT INTO users (first_name, last_name, email_prefix, email_suffix_id, role_id, program_id, class_of, password_hash) VALUES
    ('Abdullah', 'Ahmed', 'aa09303', 1, 1, 2, 2027, '$2b$10$p1ZzSvLH6xI7lUS5ND8Qp.MpV8qnoMtditRLLvppQMjYr7vGFMnWq'),
    ('Maria', 'Samad', 'maria.samad', 2, 2, 3, NULL, '$2b$10$p1ZzSvLH6xI7lUS5ND8Qp.MpV8qnoMtditRLLvppQMjYr7vGFMnWq'),
    ('Sarah', 'Khan', 'sk08123', 1, 1, 3, 2026, '$2b$10$p1ZzSvLH6xI7lUS5ND8Qp.MpV8qnoMtditRLLvppQMjYr7vGFMnWq'),
    ('Ahmed', 'Ali', 'aa08456', 1, 1, 2, 2026, '$2b$10$p1ZzSvLH6xI7lUS5ND8Qp.MpV8qnoMtditRLLvppQMjYr7vGFMnWq'),
    ('Fatima', 'Hassan', 'fh09789', 1, 1, 4, 2027, '$2b$10$p1ZzSvLH6xI7lUS5ND8Qp.MpV8qnoMtditRLLvppQMjYr7vGFMnWq'),
    ('Zain', 'Malik', 'zm09012', 1, 1, 1, 2027, '$2b$10$p1ZzSvLH6xI7lUS5ND8Qp.MpV8qnoMtditRLLvppQMjYr7vGFMnWq'),
    ('Ayesha', 'Iqbal', 'ai08678', 1, 1, 5, 2026, '$2b$10$p1ZzSvLH6xI7lUS5ND8Qp.MpV8qnoMtditRLLvppQMjYr7vGFMnWq'),
    ('Ali', 'Raza', 'ali.raza', 2, 2, 3, NULL, '$2b$10$p1ZzSvLH6xI7lUS5ND8Qp.MpV8qnoMtditRLLvppQMjYr7vGFMnWq'),
    ('Hina', 'Shah', 'hina.shah', 3, 2, 5, NULL, '$2b$10$p1ZzSvLH6xI7lUS5ND8Qp.MpV8qnoMtditRLLvppQMjYr7vGFMnWq'),
    ('Omar', 'Siddiqui', 'omar.siddiqui', 4, 3, NULL, NULL, '$2b$10$p1ZzSvLH6xI7lUS5ND8Qp.MpV8qnoMtditRLLvppQMjYr7vGFMnWq');

-- Add channels
INSERT INTO channels (name, description, created_by) VALUES
    ('CS Study Group', 'Discussion forum for Computer Science students', 1),
    ('DSSE Announcements', 'Official announcements for DSSE students', 1),
    ('General Discussion', 'Open forum for all students', 1);

-- Set allowed roles for channels
INSERT INTO channel_allowed_roles (channel_id, role_id) VALUES 
    (1, 1), -- CS Study Group: Only students
    (2, 1), (2, 2); -- DSSE Announcements: Students and Faculty

-- Set allowed programs for channels
INSERT INTO channel_allowed_programs (channel_id, program_id) VALUES 
    (1, 2), (1, 3), -- CS Study Group: CE and CS majors
    (2, 2), (2, 3), (2, 4); -- DSSE Announcements: All DSSE programs

-- Add channel members
INSERT INTO channel_members (channel_id, user_id) VALUES
    (1, 1), (1, 3), (1, 4), -- CS Study Group
    (2, 1), (2, 3), (2, 4), (2, 5), (2, 8), -- DSSE Announcements
    (3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10); -- General Discussion

-- Add posts
INSERT INTO posts (channel_id, user_id, title, content, created_at) VALUES
    (1, 1, 'Anyone taking Data Structures?', 'Looking for study partners for DS course this semester.', NOW() - INTERVAL '6 days'),
    (2, 1, 'Midterm Schedule', 'Midterms start next week. Good luck everyone!', NOW() - INTERVAL '5 days'),
    (3, 1, 'Campus Cafe Recommendations', 'What''s your favorite spot on campus?', NOW() - INTERVAL '4 days'),
    (1, 3, 'Looking for Algorithm Study Partners', 'Anyone interested in forming a study group for Algorithms course? Let''s tackle those dynamic programming problems together!', NOW() - INTERVAL '2 days'),
    (1, 4, 'CS Career Fair Next Week', 'Don''t forget to register for the CS Career Fair happening next Wednesday!', NOW() - INTERVAL '1 day'),
    (2, 8, 'Lab Safety Reminder', 'Please ensure you follow all safety protocols in the engineering labs.', NOW() - INTERVAL '3 days'),
    (2, 3, 'Final Project Ideas', 'Share your final project ideas here! Looking for inspiration.', NOW() - INTERVAL '5 hours'),
    (3, 6, 'Lost and Found - Blue Notebook', 'Found a blue notebook in the library. Contact me if it''s yours!', NOW() - INTERVAL '4 hours'),
    (3, 7, 'Volunteer Opportunity', 'NGO looking for volunteers this weekend. Great for community service hours!', NOW() - INTERVAL '1 hour'),
    (3, 10, 'Campus Wifi Issues Resolved', 'The wifi connectivity issues have been resolved. Thank you for your patience.', NOW() - INTERVAL '30 minutes');

-- Add comments to posts
INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (1, 1, 'I''m taking it with Dr. Khan', NOW() - INTERVAL '5 days'),
    (3, 2, 'The library cafe has great coffee!', NOW() - INTERVAL '3 days'),
    (4, 1, 'I''m interested! What time works for everyone?', NOW() - INTERVAL '1 day'),
    (4, 4, 'Count me in! How about weekends?', NOW() - INTERVAL '20 hours'),
    (5, 3, 'Thanks for sharing! Already registered.', NOW() - INTERVAL '18 hours'),
    (6, 4, 'Great reminder, thanks!', NOW() - INTERVAL '2 days'),
    (7, 1, 'I''m working on a chatbot project using NLP', NOW() - INTERVAL '3 hours'),
    (7, 3, 'Mobile app for campus navigation would be cool', NOW() - INTERVAL '2 hours'),
    (8, 3, 'Is it the one with physics notes?', NOW() - INTERVAL '3 hours'),
    (9, 6, 'What kind of volunteer work?', NOW() - INTERVAL '50 minutes'),
    (9, 7, 'Teaching underprivileged children. Details in my DMs!', NOW() - INTERVAL '45 minutes');

-- Add post likes
INSERT INTO post_likes (post_id, user_id) VALUES
    (1, 1), (1, 3),
    (3, 1), (3, 2), (3, 3),
    (4, 1), (4, 3), (4, 4),
    (5, 1), (5, 3), (5, 4), (5, 8),
    (6, 1), (6, 4),
    (7, 1), (7, 3), (7, 4),
    (8, 3), (8, 6),
    (9, 3), (9, 6), (9, 7),
    (10, 1), (10, 3), (10, 4), (10, 10);

-- Add Events
INSERT INTO events (title, description, event_date, end_date, location, created_by, is_all_day, max_attendees, created_at) VALUES
    ('CS Career Fair 2025', 'Annual career fair featuring top tech companies recruiting CS/CE students. Bring your resumes!', 
     (CURRENT_DATE + INTERVAL '5 days')::timestamp + INTERVAL '10 hours', 
     (CURRENT_DATE + INTERVAL '5 days')::timestamp + INTERVAL '16 hours', 
     'Student Center, Main Hall', 1, FALSE, 200, NOW() - INTERVAL '10 days'),
    
    ('Hackathon 2025', 'Build innovative solutions in 24 hours! Prizes and mentorship from industry experts.', 
     (CURRENT_DATE + INTERVAL '12 days')::timestamp + INTERVAL '9 hours', 
     (CURRENT_DATE + INTERVAL '13 days')::timestamp + INTERVAL '9 hours', 
     'DSSE Building, Labs 201-205', 3, FALSE, 100, NOW() - INTERVAL '8 days'),
    
    ('Guest Lecture: AI Ethics', 'Dr. Ayesha Rahman discusses ethical considerations in artificial intelligence development.', 
     (CURRENT_DATE + INTERVAL '3 days')::timestamp + INTERVAL '14 hours', 
     (CURRENT_DATE + INTERVAL '3 days')::timestamp + INTERVAL '16 hours', 
     'Auditorium A', 7, FALSE, 150, NOW() - INTERVAL '5 days'),
    
    ('Study Break: Games Night', 'Unwind before midterms! Board games, video games, and snacks provided.', 
     (CURRENT_DATE + INTERVAL '2 days')::timestamp + INTERVAL '18 hours', 
     (CURRENT_DATE + INTERVAL '2 days')::timestamp + INTERVAL '22 hours', 
     'Student Lounge', 6, FALSE, 50, NOW() - INTERVAL '3 days'),
    
    ('Community Service Day', 'Join us for a day of giving back to the community. Transportation provided.', 
     (CURRENT_DATE + INTERVAL '8 days')::timestamp, 
     (CURRENT_DATE + INTERVAL '8 days')::timestamp + INTERVAL '8 hours', 
     'Various locations', 6, TRUE, 80, NOW() - INTERVAL '12 days'),
    
    ('Machine Learning Workshop', 'Hands-on workshop covering neural networks and deep learning fundamentals.', 
     (CURRENT_DATE + INTERVAL '15 days')::timestamp + INTERVAL '13 hours', 
     (CURRENT_DATE + INTERVAL '15 days')::timestamp + INTERVAL '17 hours', 
     'Computer Lab 3', 7, FALSE, 40, NOW() - INTERVAL '6 days'),
    
    ('Spring Festival 2025', 'Annual spring celebration with food stalls, performances, and activities!', 
     (CURRENT_DATE + INTERVAL '20 days')::timestamp + INTERVAL '11 hours', 
     (CURRENT_DATE + INTERVAL '20 days')::timestamp + INTERVAL '20 hours', 
     'Main Campus Lawn', 8, FALSE, NULL, NOW() - INTERVAL '15 days'),
    
    ('Final Exams Begin', 'Good luck to all students! Remember to take care of yourselves.', 
     (CURRENT_DATE + INTERVAL '25 days')::timestamp, 
     (CURRENT_DATE + INTERVAL '32 days')::timestamp, 
     'Various Exam Halls', 8, TRUE, NULL, NOW() - INTERVAL '20 days');

-- Add Event Subscriptions
INSERT INTO event_subscriptions (event_id, user_id, subscribed_at) VALUES
    (1, 1, NOW() - INTERVAL '9 days'), (1, 3, NOW() - INTERVAL '8 days'), (1, 4, NOW() - INTERVAL '7 days'), (1, 5, NOW() - INTERVAL '5 days'),
    (2, 1, NOW() - INTERVAL '7 days'), (2, 3, NOW() - INTERVAL '6 days'), (2, 4, NOW() - INTERVAL '6 days'),
    (3, 1, NOW() - INTERVAL '4 days'), (3, 3, NOW() - INTERVAL '4 days'), (3, 5, NOW() - INTERVAL '3 days'), (3, 6, NOW() - INTERVAL '3 days'),
    (4, 1, NOW() - INTERVAL '2 days'), (4, 3, NOW() - INTERVAL '2 days'), (4, 4, NOW() - INTERVAL '1 day'), (4, 5, NOW() - INTERVAL '1 day'), (4, 6, NOW() - INTERVAL '1 day'),
    (5, 5, NOW() - INTERVAL '11 days'), (5, 6, NOW() - INTERVAL '10 days'),
    (6, 1, NOW() - INTERVAL '5 days'), (6, 3, NOW() - INTERVAL '5 days'), (6, 4, NOW() - INTERVAL '4 days'),
    (7, 1, NOW() - INTERVAL '14 days'), (7, 3, NOW() - INTERVAL '13 days'), (7, 4, NOW() - INTERVAL '12 days'), (7, 5, NOW() - INTERVAL '11 days'), (7, 6, NOW() - INTERVAL '10 days');

-- Add GPA Data (Semesters)
INSERT INTO semesters (user_id, name, year, season, is_current) VALUES
    (1, 'Fall 2024', 2024, 'Fall', FALSE),
    (1, 'Spring 2025', 2025, 'Spring', TRUE),
    (3, 'Fall 2024', 2024, 'Fall', FALSE),
    (3, 'Spring 2025', 2025, 'Spring', TRUE),
    (4, 'Fall 2024', 2024, 'Fall', FALSE),
    (4, 'Spring 2025', 2025, 'Spring', TRUE);

-- Add Courses for Fall 2024
INSERT INTO courses (semester_id, user_id, course_code, course_name, credit_hours, grade) VALUES
    -- Abdullah Fall 2024
    (1, 1, 'CS 101', 'Introduction to Computer Science', 3.0, 'A'),
    (1, 1, 'MATH 201', 'Calculus II', 4.0, 'A-'),
    (1, 1, 'ENG 102', 'English Composition', 3.0, 'B+'),
    (1, 1, 'PHY 101', 'Physics I', 4.0, 'A'),
    
    -- Abdullah Spring 2025
    (2, 1, 'CS 201', 'Data Structures', 3.0, 'A+'),
    (2, 1, 'CS 221', 'Computer Architecture', 3.0, 'A'),
    (2, 1, 'MATH 301', 'Discrete Mathematics', 3.0, 'A-'),
    (2, 1, 'HUM 101', 'World Civilizations', 3.0, 'B+'),
    
    -- Sarah Fall 2024
    (3, 3, 'CS 101', 'Introduction to Computer Science', 3.0, 'A+'),
    (3, 3, 'MATH 201', 'Calculus II', 4.0, 'A'),
    (3, 3, 'ENG 102', 'English Composition', 3.0, 'A-'),
    (3, 3, 'CHEM 101', 'Chemistry I', 4.0, 'B+'),
    
    -- Sarah Spring 2025
    (4, 3, 'CS 201', 'Data Structures', 3.0, 'A'),
    (4, 3, 'CS 221', 'Computer Architecture', 3.0, 'A-'),
    (4, 3, 'MATH 301', 'Discrete Mathematics', 3.0, 'B+'),
    
    -- Ahmed Fall 2024
    (5, 4, 'EE 101', 'Introduction to Electrical Engineering', 3.0, 'A-'),
    (5, 4, 'MATH 201', 'Calculus II', 4.0, 'B+'),
    (5, 4, 'PHY 101', 'Physics I', 4.0, 'A'),
    
    -- Ahmed Spring 2025
    (6, 4, 'EE 201', 'Circuit Analysis', 3.0, 'A'),
    (6, 4, 'CS 101', 'Introduction to Computer Science', 3.0, 'A+'),
    (6, 4, 'MATH 301', 'Discrete Mathematics', 3.0, 'B+');

-- Add Course Swap Requests
INSERT INTO swap_requests (user_id, course_code, course_name, current_section, desired_section, instructor_current, instructor_desired, semester, notes, status) VALUES
    (1, 'CS 301', 'Algorithms', 'Section A', 'Section B', 'Dr. Khan', 'Dr. Ahmed', 'Fall 2025', 'Section B fits my schedule better', 'active'),
    (3, 'CS 301', 'Algorithms', 'Section B', 'Section A', 'Dr. Ahmed', 'Dr. Khan', 'Fall 2025', 'Prefer morning classes', 'active'),
    (4, 'MATH 401', 'Linear Algebra', 'Section C', 'Section A', 'Dr. Ali', 'Dr. Hassan', 'Fall 2025', 'Section A has better timing', 'active'),
    (6, 'CS 221', 'Computer Architecture', 'Section B', 'Section A', 'Prof. Rizvi', 'Dr. Malik', 'Spring 2025', NULL, 'active'),
    (1, 'ENG 201', 'Advanced Writing', 'Section A', 'Section C', 'Dr. Smith', 'Prof. Jones', 'Fall 2025', 'Need different time slot', 'active'),
    (3, 'PHY 201', 'Physics II', 'Section A', 'Section B', 'Dr. Rahman', 'Dr. Siddiqui', 'Fall 2025', 'Want to take with friends', 'active');

-- Create some swap matches (mutual swaps)
INSERT INTO swap_matches (request_id_1, request_id_2, status) VALUES
    (1, 2, 'pending'); -- Abdullah and Sarah want to swap CS 301 sections

-- Add Notifications
INSERT INTO notifications (user_id, actor_id, type, content, related_post_id, is_read, created_at) VALUES
    (1, 3, 'comment', 'Sarah Khan commented on your post', 4, FALSE, NOW() - INTERVAL '1 hour'),
    (1, 4, 'like', 'Ahmed Ali liked your post', 7, FALSE, NOW() - INTERVAL '2 hours'),
    (3, 1, 'comment', 'Abdullah Ahmed commented on your post', 7, TRUE, NOW() - INTERVAL '3 hours'),
    (4, 3, 'like', 'Sarah Khan liked your post', 5, FALSE, NOW() - INTERVAL '4 hours'),
    (1, 6, 'comment', 'Ayesha Iqbal commented on your post', 4, TRUE, NOW() - INTERVAL '5 hours'),
    (3, 4, 'comment', 'Ahmed Ali commented on your post', 7, FALSE, NOW() - INTERVAL '30 minutes');

-- Add User Settings
INSERT INTO user_settings (user_id, email_notifications, theme, language) VALUES
    (1, TRUE, 'dark', 'en'),
    (3, TRUE, 'light', 'en'),
    (4, FALSE, 'system', 'en'),
    (6, TRUE, 'light', 'en'),
    (7, TRUE, 'dark', 'en');

COMMIT;

-- Summary of sample data:
-- Users: 10 total (Abdullah, Maria, Sarah, Ahmed, Fatima, Zain, Ayesha, Ali, Hina, Omar)
-- Channels: 3 (CS Study Group, DSSE Announcements, General Discussion)
-- Posts: 10 total (with timestamps ranging from 6 days ago to 30 minutes ago)
-- Comments: 11 comments on various posts
-- Events: 8 events (ranging from 2 days to 32 days out)
-- Event Subscriptions: 28 subscriptions
-- Semesters: 6 semesters across 3 students (Abdullah, Sarah, Ahmed)
-- Courses: 21 courses with grades (A+ to B+)
-- Swap Requests: 6 active swap requests
-- Swap Matches: 1 pending match (Abdullah ↔ Sarah for CS 301)
-- Notifications: 6 notifications (mix of comments and likes)
-- User Settings: 5 users with custom settings

-- TEST LOGIN:
-- Email: aa09303@st.habib.edu.pk
-- Password: password123
