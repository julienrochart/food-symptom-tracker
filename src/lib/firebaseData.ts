import { FoodEntry, SymptomEntry } from '../types';
import { UserProfile, CustomFood } from '../types';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  setDoc,
  getDoc
} from 'firebase/firestore';

// Food Entries
export const saveFoodEntry = async (entry: Omit<FoodEntry, 'id' | 'created_at'>): Promise<FoodEntry> => {
  try {
    const docRef = await addDoc(collection(db, 'food_entries'), {
      ...entry,
      created_at: new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      ...entry,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error saving food entry:', error);
    throw new Error('Failed to save food entry');
  }
};

export const getFoodEntries = async (userId: string): Promise<FoodEntry[]> => {
  try {
    const q = query(
      collection(db, 'food_entries'),
      where('user_id', '==', userId),
      orderBy('eaten_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const entries: FoodEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      entries.push({
        id: doc.id,
        ...doc.data()
      } as FoodEntry);
    });
    
    return entries;
  } catch (error) {
    console.error('Error fetching food entries:', error);
    throw new Error('Failed to fetch food entries');
  }
};

export const deleteFoodEntry = async (entryId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'food_entries', entryId));
  } catch (error) {
    console.error('Error deleting food entry:', error);
    throw new Error('Failed to delete food entry');
  }
};

// Symptom Entries
export const saveSymptomEntry = async (entry: Omit<SymptomEntry, 'id' | 'created_at'>): Promise<SymptomEntry> => {
  try {
    const docRef = await addDoc(collection(db, 'symptom_entries'), {
      ...entry,
      created_at: new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      ...entry,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error saving symptom entry:', error);
    throw new Error('Failed to save symptom entry');
  }
};

export const getSymptomEntries = async (userId: string): Promise<SymptomEntry[]> => {
  try {
    const q = query(
      collection(db, 'symptom_entries'),
      where('user_id', '==', userId),
      orderBy('occurred_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const entries: SymptomEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      entries.push({
        id: doc.id,
        ...doc.data()
      } as SymptomEntry);
    });
    
    return entries;
  } catch (error) {
    console.error('Error fetching symptom entries:', error);
    throw new Error('Failed to fetch symptom entries');
  }
};

export const deleteSymptomEntry = async (entryId: string): Promise<void> => {
  try {
    if (!entryId) {
      throw new Error('Entry ID is required');
    }
    await deleteDoc(doc(db, 'symptom_entries', entryId));
  } catch (error) {
    console.error('Error deleting symptom entry:', error);
    throw new Error('Failed to delete symptom entry');
  }
};

// User Profile
export const saveUserProfile = async (profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
  try {
    console.log('Attempting to save profile:', profile);
    
    const profileRef = doc(db, 'user_profiles', profile.user_id);
    const profileData = {
      ...profile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Profile data to save:', profileData);
    
    await setDoc(profileRef, profileData, { merge: true });
    
    console.log('Profile saved successfully');
    
    return {
      id: profile.user_id,
      ...profileData
    };
  } catch (error) {
    console.error('Detailed error saving user profile:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw new Error('Failed to save user profile');
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profileRef = doc(db, 'user_profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return {
        id: profileSnap.id,
        ...profileSnap.data()
      } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Custom Foods
export const saveCustomFood = async (customFood: Omit<CustomFood, 'id' | 'created_at'>): Promise<CustomFood> => {
  try {
    const docRef = await addDoc(collection(db, 'custom_foods'), {
      ...customFood,
      created_at: new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      ...customFood,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error saving custom food:', error);
    throw new Error('Failed to save custom food');
  }
};

export const getCustomFoods = async (userId: string): Promise<CustomFood[]> => {
  try {
    const q = query(
      collection(db, 'custom_foods'),
      where('user_id', '==', userId),
      orderBy('food_name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const customFoods: CustomFood[] = [];
    
    querySnapshot.forEach((doc) => {
      customFoods.push({
        id: doc.id,
        ...doc.data()
      } as CustomFood);
    });
    
    return customFoods;
  } catch (error) {
    console.error('Error fetching custom foods:', error);
    return [];
  }
};

export const deleteCustomFood = async (foodId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'custom_foods', foodId));
  } catch (error) {
    console.error('Error deleting custom food:', error);
    throw new Error('Failed to delete custom food');
  }
};

// Delete all user data
export const deleteAllUserData = async (userId: string): Promise<void> => {
  try {
    // Get all user's data
    const [foodEntries, symptomEntries, customFoods] = await Promise.all([
      getFoodEntries(userId),
      getSymptomEntries(userId),
      getCustomFoods(userId)
    ]);

    // Delete all food entries
    const foodDeletions = foodEntries.map(entry => 
      entry.id ? deleteDoc(doc(db, 'food_entries', entry.id)) : Promise.resolve()
    );

    // Delete all symptom entries
    const symptomDeletions = symptomEntries.map(entry => 
      entry.id ? deleteDoc(doc(db, 'symptom_entries', entry.id)) : Promise.resolve()
    );

    // Delete all custom foods
    const customFoodDeletions = customFoods.map(food => 
      food.id ? deleteDoc(doc(db, 'custom_foods', food.id)) : Promise.resolve()
    );

    // Delete user profile
    const profileDeletion = deleteDoc(doc(db, 'user_profiles', userId));

    // Execute all deletions
    await Promise.all([
      ...foodDeletions,
      ...symptomDeletions,
      ...customFoodDeletions,
      profileDeletion
    ]);

    console.log('All user data deleted successfully');
  } catch (error) {
    console.error('Error deleting all user data:', error);
    throw new Error('Failed to delete all user data');
  }
};