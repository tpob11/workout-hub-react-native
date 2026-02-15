import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "workout_history";

export type SetEntry = { reps: string; weight: string };
export type ExerciseLog = { exercise: string; sets: SetEntry[] };
export type WorkoutSession = { date: string; exercises: ExerciseLog[] };

export async function getHistory(): Promise<WorkoutSession[]> {
    try 
    {
        const saved = await AsyncStorage.getItem(KEY);
        return saved ? (JSON.parse(saved) as WorkoutSession[]) : [];
    } catch (e) 
    {
        console.error("getHistory failed:", e);
        return [];
    }
}