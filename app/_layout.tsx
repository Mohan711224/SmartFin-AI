import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { FinanceProvider } from "@/hooks/useFinance";
import { TasksProvider } from "@/hooks/useTasks";

export default function RootLayout() {
  // Static web exports can briefly render icon glyphs before the font is ready.
  // Load the icon font at the app root so every route uses the bundled font.
  const [iconsLoaded] = useFonts(Ionicons.font);

  if (!iconsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TasksProvider>
          <FinanceProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: Colors.paper },
                headerShadowVisible: false,
                headerTitleStyle: { color: Colors.ink, fontWeight: "800" },
                contentStyle: { backgroundColor: Colors.paper }
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="create-task/index" options={{ title: "New task", presentation: "modal" }} />
              <Stack.Screen name="task/[id]" options={{ title: "Task details" }} />
              <Stack.Screen name="add-transaction" options={{ title: "Add transaction", presentation: "modal" }} />
              <Stack.Screen name="transactions" options={{ title: "Transactions" }} />
              <Stack.Screen name="import-transactions" options={{ title: "Import transactions" }} />
              <Stack.Screen name="upi-payment" options={{ title: "Pay with UPI" }} />
            </Stack>
          </FinanceProvider>
        </TasksProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
