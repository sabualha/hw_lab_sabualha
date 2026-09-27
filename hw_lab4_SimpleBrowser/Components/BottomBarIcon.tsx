import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomBarIconProps } from "../types";

export default function BottomBarIcon({ iconName, size, onPress }: BottomBarIconProps) {
  return (
    <TouchableOpacity style={styles.iconButton} onPress={onPress}>
      <Ionicons name={iconName as any} size={size} color="#333" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 4,
  },
});