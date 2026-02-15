import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SetEntry = { reps: string; weight: string };
type ExerciseLog = { name: string; sets: SetEntry[] };
type WorkoutSession = { id: string; date: string; exercises: ExerciseLog[] };

export default function WorkoutHistoryScreen() {
  const [history, setHistory] = useState<WorkoutSession[]>([]);

  useEffect(() => 
    {
    const loadHistory = async () => 
      {
      try {
        const saved = await AsyncStorage.getItem("workout_history");

        if (saved)
        {
          const parsedJSON = JSON.parse(saved);
          setHistory(parsedJSON);
        } else {
          setHistory([]);
        }

      } catch (err) {
        console.error(err);
      }
    };

    loadHistory();
  }, []);

  // ========================================================

  // const clearHistory = async () => 
  // {
  //    setHistory([]);
  // };

  // ========================================================

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Workout History</Text>

      {/* <Button title="Clear History" onPress={clearHistory} /> */}

      {history.length === 0 ? (
        <Text style={styles.empty}>No sessions yet.</Text>
      ) : (
        history
        .sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
          .map((session, sIdx) => (
            <View key={session.id ?? String(sIdx)} style={styles.sessionCard}>
              <Text style={styles.sessionTitle}>
                {new Date(session.date).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>

              {session.exercises.map((ex, eIdx) => (
                <View key={`${session.id}-${eIdx}`} style={styles.exerciseBlock}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>

                  {ex.sets.length === 0 ? (
                    <Text style={styles.setLine}>No sets</Text>
                  ) : (
                    ex.sets.map((s, sIdx) => (
                      <Text key={`${session.id}-${eIdx}-${sIdx}`} style={styles.setLine}>
                        Set {sIdx + 1}: {s.reps} reps @ {s.weight} lbs
                      </Text>
                    ))
                  )}
                </View>
              ))}
            </View>
          ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 80 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  empty: { marginTop: 20, textAlign: "center" },

  sessionCard: {
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
  },
  sessionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  exerciseBlock: { marginTop: 10 },
  exerciseName: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  setLine: { fontSize: 14, marginLeft: 8 },
});



