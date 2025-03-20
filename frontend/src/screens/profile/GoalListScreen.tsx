import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/navigation";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";

type GoalListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "GoalList"
>;

interface GoalListScreenProps {
  navigation: GoalListScreenNavigationProp;
}

interface Goal {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

const goals: Goal[] = [
  {
    id: 1,
    title: "여행 자금",
    targetAmount: 2000000,
    currentAmount: 1500000,
    deadline: "2024-12-31",
  },
  {
    id: 2,
    title: "결혼 자금",
    targetAmount: 30000000,
    currentAmount: 10000000,
    deadline: "2025-06-30",
  },
];

export default function GoalListScreen({ navigation }: GoalListScreenProps) {
  const handleGoalPress = (goalId: number) => {
    navigation.navigate("GoalDetail", { goalId });
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
                    width: `${(goal.currentAmount / goal.targetAmount) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalAmount}>
                {goal.currentAmount.toLocaleString()}원 /{" "}
                {goal.targetAmount.toLocaleString()}원
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
