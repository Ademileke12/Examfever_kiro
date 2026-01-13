-- Enable RLS on all tables
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- Questions policies
CREATE POLICY "Users can view their own questions" ON questions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questions" ON questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" ON questions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" ON questions
    FOR DELETE USING (auth.uid() = user_id);

-- Question options policies
CREATE POLICY "Users can view options for their questions" ON question_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM questions 
            WHERE questions.id = question_options.question_id 
            AND questions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert options for their questions" ON question_options
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM questions 
            WHERE questions.id = question_options.question_id 
            AND questions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update options for their questions" ON question_options
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM questions 
            WHERE questions.id = question_options.question_id 
            AND questions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete options for their questions" ON question_options
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM questions 
            WHERE questions.id = question_options.question_id 
            AND questions.user_id = auth.uid()
        )
    );

-- Exams policies
CREATE POLICY "Users can view their own exams" ON exams
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exams" ON exams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams" ON exams
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams" ON exams
    FOR DELETE USING (auth.uid() = user_id);

-- Exam questions policies
CREATE POLICY "Users can view questions for their exams" ON exam_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE exams.id = exam_questions.exam_id 
            AND exams.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert questions for their exams" ON exam_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE exams.id = exam_questions.exam_id 
            AND exams.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update questions for their exams" ON exam_questions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE exams.id = exam_questions.exam_id 
            AND exams.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete questions for their exams" ON exam_questions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE exams.id = exam_questions.exam_id 
            AND exams.user_id = auth.uid()
        )
    );

-- Exam sessions policies
CREATE POLICY "Users can view their own exam sessions" ON exam_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exam sessions" ON exam_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam sessions" ON exam_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exam sessions" ON exam_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- User answers policies
CREATE POLICY "Users can view their own answers" ON user_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exam_sessions 
            WHERE exam_sessions.id = user_answers.session_id 
            AND exam_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own answers" ON user_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM exam_sessions 
            WHERE exam_sessions.id = user_answers.session_id 
            AND exam_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own answers" ON user_answers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM exam_sessions 
            WHERE exam_sessions.id = user_answers.session_id 
            AND exam_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own answers" ON user_answers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM exam_sessions 
            WHERE exam_sessions.id = user_answers.session_id 
            AND exam_sessions.user_id = auth.uid()
        )
    );

-- Exam results policies
CREATE POLICY "Users can view their own results" ON exam_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results" ON exam_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own results" ON exam_results
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own results" ON exam_results
    FOR DELETE USING (auth.uid() = user_id);
