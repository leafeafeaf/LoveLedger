import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, ProfileStackParamList, Goal } from "../../types";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";
import { ProfileScreenProps } from "../../types";

type GoalListScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  "GoalList"
>;

interface GoalListScreenProps {
  navigation: GoalListScreenNavigationProp;
}

const goals: Goal[] = [
  {
    id: "1",
    title: "여행 자금",
    description: "일본 여행을 위한 자금",
    target: 2000000,
    current: 1500000,
    deadline: "2024-12-31",
    icon: "airplane",
  },
  {
    id: "2",
    title: "결혼 자금",
    description: "결혼 준비를 위한 자금",
    target: 30000000,
    current: 10000000,
    deadline: "2025-06-30",
    icon: "heart",
  },
];

export default function GoalListScreen({ navigation }: GoalListScreenProps) {
  const handleGoalPress = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      navigation.navigate("GoalDetail", { goal });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="목표 관리" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content}>
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            style={styles.goalItem}
            onPress={() => handleGoalPress(goal.id)}
          >
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${(goal.current / goal.target) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalAmount}>
                {goal.current.toLocaleString()}원 /{" "}
                {goal.target.toLocaleString()}원
              </Text>
              <Text style={styles.goalDeadline}>목표일: {goal.deadline}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  goalItem: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 12,
  },
  progressContainer: {
    height: 8,
    backgroundColor: theme.colors.textLight,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  goalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalAmount: {
    fontSize: 14,
    color: theme.colors.text,
  },
  goalDeadline: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
});
