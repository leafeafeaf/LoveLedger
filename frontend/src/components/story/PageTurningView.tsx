// components/story/PageTurningView.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  ImageBackground,
} from 'react-native';
import { theme } from '../../utils/theme';

interface PageTurningViewProps {
  pages: React.ReactNode[];
  onPageChange?: (pageIndex: number) => void;
}

const { width, height } = Dimensions.get('window');

const PageTurningView: React.FC<PageTurningViewProps> = ({ pages, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const pagePosition = useRef(new Animated.Value(0)).current;
  const pageCurl = useRef(new Animated.Value(0)).current;

  // 페이지 전환 효과 - 더 빠르고 강한 효과로 수정
  const animatePageTurn = (toValue: number, callback?: () => void) => {
    setIsAnimating(true);
    Animated.parallel([
      Animated.timing(pagePosition, {
        toValue,
        duration: 300, // 애니메이션 시간 단축
        useNativeDriver: true,
      }),
      Animated.timing(pageCurl, {
        toValue: toValue === 0 ? 0 : 1,
        duration: 300, // 애니메이션 시간 단축
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
      if (callback) callback();
    });
  };

  // 다음 페이지로 이동
  const goToNextPage = () => {
    if (currentPage < pages.length - 1 && !isAnimating) {
      animatePageTurn(-width, () => {
        pagePosition.setValue(0);
        pageCurl.setValue(0);
        setCurrentPage(prev => {
          const newPage = prev + 1;
          if (onPageChange) onPageChange(newPage);
          return newPage;
        });
      });
    }
  };

  // 이전 페이지로 이동
  const goToPrevPage = () => {
    if (currentPage > 0 && !isAnimating) {
      pagePosition.setValue(-width);
      pageCurl.setValue(1);
      animatePageTurn(0, () => {
        setCurrentPage(prev => {
          const newPage = prev - 1;
          if (onPageChange) onPageChange(newPage);
          return newPage;
        });
      });
    }
  };

  // 페이지 드래그 제스처 설정 - 민감도 향상
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 && !isAnimating; // 민감도 증가 (20 -> 5)
      },
      onPanResponderMove: (_, gestureState) => {
        // 오른쪽에서 왼쪽으로 스와이프 (다음 페이지)
        if (gestureState.dx < 0 && currentPage < pages.length - 1) {
          const newPosition = Math.max(gestureState.dx, -width);
          pagePosition.setValue(newPosition);
          // 커브 효과 강화
          pageCurl.setValue(Math.min(Math.abs(newPosition) / (width * 0.7), 1));
        }
        // 왼쪽에서 오른쪽으로 스와이프 (이전 페이지)
        else if (gestureState.dx > 0 && currentPage > 0) {
          const reversePosition = -width + gestureState.dx;
          pagePosition.setValue(Math.min(reversePosition, 0));
          // 커브 효과 강화
          pageCurl.setValue(Math.max(1 - gestureState.dx / (width * 0.7), 0));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -20 && currentPage < pages.length - 1) { // 민감도 증가 (-50 -> -20)
          // 다음 페이지로
          goToNextPage();
        } else if (gestureState.dx > 20 && currentPage > 0) { // 민감도 증가 (50 -> 20)
          // 이전 페이지로
          goToPrevPage();
        } else {
          // 원래 페이지로 복원
          animatePageTurn(0);
        }
      },
    })
  ).current;

  // 페이지 렌더링
  const renderPage = (index: number) => {
    if (index < 0 || index >= pages.length) return null;
    return (
      <View style={styles.pageContainer}>
        {pages[index]}
      </View>
    );
  };

  // 페이지 넘김 효과 - 강화된 3D 효과
  const curlStyles = {
    transform: [
      {
        perspective: 1200, // 증가된 원근감
      },
      {
        rotateY: pageCurl.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-30deg'], // 더 깊은 회전 효과
        }),
      },
      {
        translateX: pagePosition,
      },
    ],
    backfaceVisibility: 'hidden' as 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: pageCurl.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -8], // 더 깊은 그림자
      }),
      height: 0,
    },
    shadowOpacity: pageCurl.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.7], // 더 진한 그림자
    }),
    shadowRadius: 8, // 더 넓은 그림자
    elevation: 8,
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* 현재 페이지 */}
      <Animated.View style={[styles.page, curlStyles]}>
        <ImageBackground 
          source={require('../../../assets/images/common/paper_texture.jpg')}
          style={styles.paperTexture}
        >
          {renderPage(currentPage)}
        </ImageBackground>
      </Animated.View>

      {/* 다음 페이지 (미리 로드) */}
      {currentPage < pages.length - 1 && (
        <View style={[styles.nextPage]}>
          <ImageBackground 
            source={require('../../../assets/images/common/paper_texture.jpg')}
            style={styles.paperTexture}
          >
            {renderPage(currentPage + 1)}
          </ImageBackground>
        </View>
      )}

      {/* 페이지 번호 */}
      <View style={styles.pageNumberContainer}>
        <Text style={styles.pageNumber}>
          {currentPage + 1} / {pages.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFBF2',
    width: width, // 전체 화면 너비 사용
    overflow: 'hidden', // 넘치는 내용 숨김
  },
  pageContainer: {
    width: width,
    minHeight: height - 160, // 헤더 공간 여유 확보
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  page: {
    position: 'absolute',
    width: width, // 전체 화면 너비 사용
    height: '100%',
    backgroundColor: 'white',
    zIndex: 1, // 현재 페이지가 위에 오도록
  },
  nextPage: {
    position: 'absolute',
    width: width, // 전체 화면 너비 사용
    height: '100%',
    backgroundColor: 'white',
    zIndex: 0, // 다음 페이지가 아래에 오도록
  },
  paperTexture: {
    width: '100%',
    height: '100%',
  },
  pageNumberContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    zIndex: 2, // 페이지 번호가 항상 보이도록
  },
  pageNumber: {
    fontSize: 12,
    color: '#666', // 더 진한 색상으로 변경
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // 반투명 배경 추가
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
});

export default PageTurningView;