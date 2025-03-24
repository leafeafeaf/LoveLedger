import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { Series, StorySettings, NewSeries } from "../../types";
import { StoryScreenProps } from "../../types";
import Header from "../../components/common/Header";

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

  const mockSeries: Series[] = [
    {
      id: 1,
      title: "Our Love Journey",
      episodes: 3,
      lastUpdated: "2024-03-10",
    },
    {
      id: 2,
      title: "Weekend Adventures",
      episodes: 5,
      lastUpdated: "2024-03-05",
    },
    {
      id: 3,
      title: "Romantic Escapes",
      episodes: 2,
      lastUpdated: "2024-02-28",
    },
  ];

  const renderSeriesItem = ({ item }: { item: Series }) => (
    <Pressable
      style={[
        styles.seriesCard,
        selectedSeries === item.id && styles.selectedSeriesCard,
      ]}
      onPress={() => setSelectedSeries(item.id)}
    >
      <View style={styles.seriesHeader}>
        <Text style={styles.seriesTitle}>{item.title}</Text>
        <View style={styles.episodesBadge}>
          <Text style={styles.episodesText}>{item.episodes} episodes</Text>
        </View>
      </View>
      <Text style={styles.seriesDate}>Last updated: {item.lastUpdated}</Text>
      {selectedSeries === item.id && (
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

  const handleNext = () => {
    let seriesData;
    if (mode === "new") {
      seriesData = { name: newSeriesName || "Our Love Story" };
    } else {
      const series = mockSeries.find((s) => s.id === selectedSeries);
      if (series) {
        seriesData = { name: series.title };
      } else {
        seriesData = { name: mockSeries[0].title };
      }
    }

    navigation.navigate("StoryGeneration", {
      settings,
      series: seriesData,
    });
  };

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
            Create new series
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
            Add to existing series
          </Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        {mode === "new" ? (
          <View style={styles.newSeriesContainer}>
            <Text style={styles.sectionTitle}>Create a New Series</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter series name"
              value={newSeriesName}
              onChangeText={setNewSeriesName}
              placeholderTextColor={theme.colors.textLight}
            />
            <Text style={styles.description}>
              Create a new series to organize your stories. You can add more
              episodes to this series later.
            </Text>
          </View>
        ) : (
          <View style={styles.existingSeriesContainer}>
            <Text style={styles.sectionTitle}>Select an Existing Series</Text>
            <FlatList
              data={mockSeries}
              renderItem={renderSeriesItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.seriesList}
            />
          </View>
        )}
      </View>
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.nextButton,
            mode === "existing" && !selectedSeries && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={mode === "existing" && !selectedSeries}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={theme.colors.white}
          />
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
});
