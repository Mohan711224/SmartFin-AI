import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { Colors } from "@/constants/theme";

type ButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
  disabled?: boolean;
};

export function Button({ label, onPress, variant = "primary", style, disabled = false }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style
      ]}
    >
      <Text style={[styles.label, variant !== "primary" && styles.darkLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 18
  },
  primary: {
    backgroundColor: Colors.brand
  },
  secondary: {
    backgroundColor: Colors.panel,
    borderColor: Colors.line,
    borderWidth: 1
  },
  ghost: {
    backgroundColor: "transparent"
  },
  pressed: {
    opacity: 0.75
  },
  disabled: {
    opacity: 0.45
  },
  label: {
    color: Colors.panel,
    fontSize: 16,
    fontWeight: "700"
  },
  darkLabel: {
    color: Colors.ink
  }
});
