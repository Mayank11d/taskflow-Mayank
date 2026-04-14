-- Password is: password123 (bcrypt cost 12)
INSERT INTO users (id, name, email, password)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Test User',
  'test@example.com',
  '$2b$12$KIXyFTqmCVlnMOOoSi5MiemGMXpAJTJQWgH8d5e7vM4k7y3M0MGCS'
) ON CONFLICT DO NOTHING;

INSERT INTO projects (id, name, description, owner_id)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Demo Project',
  'Seeded demo project for testing',
  '11111111-1111-1111-1111-111111111111'
) ON CONFLICT DO NOTHING;

INSERT INTO tasks (id, title, status, priority, project_id, assignee_id)
VALUES
  (
    '33333333-3333-3333-3333-333333333333',
    'First Task - Todo',
    'todo',
    'high',
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Second Task - In Progress',
    'in_progress',
    'medium',
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Third Task - Done',
    'done',
    'low',
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111'
  )
ON CONFLICT DO NOTHING;
