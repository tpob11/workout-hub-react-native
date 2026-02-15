import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

// ========================================================

type SetEntry = { id: string; reps: number; weight: number };
type ExerciseLog = { id: string; name: string; sets: SetEntry[] };
type WorkoutSession = {id: string; date: string; exercises: ExerciseLog[]};

// ========================================================

const makeId = () => `${Date.now().toString()}-${Math.random().toString(16).slice(2)}`;

export default function WorkoutLogV2() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [exerciseName, setExerciseName] = useState("");
  const [activeExercise, setActiveExercise] = useState<ExerciseLog | null>(null);
  const [completedExercises, setCompletedExercises] = useState<ExerciseLog[]>([]);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);

// ========================================================

  const normalizeHistory = (raw: any): WorkoutSession[] =>
  {
    if (!Array.isArray(raw)) return [];

    return raw.map((session: any) => 
    ({
      id: typeof session?.id === "string" ? session.id : makeId(),
      date: typeof session?.date === "string" ? session.date : new Date().toISOString(),
      exercises: Array.isArray(session?.exercises)
      ? session.exercises.map((ex: any) => ({
          id: typeof ex?.id === "string" ? ex.id : makeId(),
          name: typeof ex?.name === "string" ? ex.name : "Unknown Exercise",
          sets: Array.isArray(ex?.sets)
          ? ex.sets.map((s: any) => ({
              id: typeof s?.id === "string" ? s.id : makeId(),
              reps: Number.isFinite(Number(s?.reps)) ? Number(s.reps) : 0,
              weight: Number.isFinite(Number(s?.weight)) ? Number(s.weight) : 0,
          }))
          : [],
      }))
      : [],
    }))
  }

// ========================================================

  const formatExerciseName = (name: string) => 
  {
    return name
    .trim()
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  };

// ========================================================

  useEffect(() => 
  {
   async function getWorkoutSession() 
   {
      try {
        const savedHistory = await AsyncStorage.getItem("workout_history");
          if (savedHistory) 
          {
            const parsedJSON = JSON.parse(savedHistory);
            const normalized = normalizeHistory(parsedJSON);
            setWorkoutHistory(normalized);

            await AsyncStorage.setItem("workout_history", JSON.stringify(normalized));
          }
        } catch (err) {
           console.error(err);
        }
    }

    getWorkoutSession();

  }, []);

// ========================================================

  const finishWorkout = async () => 
  {
    if (completedExercises.length === 0) return;

    const newSession: WorkoutSession = {
      id: makeId(),           
      date: new Date().toISOString(),         
      exercises: completedExercises,     
    };

    try {

      const saved = await AsyncStorage.getItem("workout_history");
      const parsed = saved ? JSON.parse(saved) : [];
      const normalized = normalizeHistory(parsed);

      const updatedHistory = [...normalized, newSession];

      await AsyncStorage.setItem("workout_history", JSON.stringify(updatedHistory));
      setWorkoutHistory(updatedHistory);

      setCompletedExercises([]);

      setActiveExercise(null);
      setEditingSetId(null);

      navigation.navigate("Workout History");
    } catch (err) {
      console.error("finishWorkout error: ", err);
    }

  }
  

// ========================================================

  const startExercise = () => 
  {
    const name = formatExerciseName(exerciseName);
    if (!name) return;

    const startNewExercise: ExerciseLog = {
        id: makeId(),
        name,
        sets: [],
    };

    setActiveExercise(startNewExercise);
    setExerciseName("");
  };

// ========================================================

  const addSet = () => 
  {
    if (!activeExercise) return;

    const r = Number(reps.trim());
    const w = Number(weight.trim());
    if (!Number.isFinite(r) || !Number.isFinite(w) || r <= 0 || w < 0) return;

    const newSet: SetEntry = {
      id: makeId(),
      reps: r,
      weight: w,
    };

    setActiveExercise({
      ...activeExercise,
      sets: [...activeExercise.sets, newSet],
    });

    setReps("");
    setWeight("");

  };

  // ========================================================

  const finishExercise = () => 
  {
    if (!activeExercise) return;

    setCompletedExercises([...completedExercises, activeExercise])
    setActiveExercise(null);
    setReps("");
    setWeight("");

  }

  // ========================================================

  const deleteSetFromActive = (setId: string) => 
  {
    if (!activeExercise) return;

    const updatedSets = activeExercise.sets.filter(s => s.id !== setId);

    if (editingSetId === setId)
    {
      setEditingSetId(null);
      setEditReps("");
      setEditWeight("");
    }

    setActiveExercise({
      ...activeExercise,
      sets: updatedSets,
    });
  };

  // ========================================================

  const startEditingSet = (setId: string) => 
  {
    if (!activeExercise) return;

    const setToEdit = activeExercise.sets.find(s => s.id === setId);
    if (!setToEdit) return;

    setEditReps(String(setToEdit.reps));
    setEditWeight(String(setToEdit.weight));
    setEditingSetId(setId);
  }

  // ========================================================

  const saveEditedSet = (setId: string) => 
  {
   if (!activeExercise) return;

   const r = Number(editReps.trim());
   const w = Number(editWeight.trim());
   if (!Number.isFinite(r) || !Number.isFinite(w) || r <= 0 || w < 0) return;

   const updatedSets = activeExercise.sets.map((set) => 
      set.id === setId ? {...set, reps: r, weight: w} : set
   );

   setActiveExercise({...activeExercise, sets: updatedSets});
   setEditingSetId(null);
   setEditReps("");
   setEditWeight("");
};

