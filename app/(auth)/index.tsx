import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/theme";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <View style={styles.mark}>
          <Ionicons name="sparkles" size={46} color={Colors.panel} />
        </View>
        <Text style={styles.title}>Money, made clearer.</Text>
        <Text style={styles.copy}>Meet AI Finance Assistant. Understand your spending, make a plan, and feel more confident about your money.</Text>
      </View>
      <View style={styles.actions}>
        <Button label="Get started" onPress={() => router.replace("/(tabs)")} />
        <Button label="Continue as guest" variant="secondary" onPress={() => router.replace("/(tabs)")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: Colors.paper,
    padding: 24
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    gap: 18
  },
  mark: {
    width: 94,
    height: 94,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: Colors.brand
  },
  title: {
    color: Colors.ink,
    fontSize: 52,
    fontWeight: "900"
  },
  copy: {
    maxWidth: 330,
    color: Colors.muted,
    fontSize: 18,
    lineHeight: 27
  },
  actions: {
    gap: 12
  }
});
