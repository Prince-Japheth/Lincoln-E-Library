-- Create videos table for storing video links
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  link text not null,
  created_at timestamp with time zone default now(),
  course_id uuid references courses(id) on delete set null
); 