// ========================================================

const editCompletedExercise = (exerciseIndex: number) => 
{
  if (activeExercise) return;

  const completedEdit = completedExercises[exerciseIndex];

  const newCompletedExercises = completedExercises.filter((_, index) => {
      return index !== exerciseIndex;
    });

  setCompletedExercises(newCompletedExercises);
  setActiveExercise(completedEdit);

}
  
// ========================================================

  return (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Workout Log</Text>

    {/* Start Exercise */}
    {!activeExercise && (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Start Exercise</Text>

        <TextInput
          style={styles.input}
          placeholder="Exercise name (e.g., Bench Press)"
          value={exerciseName}
          onChangeText={setExerciseName}
        />

        <Button title="Start Exercise" onPress={startExercise} />
      </View>
    )}

    {/* Active Exercise */}
    {activeExercise && (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Active Exercise</Text>
        <Text style={styles.exerciseName}>{activeExercise.name}</Text>

        <TextInput
          style={styles.input}
          placeholder="Reps"
          inputMode="numeric"
          value={reps}
          onChangeText={setReps}
        />

        <TextInput
          style={styles.input}
          placeholder="Weight (lbs)"
          inputMode="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        <Button
          title="Add Set"
          onPress={addSet}
          disabled={!reps.trim() || !weight.trim()}
        />

        <View style={{ marginTop: 12 }}>
          {activeExercise.sets.map((s, sIdx) => (
            <View key={s.id} style={styles.setRow}>
              {editingSetId === s.id ? (
                <>
                  <TextInput
                    value={editReps}
                    onChangeText={setEditReps}
                    style={styles.inputSmall}
                  />

                  <TextInput
                    value={editWeight}
                    onChangeText={setEditWeight}
                    style={styles.inputSmall}
                  />

                  <Button title="Save" onPress={() => saveEditedSet(s.id)} />
                  <Button title="Cancel" onPress={() => setEditingSetId(null)} />
                </>
              ) : (
                <>
                  <Text style={styles.small}>
                    Set {sIdx + 1}: {s.reps} reps @ {s.weight} lbs
                  </Text>

                  <Button title="Edit" onPress={() => startEditingSet(s.id)} />
                  <Button title="Delete" onPress={() => deleteSetFromActive(s.id)} />
                </>
              )}
            </View>
          ))}

        </View>

        <View style={{ marginTop: 16 }}>
          <Button title="Finish Exercise" onPress={finishExercise}/>
        </View>
      </View>
    )}

    {/* Completed Exercises */}
    <Text style={styles.sectionTitle}>Completed Exercises</Text>

    {completedExercises.length === 0 ? (
      <Text style={styles.small}>None yet.</Text>
  ) : (
    completedExercises.map((ex, idx) => (
    <View key={ex.id} style={styles.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={styles.exerciseName}>{ex.name}</Text>

        <Button
          title="Edit"
          onPress={() => editCompletedExercise(idx)}
          disabled={!!activeExercise}
        />
      </View>

            {ex.sets.map((s, sIdx) => (
            <Text key={s.id} style={styles.small}>
                Set {sIdx + 1}: {s.reps} reps @ {s.weight} lbs
            </Text>
           ))}
        </View>
      ))
    )}

    {completedExercises.length > 0 && (
  <View style={{ marginTop: 16 }}>
    <Button title="Finish Workout" onPress={finishWorkout} />
  </View>
)}


  </ScrollView>
);

}

const styles = StyleSheet.create({
  
  container: 
  { 
    padding: 20, 
    paddingBottom: 80 
  },

  title: 
  { 
    fontSize: 24, 
    fontWeight: "700", 
    marginBottom: 12, 
    textAlign: "center" 
  },

  input: 
  { backgroundColor: "#f0f0f0", 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 12 
  },

  inputSmall:
  {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
    width: 70,
  },
  
  list: 
  { 
    marginTop: 16 
  },
  
  card: 
  { 
    padding: 12, 
    borderWidth: 1, 
    borderColor: "#ddd", 
    borderRadius: 10, 
    marginBottom: 10 
  },

  exerciseName: 
  { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#000000f5" 
  },

  small: 
  { 
    marginTop: 4, 
    color: "#666" 
  },

  sectionTitle: 
  {
  fontSize: 18,
  fontWeight: "700",
  marginTop: 24,
  marginBottom: 8,
  },

  setRow:
  {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  }

});
