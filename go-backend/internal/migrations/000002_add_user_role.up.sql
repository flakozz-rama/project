-- 000002_add_user_role.up.sql
-- Add role column to users table for RBAC

ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
