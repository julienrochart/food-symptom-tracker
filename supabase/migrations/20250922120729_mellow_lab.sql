/*
  # Create user profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date_of_birth` (date, user's birth date)
      - `sex` (text, user's biological sex)
      - `height_cm` (integer, user's height in centimeters)
      - `weight_kg` (decimal, user's weight in kilograms)
      - `created_at` (timestamptz, when the record was created)
      - `updated_at` (timestamptz, when the record was last updated)

  2. Security
    - Enable RLS on user_profiles table
    - Add policy for authenticated users to manage their own profile
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  date_of_birth date,
  sex text CHECK (sex IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm integer CHECK (height_cm > 0 AND height_cm < 300),
  weight_kg decimal(5,2) CHECK (weight_kg > 0 AND weight_kg < 1000),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for user_profiles
CREATE POLICY "Users can manage their own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);