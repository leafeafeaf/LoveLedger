import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { BookItem } from "../../types";

type BookCardProps = {
  item: BookItem;
  onPress: () => void;
};

export default function BookCard({ item, onPress }: BookCardProps) {
  const getIconName = () => {
    if (item.type === "diary") {
      switch (item.mood) {
        case "happy":
          return "emoticon-happy";
        case "excited":
          return "emoticon-excited";
        case "peaceful":
          return "emoticon-cool";
        default:
          return "notebook";
      }
    }
    return "book-open-variant";
  };

  const getCardColor = () => {
    if (item.type === "diary") {
      switch (item.mood) {
        case "happy":
          return "#FFE5A5";
        case "excited":
          return "#FFD6D6";
        case "peaceful":
          return "#E5F1FF";
        default:
          return theme.colors.secondary;
      }
    }
    return theme.colors.accent;
  };

  return (
    <Pressable
      style={[styles.card, { backgroundColor: getCardColor() }]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={getIconName()}
          size={24}
          color={theme.colors.primary}
        />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.date}>
        {new Date(item.date).toLocaleDateString()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
    height: 160,
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.small,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  date: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
});
