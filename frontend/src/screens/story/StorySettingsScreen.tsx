import React, { useState, FC, useEffect } from "react";
import DatePicker from "../../components/common/DatePicker";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { StoryScreenProps } from "../../types";
import Header from "../../components/common/Header";
import useDatePicker from "../../hooks/useDatePicker";

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
  image: any;
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
  // Redux 상태 사용
  const { startDate, endDate, isCustomDate, resetAllDates } = useDatePicker();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodItem | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeItem | null>(null);
  const [selectedFont, setSelectedFont] = useState<FontItem | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingEndDate, setSelectingEndDate] = useState(false);

  // CUSTOM_DATE_ID를 초기화 시에 사용
  const CUSTOM_DATE_ID = 0;

  // Effect 제거 - 대신 컴포넌트 초기화 시 startDate나 endDate가 있으면 직접 설정으로 초기화
  useEffect(() => {
    if ((startDate || endDate) && !selectedPeriod) {
      setSelectedPeriod({
        id: CUSTOM_DATE_ID,
        label: "직접 설정",
        icon: "calendar-week",
      });
    }
  }, []);

  // 기간 옵션
  const periods: PeriodItem[] = [
    { id: 1, label: "이번 주 소설", icon: "calendar-week" },
    { id: 2, label: "이번 달 소설", icon: "calendar-month" },
    { id: 3, label: "올해 소설", icon: "calendar" },
  ];

  // 테마 옵션
  const themes: ThemeItem[] = [
    {
      id: 1,
      label: "일상",
      icon: "palette",
      image: require("../../../assets/images/theme/일상.png"),
    },
    {
      id: 2,
      label: "판타지",
      icon: "palette",
      image: require("../../../assets/images/theme/판타지.png"),
    },
    {
      id: 3,
      label: "파파라치",
      icon: "palette",
      image: require("../../../assets/images/theme/파파라치.png"),
    },
    {
      id: 4,
      label: "뉴스",
      icon: "palette",
      image: require("../../../assets/images/theme/뉴스.png"),
    },
  ];

  // 폰트 옵션
  const fonts: FontItem[] = [
    { id: 1, label: "Pretendard", icon: "format-font" },
    { id: 2, label: "고딕", icon: "format-font" },
    { id: 3, label: "명조", icon: "format-font" },
    { id: 4, label: "필기체", icon: "format-text" },
  ];

  // 테마 옵션 렌더링
  const renderThemeOption = ({ item }: { item: ThemeItem }) => {
    const isSelected = selectedTheme?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.themeCard, isSelected && styles.selectedThemeCard]}
        onPress={() => setSelectedTheme(item)}
      >
        <Image source={item.image} style={styles.themeImage} />
        <Text
          style={[styles.themeLabel, isSelected && styles.selectedThemeLabel]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // 폰트 옵션 렌더링
  const renderFontOption = ({ item }: { item: FontItem }) => {
    const isSelected = selectedFont?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.fontCard, isSelected && styles.selectedFontCard]}
        onPress={() => setSelectedFont(item)}
      >
        <View style={styles.fontContent}>
          <Text
            style={[
              styles.fontSampleText,
              item.label === "Pretendard" && styles.pretendardFont,
              item.label === "고딕" && styles.gothicFont,
              item.label === "명조" && styles.myeongjoFont,
              item.label === "필기체" && styles.handwritingFont,
              isSelected && styles.selectedFontText,
            ]}
          >
            여러분의 이야기를{"\n"}이 글씨로 담겠습니다.
          </Text>
          <Text
            style={[styles.fontLabel, isSelected && styles.selectedFontLabel]}
          >
            {item.label}
          </Text>
        </View>
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
    console.log(selectedPeriod)

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
    // Redux 상태 업데이트는 이미 DatePicker 컴포넌트 내부에서 처리됨
    if (!selectingEndDate) {
      setSelectingEndDate(true);
      // 시작일 선택 후에도 DatePicker 유지
    } else {
      setSelectingEndDate(false);
      // setShowDatePicker(false); // 모달 닫기 제거
    }
  };

  // 범위 선택 핸들러
  const handleSelectRange = (start: Date, end: Date) => {
    // Redux 상태 업데이트는 이미 DatePicker 컴포넌트 내부에서 처리됨
    // setShowDatePicker(false); // 모달 닫기 제거
    const formattedStart = start.toISOString().split("T")[0];
    const formattedEnd = end.toISOString().split("T")[0];

    setSelectedPeriod({
      id: CUSTOM_DATE_ID,
      label: `${formattedStart} ~ ${formattedEnd}`, // ✅ 날짜 범위 직접 넣기!
      icon: "calendar-week",
    });
  };

  // 사용자가 기본 기간 옵션을 선택하면 DatePicker 상태 초기화
  const handlePeriodSelect = (item: PeriodItem) => {
    setSelectedPeriod(item);
    if (item.id !== CUSTOM_DATE_ID) {
      // 기본 옵션 선택 시 직접 설정 상태 초기화
      resetAllDates();
    }
  };

  // 날짜 포맷 함수
  const formatDate = (date: Date | null): string => {
    if (!date) return "날짜 선택";

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  return (
    <View style={styles.container}>
      <Header
        title="소설 초기 설정"
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={handleSelectDate}
        isRange={true}
        onSelectRange={handleSelectRange}
      />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기간 선택</Text>

          {/* 직접 설정 옵션 - 분리하여 표시 */}
          <TouchableOpacity
            style={[
              styles.customDateContainer,
              selectedPeriod?.id === CUSTOM_DATE_ID &&
              styles.selectedCustomDate,
            ]}
            onPress={() => {
              const formattedStart = startDate ? startDate.toISOString().split("T")[0] : "";
              const formattedEnd = endDate ? endDate.toISOString().split("T")[0] : "";
              const rangeLabel =
                formattedStart && formattedEnd
                  ? `${formattedStart} ~ ${formattedEnd}`
                  : "날짜 미지정";

              setSelectedPeriod({
                id: CUSTOM_DATE_ID,
                label: rangeLabel,
                icon: "calendar-week",
              });
              setSelectingEndDate(false);
              setShowDatePicker(true);
            }}
          >
            <View style={styles.customDateHeader}>
              {!startDate && !endDate && (
                <Text
                  style={[
                    styles.customDateLabel,
                    styles.centeredCustomDateLabel,
                  ]}
                >
                  직접 설정
                </Text>
              )}
            </View>
            <View style={styles.dateRangeContainer}>
              {startDate && endDate ? (
                <View>
                  <Text style={[styles.dateRangeDisplay, styles.centeredText]}>
                    {formatDate(startDate)}부터
                  </Text>
                  <Text style={[styles.dateRangeDisplay, styles.centeredText]}>
                    {formatDate(endDate)}까지의 이야기
                  </Text>
                </View>
              ) : (
                <Text style={[styles.dateRangeDisplay, styles.centeredText]}>
                  날짜를 선택해주세요
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* 기본 기간 옵션들 */}
          <View style={styles.periodOptionsContainer}>
            {periods.map((item) => {
              const isSelected = selectedPeriod?.id === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.optionItem,
                    isSelected && styles.selectedOption,
                  ]}
                  onPress={() => handlePeriodSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText,
                      styles.centeredText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>테마 선택</Text>
          <FlatList
            data={themes}
            renderItem={renderThemeOption}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={
              Dimensions.get("window").width * 0.78 + theme.spacing.md
            }
            decelerationRate="fast"
            contentContainerStyle={styles.themeListContainer}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>폰트 선택</Text>
          <FlatList
            data={fonts}
            renderItem={renderFontOption}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={
              Dimensions.get("window").width * 0.78 + theme.spacing.md
            }
            decelerationRate="fast"
            contentContainerStyle={styles.fontListContainer}
          />
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
    color: "#000000",
    marginBottom: theme.spacing.md,
  },
  periodOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
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
    color: "#000000",
  },
  selectedOptionText: {
    color: theme.colors.white,
  },
  themeListContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  themeCard: {
    width: Dimensions.get("window").width * 0.78,
    height: 200,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    overflow: "hidden",
    ...theme.shadows.medium,
  },
  selectedThemeCard: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  themeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  themeLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.white,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    textAlign: "center",
  },
  selectedThemeLabel: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  fontListContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  fontCard: {
    width: Dimensions.get("window").width * 0.78,
    height: 150,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    overflow: "hidden",
    ...theme.shadows.medium,
  },
  selectedFontCard: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  fontContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  fontSampleText: {
    fontSize: 24,
    textAlign: "center",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  pretendardFont: {
    fontFamily: "Pretendard",
  },
  gothicFont: {
    fontFamily: "Pretendard-Bold",
  },
  myeongjoFont: {
    fontFamily: "Pretendard-Medium",
  },
  handwritingFont: {
    fontFamily: "Pretendard-Regular",
    fontStyle: "italic",
  },
  selectedFontText: {
    color: theme.colors.primary,
  },
  fontLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
  },
  selectedFontLabel: {
    color: theme.colors.primary,
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
  customDateContainer: {
    width: Dimensions.get("window").width * 0.78,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
  },
  selectedCustomDate: {
    backgroundColor: theme.colors.primary,
  },
  customDateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  customDateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
  },
  centeredText: {
    textAlign: "center",
  },
  centeredCustomDateLabel: {
    width: "100%",
    textAlign: "center",
  },
  dateRangeContainer: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  dateRangeDisplay: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
  },
  selectedDateRange: {
    color: theme.colors.white,
  },
  customDateOption: {
    width: "100%",
  },
  dateRangeText: {
    fontSize: 12,
    color: "#000000",
    marginTop: 4,
  },
});
