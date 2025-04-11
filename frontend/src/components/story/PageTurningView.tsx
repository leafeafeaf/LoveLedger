// components/story/PageTurningView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ImageBackground, 
  Platform,
  TouchableOpacity 
} from 'react-native';
import { theme } from '../../utils/theme';
import CustomPageFlipper, { PageFlipperHandle } from './CustomPageFlipper';

interface PageTurningViewProps {
  pages: React.ReactNode[];
  onPageChange?: (pageIndex: number) => void;
}

const { width, height } = Dimensions.get('window');

const PageTurningView: React.FC<PageTurningViewProps> = ({ pages, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(pages.length);
  const [isLastPage, setIsLastPage] = useState(false);
  const flipperRef = useRef<PageFlipperHandle>(null);
  
  // 페이지 수 변경 시 업데이트
  useEffect(() => {
    setTotalPages(pages.length);
  }, [pages.length]);
  
  // 현재 페이지가 마지막 페이지인지 확인
  useEffect(() => {
    setIsLastPage(currentPage === totalPages - 1);
  }, [currentPage, totalPages]);

  // 페이지 컴포넌트 생성
  const pageComponents = pages.map((page, index) => (
    <ImageBackground
      key={`page-${index}`}
      source={require('../../../assets/images/common/paper_texture.jpg')}
      style={styles.paperTexture}
      resizeMode="cover"
      imageStyle={styles.imageStyle}
    >
      <View style={styles.pageContainer}>
        {page}
      </View>
    </ImageBackground>
  ));

  // 페이지 변경 이벤트 핸들러
  const handlePageChange = (index: number) => {
    console.log('페이지 변경됨:', index + 1, '/', totalPages);
    setCurrentPage(index);
    if (onPageChange) {
      onPageChange(index);
    }
  };
  
  // 다음 페이지로 이동
  const goToNextPage = () => {
    if (!isLastPage && flipperRef.current) {
      flipperRef.current.animateToNext();
    }
  };
  
  // 이전 페이지로 이동
  const goToPrevPage = () => {
    if (currentPage > 0 && flipperRef.current) {
      flipperRef.current.animateToPrev();
    }
  };

  return (
    <View style={styles.container}>
      <CustomPageFlipper
        ref={flipperRef}
        onPageChange={handlePageChange}
      >
        {pageComponents}
      </CustomPageFlipper>
      
      {/* 페이지 네비게이션 버튼 */}
      <View style={[
        styles.pageNumberContainer,
        isLastPage && styles.lastPageNumberContainer
      ]}>
        <TouchableOpacity 
          style={[styles.navButton, currentPage === 0 && styles.disabledNavButton]} 
          onPress={goToPrevPage}
          disabled={currentPage === 0}
        >
          <Text style={[styles.navButtonText, currentPage === 0 && styles.disabledNavButtonText]}>{'<'}</Text>
        </TouchableOpacity>
        
        <Text style={[
          styles.pageNumber,
          isLastPage && styles.lastPageNumber
        ]}>
          {currentPage + 1} / {totalPages}
          {isLastPage && ' (마지막)'}
        </Text>
        
        <TouchableOpacity 
          style={[styles.navButton, isLastPage && styles.disabledNavButton]} 
          onPress={goToNextPage}
          disabled={isLastPage}
        >
          <Text style={[styles.navButtonText, isLastPage && styles.disabledNavButtonText]}>{'>'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFBF2',
    width: width,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pageContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  paperTexture: {
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    opacity: 0.7,  // 배경 이미지 투명도 조정
  },
  pageNumberContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    paddingHorizontal: 5,
    paddingVertical: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  lastPageNumberContainer: {
    backgroundColor: 'rgba(255, 245, 200, 0.6)',
  },
  pageNumber: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lastPageNumber: {
    color: '#A25252',
    fontWeight: '500',
  },
  navButton: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(246, 195, 36, 0.2)',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B7239',
  },
  disabledNavButton: {
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
  },
  disabledNavButtonText: {
    color: '#AAAAAA',
  },
});

export default PageTurningView;