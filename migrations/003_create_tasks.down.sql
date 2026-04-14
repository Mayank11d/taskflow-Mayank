DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_assignee;
DROP INDEX IF EXISTS idx_tasks_project;
DROP TABLE IF EXISTS tasks;
DROP TYPE IF EXISTS task_priority;
DROP TYPE IF EXISTS task_status;
