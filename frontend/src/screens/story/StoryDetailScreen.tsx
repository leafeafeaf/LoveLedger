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

const StoryDetailScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const [showCover, setShowCover] = useState(true);
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
        <Text style={styles.bookTitle}>{storyData.title}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>{contentPages[0]}</Text>
      </View>
    </View>,
    // 나머지 페이지: 내용만
    ...contentPages.slice(1).map((pageContent, index) => (
      <View key={`content-page-${index}`} style={styles.contentPage}>
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{pageContent}</Text>
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
        onBack={() => navigation.goBack()}
        onShare={handleShare}
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
});

export default StoryDetailScreen;