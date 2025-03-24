import React, { useState, FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";
import BookCard from "../../components/common/BookCard";
import { BookItem } from "../../types";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainTabParamList, RootStackParamList } from "../../types";

// Composite navigation prop 타입 정의
type LibraryScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Library">,
  NativeStackNavigationProp<RootStackParamList>
>;

type TabButtonProps = {
  title: string;
  isActive: boolean;
  onPress: () => void;
};

const LibraryScreen: FC = () => {
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<"diaries" | "stories">("diaries");

  const mockDiaries: BookItem[] = [
    {
      id: "1",
      title: "Our First Date",
      date: "2024-03-13",
      type: "diary",
      mood: "happy",
    },
    {
      id: "2",
      title: "Weekend Getaway",
      date: "2024-03-12",
      type: "diary",
      mood: "excited",
    },
    {
      id: "3",
      title: "Coffee Shop Meeting",
      date: "2024-03-11",
      type: "diary",
      mood: "peaceful",
    },
  ];

  const mockStories: BookItem[] = [
    {
      id: "1",
      title: "Our Love Story",
      date: "2024-03-13",
      type: "story",
      theme: "romance",
    },
    {
      id: "2",
      title: "Future Dreams",
      date: "2024-03-10",
      type: "story",
      theme: "fantasy",
    },
  ];

  const TabButton = ({ title, isActive, onPress }: TabButtonProps) => (
    <Pressable
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Library"
        showBack={false}
        showClose={false}
        rightElement={
          <Pressable style={styles.searchButton}>
            <MaterialCommunityIcons
              name="book-search"
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
        }
      />

      <View style={styles.tabContainer}>
        <TabButton
          title="Diaries"
          isActive={activeTab === "diaries"}
          onPress={() => setActiveTab("diaries")}
        />
        <TabButton
          title="Stories"
          isActive={activeTab === "stories"}
          onPress={() => setActiveTab("stories")}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.shelfContainer}>
          {activeTab === "diaries"
            ? mockDiaries.map((item) => (
                <BookCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    navigation.navigate("DailyDetail", {
                      selectedDate: new Date(item.date),
                      transactions: [],
                    })
                  }
                />
              ))
            : mockStories.map((item) => (
                <BookCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    navigation.navigate("StoryDetail", { id: item.id })
                  }
                />
              ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchButton: {
    padding: theme.spacing.sm,
  },
  tabContainer: {
    flexDirection: "row",
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    ...theme.shadows.small,
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textLight,
  },
  activeTabText: {
    color: theme.colors.white,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  shelfContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
});

export default LibraryScreen;
