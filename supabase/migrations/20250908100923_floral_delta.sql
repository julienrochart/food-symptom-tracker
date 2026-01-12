/*
  # Create tables for HealthTracker app

  1. New Tables
    - `food_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `food_name` (text, name of the food consumed)
      - `meal_type` (text, breakfast/lunch/dinner/snack)
      - `quantity` (text, quantity consumed)
      - `notes` (text, optional notes)
      - `eaten_at` (timestamptz, when the food was consumed)
      - `created_at` (timestamptz, when the record was created)
    - `symptom_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `symptom_name` (text, name of the symptom)
      - `severity` (integer, severity level 1-10)
      - `notes` (text, optional notes)
      - `occurred_at` (timestamptz, when the symptom occurred)
      - `created_at` (timestamptz, when the record was created)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create food_entries table
CREATE TABLE IF NOT EXISTS food_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  quantity text NOT NULL,
  notes text,
  eaten_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create symptom_entries table
CREATE TABLE IF NOT EXISTS symptom_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_name text NOT NULL,
  severity integer NOT NULL CHECK (severity >= 1 AND severity <= 10),
  notes text,
  occurred_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for food_entries
CREATE POLICY "Users can manage their own food entries"
  ON food_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for symptom_entries
CREATE POLICY "Users can manage their own symptom entries"
  ON symptom_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_entries_user_eaten_at ON food_entries(user_id, eaten_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_entries_user_occurred_at ON symptom_entries(user_id, occurred_at DESC);