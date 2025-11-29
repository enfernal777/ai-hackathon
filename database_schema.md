# Supabase Database Schema

Based on your project's TypeScript interfaces, here is a simple and effective database schema for Supabase (PostgreSQL).

## Overview

We will use 4 main tables to map your data:

1.  **employees**: Stores employee profiles, including their stats, job title, and skill profiles.
2.  **admins**: Stores admin profiles.
3.  **scenarios**: Stores the training scenarios, including the rubric (as JSON).
4.  **assessments**: Stores the history of completed scenarios by employees.
5.  **goals**: Stores employee goals.

## SQL Setup

You can run the following SQL in your Supabase **SQL Editor** to create the tables.

```sql
-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Admins Table
create table public.admins (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Employees Table
create table public.employees (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  username text unique,
  employee_id text unique,
  password_hash text,
  job_title text default 'Employee',
  skills_profile jsonb default '{}'::jsonb, -- Stores { "Empathy": 80, "Active Listening": 70 }
  ranking int default 0,
  win_rate float default 0.0,
  streak int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Scenarios Table
create table public.scenarios (
  id uuid primary key default uuid_generate_v4(),
  skill text not null,
  difficulty text check (difficulty in ('Easy', 'Normal', 'Hard')) not null,
  scenario_text text not null,
  task text not null,
  rubric jsonb not null, -- Stores { "criteria": [...], "ideal_response_keywords": [...] }
  hint text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Assessments Table (History)
create table public.assessments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.employees(id) on delete cascade not null,
  scenario_id uuid references public.scenarios(id) on delete set null,
  score int not null,
  feedback text,
  difficulty text, -- Store difficulty at time of assessment in case scenario changes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Goals Table
create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.employees(id) on delete cascade not null,
  description text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Typescript Interface Mapping

*   **Employee**: Maps to `employees` table. `history` is derived by querying `assessments` for the user.
*   **Admin**: Maps to `admins` table.
*   **Scenario**: Maps to `scenarios` table.
*   **HistoryItem**: Maps to a row in `assessments`.
*   **Goal**: Maps to `goals` table.

## Next Steps

1.  Go to your Supabase Project Dashboard.
2.  Open the **SQL Editor**.
3.  Paste the SQL code above and click **Run**.
4.  (Optional) If you want to use Supabase Auth for login, you might link the `users` table to `auth.users` using a trigger, but for simplicity, this schema works as a standalone application data structure.
