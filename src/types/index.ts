export interface FoodEntry {
  id?: string;
  user_id: string;
  food_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'morning_snack' | 'afternoon_snack' | 'evening_snack';
  quantity: number;
  notes?: string;
  eaten_at: string;
  created_at: string;
}

export interface SymptomEntry {
  id?: string;
  user_id: string;
  symptom_name: string;
  severity: number; // 1-10 scale
  notes?: string;
  occurred_at: string;
  created_at: string;
}

export interface UserProfile {
  id?: string;
  user_id: string;
  date_of_birth?: string;
  sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height_cm?: number;
  weight_kg?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomFood {
  id?: string;
  user_id: string;
  food_name: string;
  category: string;
  is_trigger?: boolean;
  notes?: string;
  created_at?: string;
}