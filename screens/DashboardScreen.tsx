import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export default function DashboardScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Tanner’s app</Text>
      {/* <Text style={styles.sub}>This is your command center.</Text> */}

      <View style={styles.btn}>
        <Button
          title="Go to Workout Log"
          onPress={() => navigation.navigate("Workout Log")}
        />
      </View>

      <View style={styles.btn}>
        <Button
          title="View Workout History"
          onPress={() => navigation.navigate("Workout History")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 8, fontWeight: "700" },
  sub: { marginBottom: 16 },
  btn: { width: "100%", marginTop: 10 },
});
