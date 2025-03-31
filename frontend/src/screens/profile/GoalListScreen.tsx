import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, ProfileStackParamList } from "../../types";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";
import { ProfileScreenProps } from "../../types";
import { useGoalList } from "../../hooks/useGoalList";

type GoalListScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  "GoalList"
>;

interface GoalListScreenProps {
  navigation: GoalListScreenNavigationProp;
}

export default function GoalListScreen({ navigation }: GoalListScreenProps) {
  const { data: goalData, isLoading, error } = useGoalList();

  const handleGoalPress = () => {
    if (goalData) {
      navigation.navigate("GoalDetail", { 
        goal: {
          id: "1",
          title: goalData.title,
          description: "목표 설명",
          target: goalData.goalamount,
          current: goalData.currentamount,
          deadline: goalData.goaldate,
          icon: "target",
        }
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="목표 관리" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>목표를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="목표 관리" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="목표 관리" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content}>
        {goalData && (
          <Pressable
            style={styles.goalItem}
            onPress={handleGoalPress}
          >
            <Text style={styles.goalTitle}>{goalData.title}</Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${(goalData.currentamount / goalData.goalamount) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalAmount}>
                {goalData.currentamount.toLocaleString()}원 /{" "}
                {goalData.goalamount.toLocaleString()}원
              </Text>
              <Text style={styles.goalDeadline}>목표일: {goalData.goaldate}</Text>
            </View>
          </Pressable>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: "center",
  },
});
