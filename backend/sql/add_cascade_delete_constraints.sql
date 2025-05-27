-- =====================================================
-- MySQL Script: Add CASCADE DELETE Constraints
-- Purpose: Add CASCADE DELETE for all foreign keys referencing projects table
-- Date: ${current_date}
-- =====================================================

-- Step 1: Check existing foreign key constraints
-- Run this query first to see current constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME,
    DELETE_RULE
FROM 
    information_schema.REFERENTIAL_CONSTRAINTS rc
    JOIN information_schema.KEY_COLUMN_USAGE kcu ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
WHERE 
    rc.REFERENCED_TABLE_NAME = 'projects'
    AND rc.CONSTRAINT_SCHEMA = DATABASE();

-- =====================================================
-- Step 2: Drop existing foreign key constraints and recreate with CASCADE DELETE
-- =====================================================

-- 1. project_students table
-- Drop existing constraint first
ALTER TABLE project_students 
DROP FOREIGN KEY IF EXISTS FK_project_students_project_id,
DROP FOREIGN KEY IF EXISTS FKhq84ryx8qnq8b70kk4qw65n60;

-- Add new constraint with CASCADE DELETE
ALTER TABLE project_students 
ADD CONSTRAINT FK_project_students_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- 2. contribution_scores table
-- Drop existing constraint first
ALTER TABLE contribution_scores 
DROP FOREIGN KEY IF EXISTS FK_contribution_scores_project_id,
DROP FOREIGN KEY IF EXISTS FK77yejfmoqg7mo5vp0h47vmkc2;

-- Add new constraint with CASCADE DELETE
ALTER TABLE contribution_scores 
ADD CONSTRAINT FK_contribution_scores_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- 3. groups table
-- Drop existing constraint first
ALTER TABLE groups 
DROP FOREIGN KEY IF EXISTS FK_groups_project_id,
DROP FOREIGN KEY IF EXISTS FKfhj2hh46vx30jqowk0871gfcp;

-- Add new constraint with CASCADE DELETE
ALTER TABLE groups 
ADD CONSTRAINT FK_groups_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- 4. peer_reviews table
-- Drop existing constraint first
ALTER TABLE peer_reviews 
DROP FOREIGN KEY IF EXISTS FK_peer_reviews_project_id,
DROP FOREIGN KEY IF EXISTS FK8ypb8qw3qto4pjh57hf6ycp6k;

-- Add new constraint with CASCADE DELETE
ALTER TABLE peer_reviews 
ADD CONSTRAINT FK_peer_reviews_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- 5. free_rider_cases table
-- Drop existing constraint first
ALTER TABLE free_rider_cases 
DROP FOREIGN KEY IF EXISTS FK_free_rider_cases_project_id,
DROP FOREIGN KEY IF EXISTS FK84xvtfnqvmtl9h3l7x4y0wpf7;

-- Add new constraint with CASCADE DELETE
ALTER TABLE free_rider_cases 
ADD CONSTRAINT FK_free_rider_cases_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- 6. pressure_score_history table
-- Drop existing constraint first
ALTER TABLE pressure_score_history 
DROP FOREIGN KEY IF EXISTS FK_pressure_score_history_project_id,
DROP FOREIGN KEY IF EXISTS FKg4rjfhpv8yxgn8c1x2q3k0v8m;

-- Add new constraint with CASCADE DELETE
ALTER TABLE pressure_score_history 
ADD CONSTRAINT FK_pressure_score_history_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- =====================================================
-- Step 3: Verify the changes
-- =====================================================

-- Check that CASCADE DELETE has been applied correctly
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME,
    DELETE_RULE
FROM 
    information_schema.REFERENTIAL_CONSTRAINTS rc
    JOIN information_schema.KEY_COLUMN_USAGE kcu ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
WHERE 
    rc.REFERENCED_TABLE_NAME = 'projects'
    AND rc.CONSTRAINT_SCHEMA = DATABASE()
    AND rc.DELETE_RULE = 'CASCADE';

-- =====================================================
-- Step 4: Test cascade delete (OPTIONAL - USE WITH CAUTION)
-- =====================================================

-- CAUTION: Only run this on test data, not production!
-- This will delete a project and all related data
-- 
-- -- Create a test project first
-- INSERT INTO projects (name, description, access_code, max_members, instructor_id, created_at, updated_at)
-- VALUES ('TEST_PROJECT_DELETE', 'Test project for cascade delete', 'TESTDEL1', 5, 1, NOW(), NOW());
-- 
-- -- Get the test project ID
-- SET @test_project_id = LAST_INSERT_ID();
-- 
-- -- Add some test data to related tables
-- INSERT INTO project_students (project_id, student_id, created_at, updated_at)
-- VALUES (@test_project_id, 2, NOW(), NOW());
-- 
-- -- Now delete the test project - should cascade delete all related records
-- DELETE FROM projects WHERE id = @test_project_id;
-- 
-- -- Verify that related records were also deleted
-- SELECT COUNT(*) as remaining_project_students FROM project_students WHERE project_id = @test_project_id;

-- =====================================================
-- Additional Notes:
-- =====================================================

-- 1. Always backup your database before running these commands
-- 2. Test on a development environment first
-- 3. The constraint names might be different in your database - check with the first query
-- 4. Some tables might have additional foreign keys that also need CASCADE DELETE
-- 5. Consider the implications of CASCADE DELETE on data integrity

-- =====================================================
-- Rollback Script (if needed):
-- =====================================================

-- If you need to rollback these changes, use RESTRICT instead of CASCADE:
-- 
-- ALTER TABLE project_students 
-- DROP FOREIGN KEY FK_project_students_project_id;
-- ALTER TABLE project_students 
-- ADD CONSTRAINT FK_project_students_project_id 
-- FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT;
-- 
-- (Repeat for all other tables...)
