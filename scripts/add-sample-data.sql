-- Sample data for testing analytics
-- Run this after setting up the database to add test data

-- Insert sample questions
INSERT INTO questions (user_id, file_id, course_id, subject_tag, document_title, type, text, correct_answer, difficulty, topic, metadata) VALUES
('demo-user', 'math_101.pdf', 'MATH101', 'mathematics', 'Calculus Fundamentals', 'multiple-choice', 'What is the derivative of x²?', '2x', 'easy', 'Derivatives', '{}'),
('demo-user', 'math_101.pdf', 'MATH101', 'mathematics', 'Calculus Fundamentals', 'multiple-choice', 'What is the integral of 2x?', 'x² + C', 'medium', 'Integrals', '{}'),
('demo-user', 'physics_201.pdf', 'PHYS201', 'physics', 'Classical Mechanics', 'multiple-choice', 'What is Newton''s second law?', 'F = ma', 'easy', 'Newton Laws', '{}'),
('demo-user', 'chem_301.pdf', 'CHEM301', 'chemistry', 'Organic Chemistry', 'multiple-choice', 'What is the molecular formula of methane?', 'CH₄', 'easy', 'Organic Compounds', '{}'),
('demo-user', 'cs_101.pdf', 'CS101', 'computer-science', 'Data Structures', 'multiple-choice', 'What is the time complexity of binary search?', 'O(log n)', 'medium', 'Algorithms', '{}');

-- Insert sample exam results for the past 30 days
INSERT INTO exam_results (user_id, exam_id, exam_title, score, correct_answers, total_questions, time_spent_seconds, time_limit_minutes, study_time_minutes, started_at, completed_at) VALUES
('demo-user', 'exam_1', 'Calculus Practice Test', 85, 17, 20, 1800, 30, 30, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('demo-user', 'exam_2', 'Physics Fundamentals', 78, 15, 20, 2100, 35, 35, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('demo-user', 'exam_3', 'Chemistry Basics', 92, 18, 20, 1650, 30, 28, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('demo-user', 'exam_4', 'Data Structures Quiz', 88, 22, 25, 2400, 40, 40, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('demo-user', 'exam_5', 'Advanced Calculus', 72, 14, 20, 2700, 45, 45, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('demo-user', 'exam_6', 'Physics Problem Set', 95, 19, 20, 1500, 30, 25, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('demo-user', 'exam_7', 'Organic Chemistry Test', 68, 13, 20, 3000, 50, 50, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('demo-user', 'exam_8', 'Algorithm Analysis', 91, 18, 20, 1800, 30, 30, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
('demo-user', 'exam_9', 'Calculus Review', 83, 16, 20, 2200, 35, 37, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
('demo-user', 'exam_10', 'Physics Lab Quiz', 76, 15, 20, 1900, 30, 32, NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days');

-- Insert some recent exam results for this week
INSERT INTO exam_results (user_id, exam_id, exam_title, score, correct_answers, total_questions, time_spent_seconds, time_limit_minutes, study_time_minutes, started_at, completed_at) VALUES
('demo-user', 'exam_11', 'Weekly Math Review', 89, 17, 20, 1700, 30, 28, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('demo-user', 'exam_12', 'Chemistry Practice', 94, 18, 20, 1600, 30, 27, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

SELECT 'Sample data inserted successfully!' as message;