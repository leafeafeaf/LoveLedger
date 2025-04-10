// screens/story/StoryDetailScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Share,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LibraryStackParamList, LibraryScreenProps } from '../../types';
import WoodHeader from '../../components/common/WoodHeader';
import PageTurningView from '../../components/story/PageTurningView';
import BlinkingText from '../../components/common/BlinkingText';
import { theme } from '../../utils/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  fetchFictionDetailStart, 
  fetchFictionDetailSuccess, 
  fetchFictionDetailFailure 
} from '../../store/contentSlice';
import { axiosInstance } from '../../api/axios';

// LibraryScreenProps 사용
type Props = LibraryScreenProps<"StoryDetail">;

const { width, height } = Dimensions.get("window");

// 폰트 타입 정의
type FontType = "default" | "신라문화체" | "빛의 계승자체" | "강원교육새음체" | "조선일보명조체";

const StoryDetailScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const [showCover, setShowCover] = useState(true);
  const [fontModalVisible, setFontModalVisible] = useState(false);
  const [selectedFont, setSelectedFont] = useState<FontType>("default");
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((state: RootState) => state.content.fictionDetail);

  useEffect(() => {
    const fetchFictionDetail = async () => {
      try {
        dispatch(fetchFictionDetailStart());
        const response = await axiosInstance.get(`/fictions/${id}`);
        console.log('Fiction Detail API Response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.data) {
          dispatch(fetchFictionDetailSuccess(response.data.data));
        } else {
          dispatch(fetchFictionDetailFailure("소설 데이터가 없습니다."));
        }
      } catch (error) {
        console.error('Error fetching fiction detail:', error);
        dispatch(fetchFictionDetailFailure(error instanceof Error ? error.message : "소설을 불러오는데 실패했습니다."));
      }
    };

    fetchFictionDetail();
  }, [dispatch, id]);

  // 폰트 스타일에 따른 스타일 객체를 반환하는 함수
  const getFontStyle = () => {
    switch (selectedFont) {
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

  // 폰트 선택 핸들러
  const handleFontSelect = (font: FontType) => {
    setSelectedFont(font);
    setFontModalVisible(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>소설을 불러오는데 실패했습니다.</Text>
      </View>
    );
  }

  const storyData = {
    id,
    title: data.title,
    content: data.content,
    date: data.createdAt,
    coverImage: { uri: data.artUrl },
  };

  // 컨텐츠를 여러 페이지로 나누기
  const contentPages = splitContentIntoPages(storyData.content);

  // 모든 페이지 생성
  const pages = [
    // 첫 번째 페이지: 제목과 내용 분리
    <View key="title-page" style={styles.contentPage}>
      <View style={styles.titleContainer}>
        <Text style={[styles.bookTitle, getFontStyle()]}>{storyData.title}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.contentText, getFontStyle()]}>{contentPages[0]}</Text>
      </View>
    </View>,
    // 나머지 페이지: 내용만
    ...contentPages.slice(1).map((pageContent, index) => (
      <View key={`content-page-${index}`} style={styles.contentPage}>
        <View style={styles.contentContainer}>
          <Text style={[styles.contentText, getFontStyle()]}>{pageContent}</Text>
        </View>
      </View>
    )),
  ];

  // 표지 화면에서 넘기기 애니메이션 시작
  const handleStartReading = () => {
    setShowCover(false);
  };

  // 공유 기능
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this story: ${storyData.title}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <View style={styles.container}>
      <WoodHeader
        title="Story"
        showBack={true}
        showShare={true}
        showFontSelector={!showCover}
        onBack={() => navigation.goBack()}
        onShare={handleShare}
        onFontSelect={() => setFontModalVisible(true)}
      />

      {showCover ? (
        // 표지 화면
        <Pressable style={styles.coverContainer} onPress={handleStartReading}>
          <Image
            source={storyData.coverImage}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.coverTextContainer}>
            <Text style={styles.coverTitle}>{storyData.title}</Text>
            <Text style={styles.coverDate}>
              {new Date(storyData.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.nextIndicator}>
            <BlinkingText text="Next..." style={styles.nextText} />
          </View>
        </Pressable>
      ) : (
        // 책 내용 페이지 (넘김 효과 포함)
        <PageTurningView pages={pages} />
      )}

      {/* 폰트 선택 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={fontModalVisible}
        onRequestClose={() => setFontModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>폰트 선택</Text>
            
            <TouchableOpacity
              style={[styles.fontOption, selectedFont === "default" && styles.selectedFontOption]}
              onPress={() => handleFontSelect("default")}
            >
              <Text style={[styles.fontOptionText, selectedFont === "default" && styles.selectedFontText]}>기본</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fontOption, selectedFont === "신라문화체" && styles.selectedFontOption]}
              onPress={() => handleFontSelect("신라문화체")}
            >
              <Text style={[styles.fontOptionText, selectedFont === "신라문화체" && styles.selectedFontText, styles.shillaFont]}>
                신라문화체
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fontOption, selectedFont === "빛의 계승자체" && styles.selectedFontOption]}
              onPress={() => handleFontSelect("빛의 계승자체")}
            >
              <Text style={[styles.fontOptionText, selectedFont === "빛의 계승자체" && styles.selectedFontText, styles.heirFont]}>
                빛의 계승자체
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fontOption, selectedFont === "강원교육새음체" && styles.selectedFontOption]}
              onPress={() => handleFontSelect("강원교육새음체")}
            >
              <Text style={[styles.fontOptionText, selectedFont === "강원교육새음체" && styles.selectedFontText, styles.gangwonFont]}>
                강원교육새음체
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fontOption, selectedFont === "조선일보명조체" && styles.selectedFontOption]}
              onPress={() => handleFontSelect("조선일보명조체")}
            >
              <Text style={[styles.fontOptionText, selectedFont === "조선일보명조체" && styles.selectedFontText, styles.chosunFont]}>
                조선일보명조체
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFontModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 책 이미지 가져오는 함수
function getBookImage(id: string) {
  switch (id) {
    case "1":
      return require("../../../assets/images/library/book_image_1.png");
    case "2":
      return require("../../../assets/images/library/book_image_2.png");
    case "3":
      return require("../../../assets/images/library/book_image_3.png");
    case "4":
      return require("../../../assets/images/library/book_image_4.png");
    default:
      return require("../../../assets/images/library/book_image_5.png");
  }
}

// 콘텐츠를 페이지로 나누는 함수
function splitContentIntoPages(content: string): string[] {
  // 페이지당 글자 수가 아닌 페이지당 라인 수로 처리
  const linesPerPage = 15; // 한 페이지에 보여줄 줄 수
  const paragraphs = content.split("\n\n");
  
  const pages: string[] = [];
  let currentPage = "";
  let lineCount = 0;
  
  for (const paragraph of paragraphs) {
    // 단락의 예상 줄 수 계산 (평균적으로 한 줄에 50자)
    const paragraphLines = Math.ceil(paragraph.length / 50) + 1; // +1은 단락 다음의 여백
    
    // 현재 페이지에 이 단락을 추가했을 때 라인 제한을 넘는지 확인
    if (lineCount + paragraphLines > linesPerPage) {
      pages.push(currentPage.trim());
      currentPage = paragraph + "\n\n";
      lineCount = paragraphLines;
    } else {
      currentPage += paragraph + "\n\n";
      lineCount += paragraphLines;
    }
  }
  
  // 마지막 페이지 추가
  if (currentPage.length > 0) {
    pages.push(currentPage.trim());
  }
  
  return pages;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  coverContainer: {
    flex: 1,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverTextContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  coverDate: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  nextIndicator: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  nextText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  contentPage: {
    flex: 1,
    padding: 20,
    // 배경 없음
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "purple",
  },
  contentContainer: {
    flex: 1,
    height: height * 0.7, // 화면 높이의 70%로 지정
    overflow: 'hidden', // 컨텐츠가 영역을 벗어나지 않도록 설정
    // 배경 없음
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
  },
  // 폰트 스타일
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
  
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.primary,
  },
  fontOption: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedFontOption: {
    backgroundColor: 'rgba(246, 195, 36, 0.3)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  fontOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedFontText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  closeButton: {
    marginTop: 10,
    padding: 15,
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default StoryDetailScreen;