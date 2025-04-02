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

  // 페이지 전환 효과
  const animatePageTurn = (toValue: number, callback?: () => void) => {
    setIsAnimating(true);
    Animated.parallel([
      Animated.timing(pagePosition, {
        toValue,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(pageCurl, {
        toValue: toValue === 0 ? 0 : 1,
        duration: 400,
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

  // 페이지 드래그 제스처 설정
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && !isAnimating;
      },
      onPanResponderMove: (_, gestureState) => {
        // 오른쪽에서 왼쪽으로 스와이프 (다음 페이지)
        if (gestureState.dx < 0 && currentPage < pages.length - 1) {
          const newPosition = Math.max(gestureState.dx, -width);
          pagePosition.setValue(newPosition);
          pageCurl.setValue(Math.min(Math.abs(newPosition) / width, 1));
        }
        // 왼쪽에서 오른쪽으로 스와이프 (이전 페이지)
        else if (gestureState.dx > 0 && currentPage > 0) {
          const reversePosition = -width + gestureState.dx;
          pagePosition.setValue(Math.min(reversePosition, 0));
          pageCurl.setValue(Math.max(1 - gestureState.dx / width, 0));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50 && currentPage < pages.length - 1) {
          // 다음 페이지로
          goToNextPage();
        } else if (gestureState.dx > 50 && currentPage > 0) {
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

  // 페이지 넘김 효과
  const curlStyles = {
    transform: [
      {
        perspective: 1000,
      },
      {
        rotateY: pageCurl.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-20deg'],
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
        outputRange: [0, -5],
      }),
      height: 0,
    },
    shadowOpacity: pageCurl.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.5],
    }),
    shadowRadius: 5,
    elevation: 5,
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
  },
  pageContainer: {
    width,
    minHeight: height - 180, // 헤더와 푸터 공간 확보
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  page: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  nextPage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    zIndex: -1,
  },
  paperTexture: {
    width: '100%',
    height: '100%',
  },
  pageNumberContainer: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  pageNumber: {
    fontSize: 12,
    color: '#999',
  },
});

export default PageTurningView;