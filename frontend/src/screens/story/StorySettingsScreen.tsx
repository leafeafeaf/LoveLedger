import React, { useState, FC } from "react";
import DatePicker from "../../components/common/DatePicker";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { StoryScreenProps } from "../../types";
import Header from "../../components/common/Header";

// 아이콘 타입 정의
type IconName =
  | "calendar"
  | "calendar-month"
  | "calendar-week"
  | "palette"
  | "format-color-fill"
  | "brush"
  | "format-font"
  | "format-size"
  | "format-text";

// 각 항목에 대한 인터페이스 정의
interface PeriodItem {
  id: number;
  label: string;
  icon: IconName;
}

interface ThemeItem {
  id: number;
  label: string;
  icon: IconName;
}

interface FontItem {
  id: number;
  label: string;
  icon: IconName;
}

// 네비게이션 타입 정의
type RootStackParamList = {
  Main: undefined;
  StorySettings: undefined;
  SeriesSelection: {
    settings: {
      themeStyle: string;
      period: string;
    };
  };
};

type StorySettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "StorySettings"
>;

type StorySettingsScreenRouteProp = RouteProp<
  RootStackParamList,
  "StorySettings"
>;

interface StorySettingsScreenProps {
  navigation: StorySettingsScreenNavigationProp;
  route: StorySettingsScreenRouteProp;
}

const StorySettingsScreen: FC<StoryScreenProps<"StorySettings">> = ({
  navigation,
  route,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodItem | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeItem | null>(null);
  const [selectedFont, setSelectedFont] = useState<FontItem | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);

  // 기간 옵션
  const periods: PeriodItem[] = [
    { id: 1, label: "1개월", icon: "calendar-month" },
    { id: 2, label: "3개월", icon: "calendar-month" },
    { id: 3, label: "6개월", icon: "calendar-month" },
    { id: 4, label: "1년", icon: "calendar" },
    { id: 5, label: "직접 설정", icon: "calendar-week" },
  ];

  // 테마 옵션
  const themes: ThemeItem[] = [
    { id: 1, label: "심플", icon: "palette" },
    { id: 2, label: "로맨틱", icon: "palette" },
    { id: 3, label: "빈티지", icon: "palette" },
    { id: 4, label: "모던", icon: "palette" },
    { id: 5, label: "다이내믹", icon: "format-color-fill" },
  ];

  // 폰트 옵션
  const fonts: FontItem[] = [
    { id: 1, label: "기본", icon: "format-font" },
    { id: 2, label: "고딕", icon: "format-font" },
    { id: 3, label: "명조", icon: "format-font" },
    { id: 4, label: "손글씨", icon: "format-text" },
    { id: 5, label: "캐주얼", icon: "format-size" },
  ];

  // 기간 옵션 렌더링
  const renderPeriodOption = (item: PeriodItem) => {
    const isSelected = selectedPeriod?.id === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.optionItem, isSelected && styles.selectedOption]}
        onPress={() => {
          setSelectedPeriod(item);
          if (item.id === 5) {
            setShowDatePicker(true);
          }
        }}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={isSelected ? theme.colors.white : theme.colors.text}
        />
        <Text
          style={[styles.optionText, isSelected && styles.selectedOptionText]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // 테마 옵션 렌더링
  const renderThemeOption = (item: ThemeItem) => {
    const isSelected = selectedTheme?.id === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.optionItem, isSelected && styles.selectedOption]}
        onPress={() => setSelectedTheme(item)}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={isSelected ? theme.colors.white : theme.colors.text}
        />
        <Text
          style={[styles.optionText, isSelected && styles.selectedOptionText]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // 폰트 옵션 렌더링
  const renderFontOption = (item: FontItem) => {
    const isSelected = selectedFont?.id === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.optionItem, isSelected && styles.selectedOption]}
        onPress={() => setSelectedFont(item)}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={isSelected ? theme.colors.white : theme.colors.text}
        />
        <Text
          style={[styles.optionText, isSelected && styles.selectedOptionText]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // 시리즈 이름 선택 화면으로 이동
  const goToSeriesSelection = () => {
    // 필요한 데이터 모두 선택되었는지 확인
    if (!selectedPeriod || !selectedTheme || !selectedFont) {
      // 알림 처리
      return;
    }

    navigation.navigate("SeriesSelection", {
      settings: {
        themeStyle: selectedTheme.label,
        toneStyle: "default",
        lengthStyle: "default",
        period: selectedPeriod.label,
      },
    });
  };

  // 날짜 선택 핸들러
  const handleSelectDate = (date: Date) => {
    setStartDate(date);
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      <Header
        title="스토리 설정"
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={handleSelectDate}
        selectedDate={startDate || undefined}
      />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Period</Text>
          <View style={styles.optionsRow}>
            {periods.map(renderPeriodOption)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Theme</Text>
          <View style={styles.themeGrid}>{themes.map(renderThemeOption)}</View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Font</Text>
          <View style={styles.fontGrid}>{fonts.map(renderFontOption)}</View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable style={styles.nextButton} onPress={goToSeriesSelection}>
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
};

export default StorySettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  section: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    gap: theme.spacing.sm,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  selectedOptionText: {
    color: theme.colors.white,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  themeCard: {
    width: "45%",
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  activeThemeCard: {
    backgroundColor: theme.colors.primary,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  activeThemeLabel: {
    color: theme.colors.white,
  },
  fontGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fontOption: {
    width: "23%",
    alignItems: "center",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  activeFontOption: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  fontSample: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  activeFontSample: {
    color: theme.colors.primary,
  },
  handwritingFont: {
    fontStyle: "italic",
  },
  modernFont: {
    fontWeight: "300",
  },
  elegantFont: {
    fontWeight: "700",
  },
  fontLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  activeFontLabel: {
    color: theme.colors.text,
    fontWeight: "500",
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
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.white,
  },
});
