CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name TEXT,
  department TEXT,
  year INT,
  experience_years FLOAT DEFAULT 0,
  technical_skills TEXT[] DEFAULT '{}',
  soft_skills TEXT[] DEFAULT '{}',
  readiness_score FLOAT DEFAULT 0,
  suggested_roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  name TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  description TEXT
);
