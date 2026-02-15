import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "./screens/DashboardScreen";
import WorkoutLogScreen from "./screens/WorkoutLogV2";
import WorkoutHistoryScreen from "./screens/WorkoutHistoryScreen";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Workout Log" component={WorkoutLogScreen} />
        <Stack.Screen name="Workout History" component={WorkoutHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// import WorkoutLogV2 from "./screens/WorkoutLogV2";

// export default function App() {
//   return <WorkoutLogV2 />;
// }
