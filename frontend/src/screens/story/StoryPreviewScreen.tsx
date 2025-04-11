import React, { FC, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { StoryScreenProps, StorySettings, Story, Series } from "../../types";
import Header from "../../components/common/Header";
import { useDatePicker } from "../../hooks/useDatePicker";
import { useDispatch } from "react-redux";
import { clearCurrentStory, clearCoverImage, clearStorySavingState } from "../../store/contentSlice";
import { CommonActions } from "@react-navigation/native";

const StoryPreviewScreen: FC<StoryScreenProps<"StoryPreview">> = ({
  navigation,
  route,
}) => {
  const { settings, series, story } = route.params;
  const { resetAllDates } = useDatePicker();
  const dispatch = useDispatch();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fontStyle, setFontStyle] = useState<string | null>(null);

  // 선택된 폰트 스타일을 설정합니다
  useEffect(() => {
    if (settings && settings.fontStyle) {
      setFontStyle(settings.fontStyle);
    }
  }, [settings]);

  // 폰트 스타일에 따른 스타일 객체를 반환하는 함수
  const getFontStyle = () => {
    if (!fontStyle) return null;

    switch (fontStyle) {
      case "신라문화체":
        return styles.shillaFont;
      case "빛의 계승자체":
        return styles.heirFont;
      case "강원교육새음체":
        return styles.gangwonFont;
      case "조선일보명조체":
        return styles.chosunFont;
      default:
        return null;
    }
  };

  const resetAndNavigateToMain = () => {
    // 설정 초기화
    resetAllDates();
    dispatch(clearCurrentStory());
    dispatch(clearCoverImage());
    dispatch(clearStorySavingState());
    
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Main" }]
      })
    );
  };

  const handleBack = () => {
    setShowConfirmModal(true);
  };

  const handleNext = () => {
    navigation.navigate("CoverSelection", {
      settings,
      series,
      story,
    });
  };

  const handleRegenerate = () => {
    navigation.navigate("StoryGeneration", {
      settings,
      series,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="스토리 미리보기"
        showBack={true}
        onBack={handleBack}
      />
      
      {/* 커스텀 확인 모달 */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>소설 작성 취소</Text>
            <Text style={styles.modalContent}>
              메인 화면으로 돌아가시겠습니까?{'\n'}
              지금까지의 설정은 초기화됩니다.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={resetAndNavigateToMain}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.paperContainer}>
            <Text style={[styles.storyTitle, getFontStyle()]}>{story.title}</Text>
            <Text style={[styles.storyContent, getFontStyle()]}>{story.content}</Text>
          </View>
          <Pressable style={styles.regenerateButton} onPress={handleRegenerate}>
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.regenerateButtonText}>스토리 재생성</Text>
          </Pressable>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable style={styles.nextButton} onPress={handleNext}>
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
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  paperContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    width: "95%",
    alignSelf: "center",
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  storyContent: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 28,
    textAlign: "justify",
  },
  // 폰트 스타일 정의
  shillaFont: {
    fontFamily: "Shilla_CultureB",
  },
  heirFont: {
    fontFamily: "HeirofLightBold",
  },
  gangwonFont: {
    fontFamily: "GangwonEdu",
  },
  chosunFont: {
    fontFamily: "ChosunNm",
  },
  regenerateButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.sm,
    width: "95%",
    alignSelf: "center",
    ...theme.shadows.medium,
  },
  regenerateButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
  
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  modalContent: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: theme.colors.border,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
});

export default StoryPreviewScreen;
