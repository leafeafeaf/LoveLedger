import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { StoryScreenProps } from "../../types";
import Header from "../../components/common/Header";
import { useSeriesCreate } from "../../hooks/useSeriesCreate";
import { useSelector, useDispatch } from "react-redux";
import { fetchFictionListStart, fetchFictionListSuccess, fetchFictionListFailure } from "../../store/contentSlice";
import { axiosInstance } from "../../api/axios";
import { useSeriesList } from "../../hooks/useSeriesList";
import { useQueryClient } from "@tanstack/react-query";

export default function SeriesSelectionScreen({
  navigation,
  route,
}: StoryScreenProps<"SeriesSelection">) {
  const { settings } = route.params || {
    settings: { themeStyle: "", period: "" },
  };
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [newSeriesName, setNewSeriesName] = useState("");
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  
  const { mutate: createSeries, isPending } = useSeriesCreate();
  const { data: series = [], isLoading: isSeriesLoading } = useSeriesList();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  
  const handleNext = () => {
    if (mode === "new") {
      if (!newSeriesName.trim()) {
        Alert.alert("알림", "시리즈 이름을 입력해주세요.");
        return;
      }
      //TODO 시리즈 ID를 알 방법이 없음    
      createSeries(newSeriesName, {
        onSuccess: async (response) => {
          await queryClient.invalidateQueries({ queryKey: ["series"] });
          console.log(settings)

          navigation.navigate("StoryGeneration", {
            settings,
            series: { name: newSeriesName, },
          });
        },
        onError: (error) => {
          Alert.alert("오류", error.message);
        },
      });
    } else {
      const selectedSeriesData = series.find((s) => s.seriesId === selectedSeries);
      if (selectedSeriesData) {
        console.log(settings)
        console.log("셀렉트 데이터를 좀 보자 : ")
        console.log(selectedSeriesData)

        navigation.navigate("StoryGeneration", {
          settings,
          series: { 
            name: selectedSeriesData.title,
            seriesid: selectedSeriesData.seriesId },
        });
      }
    }
  };

  const renderSeriesItem = ({ item }: { item: { seriesId: number; title: string } }) => (
    <Pressable
      style={[
        styles.seriesCard,
        selectedSeries === item.seriesId && styles.selectedSeriesCard,
      ]}
      onPress={() => {
        console.log(`선택: ${item.title} (ID: ${item.seriesId})`);
        setSelectedSeries(item.seriesId)
      }}
    >
      <View style={styles.seriesHeader}>
        <Text style={styles.seriesTitle}>{item.title}</Text>
      </View>
      {selectedSeries === item.seriesId && (
        <View style={styles.checkmark}>
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={theme.colors.primary}
          />
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Header
        title="시리즈 선택"
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.optionsContainer}>
        <Pressable
          style={[styles.modeButton, mode === "new" && styles.activeModeButton]}
          onPress={() => setMode("new")}
        >
          <MaterialCommunityIcons
            name="book-plus"
            size={24}
            color={mode === "new" ? theme.colors.white : theme.colors.primary}
          />
          <Text
            style={[
              styles.modeButtonText,
              mode === "new" && styles.activeModeButtonText,
            ]}
          >
            새로운 이야기 시작하기
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.modeButton,
            mode === "existing" && styles.activeModeButton,
          ]}
          onPress={() => setMode("existing")}
        >
          <MaterialCommunityIcons
            name="bookshelf"
            size={24}
            color={
              mode === "existing" ? theme.colors.white : theme.colors.primary
            }
          />
          <Text
            style={[
              styles.modeButtonText,
              mode === "existing" && styles.activeModeButtonText,
            ]}
          >
            기존 이야기에 이어쓰기
          </Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        {mode === "new" ? (
          <View style={styles.newSeriesContainer}>
            <Text style={styles.sectionTitle}>새로운 이야기의 시작</Text>
            <TextInput
              style={styles.input}
              placeholder="이야기의 제목을 입력해주세요"
              value={newSeriesName}
              onChangeText={setNewSeriesName}
              placeholderTextColor={theme.colors.textLight}
            />
            <Text style={styles.description}>
              당신만의 특별한 이야기를 시작해보세요. 나중에 더 많은 에피소드를
              추가할 수 있어요.
            </Text>
          </View>
        ) : (
          <View style={styles.existingSeriesContainer}>
            <Text style={styles.sectionTitle}>이어갈 이야기 선택하기</Text>
            {isSeriesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>시리즈 목록을 불러오는 중...</Text>
              </View>
            ) : (
              <FlatList
                data={series}
                renderItem={renderSeriesItem}
                keyExtractor={(item) => item.seriesId.toString()}
                contentContainerStyle={styles.seriesList}
              />
            )}
          </View>
        )}
      </View>
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.nextButton,
            (mode === "existing" && !selectedSeries) && styles.disabledButton,
            isPending && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={(mode === "existing" && !selectedSeries) || isPending}
        >
          <Text style={styles.nextButtonText}>
            {isPending ? "생성 중..." : "Next"}
          </Text>
          {!isPending && (
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color={theme.colors.white}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  optionsContainer: {
    flexDirection: "row",
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    gap: theme.spacing.sm,
    ...theme.shadows.small,
  },
  activeModeButton: {
    backgroundColor: theme.colors.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  activeModeButtonText: {
    color: theme.colors.white,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  newSeriesContainer: {
    padding: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: 16,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  existingSeriesContainer: {
    flex: 1,
  },
  seriesList: {
    paddingBottom: theme.spacing.xl,
  },
  seriesCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  selectedSeriesCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  seriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  seriesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  episodesBadge: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
  },
  episodesText: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  seriesDate: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  checkmark: {
    position: "absolute",
    right: theme.spacing.sm,
    bottom: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  nextButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.white,
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
});
