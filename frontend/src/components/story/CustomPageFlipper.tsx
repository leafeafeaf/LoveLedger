import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
  Text,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface CustomPageFlipperProps {
  children: React.ReactNode[];
  onPageChange?: (index: number) => void;
}

// ref로 외부에 노출할 메서드 정의
export interface PageFlipperHandle {
  animateToNext: () => void;
  animateToPrev: () => void;
  getCurrentPage: () => number;
}

const CustomPageFlipper = forwardRef<PageFlipperHandle, CustomPageFlipperProps>(
  ({ children, onPageChange }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // 애니메이션 값들
    const position = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const shadowValue = useRef(new Animated.Value(0)).current;  // 그림자 단일 값으로 변경

    // ref로 메서드 노출
    useImperativeHandle(ref, () => ({
      animateToNext: () => {
        animateToNext();
      },
      animateToPrev: () => {
        animateToPrev();
      },
      getCurrentPage: () => {
        return currentIndex;
      }
    }));

    // 페이지 전환 애니메이션
    const animateToNext = () => {
      // 마지막 페이지 체크 추가
      if (currentIndex >= children.length - 1 || isAnimating) {
        console.log('마지막 페이지거나 애니메이션 중입니다.');
        return;
      }
      
      setIsAnimating(true);
      console.log('다음 페이지로 애니메이션 시작:', currentIndex + 1);
      
      Animated.parallel([
        Animated.timing(position, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: -30,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(shadowValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 애니메이션 완료 후 페이지 전환
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        console.log('페이지 전환 완료:', newIndex);
        onPageChange?.(newIndex);
        
        // 값 초기화
        position.setValue(0);
        rotate.setValue(0);
        opacity.setValue(1);
        shadowValue.setValue(0);
        
        setIsAnimating(false);
      });
    };

    const animateToPrev = () => {
      if (currentIndex <= 0 || isAnimating) {
        console.log('첫 페이지이거나 애니메이션 중입니다.');
        return;
      }
      
      setIsAnimating(true);
      console.log('이전 페이지로 애니메이션 시작:', currentIndex - 1);
      
      // 현재 위치에서 화면 바깥까지 슬라이드
      Animated.parallel([
        Animated.timing(position, {
          toValue: width, // 오른쪽으로 완전히 이동
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 30, // 오른쪽으로 회전
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.7, // 약간 투명하게
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(shadowValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 페이지 인덱스 변경
        const newIndex = currentIndex - 1;
        setCurrentIndex(newIndex);
        console.log('이전 페이지로 전환 완료:', newIndex);
        onPageChange?.(newIndex);
        
        // 값 초기화 - 숨겨서 실행
        setTimeout(() => {
          position.setValue(0);
          rotate.setValue(0);
          opacity.setValue(1);
          shadowValue.setValue(0);
          setIsAnimating(false);
        }, 50);
      });
    };

    // 제스처 핸들러
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // 수평 움직임에만 반응
          const { dx, dy } = gestureState;
          
          // 마지막 페이지에서 왼쪽으로 스와이프 제한 (더 유연하게 수정)
          if (currentIndex >= children.length - 1 && dx < -5) {
            // 마지막 페이지에서는 오른쪽으로만 이동 가능 (이전 페이지로)
            return false;
          }
          
          // 최소한의 움직임과 수평 우선 + 애니메이션 중이 아닌 경우에만 반응
          return Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy) && !isAnimating;
        },
        onPanResponderMove: (_, gestureState) => {
          const { dx } = gestureState;
          
          // 다음 페이지로 (오른쪽에서 왼쪽으로)
          if (dx < 0 && currentIndex < children.length - 1) {
            // 움직임 제한
            const newPosition = Math.max(dx, -width);
            position.setValue(newPosition);
            
            // 회전 각도 (0 ~ -30)
            const newRotate = (newPosition / width) * -30;
            rotate.setValue(newRotate);
            
            // 투명도 (1 ~ 0.5)
            const newOpacity = 1 - Math.abs(newPosition / width) * 0.5;
            opacity.setValue(newOpacity);
            
            // 그림자 효과 (단일 값)
            const newShadowValue = Math.abs(newPosition / width);
            shadowValue.setValue(newShadowValue);
            
            // 일정 비율 이상 넘기면 자동으로 다음 페이지로 전환 (비율 낮춤)
            if (Math.abs(newPosition) > width * 0.25 && !isAnimating) {
              // 페이지 전환 애니메이션 시작
              animateToNext();
            }
          }
          // 이전 페이지로 (왼쪽에서 오른쪽으로)
          else if (dx > 0 && currentIndex > 0) {
            // 시작점과 이동 거리 계산 개선
            const startPositionValue = 0; // 시작 위치는 0 (현재 페이지)
            const dragDistance = dx; // 오른쪽으로 드래그한 거리
            
            // 이전 페이지가 오른쪽에서 나타나는 효과
            const newPosition = startPositionValue + dragDistance;
            position.setValue(Math.min(newPosition, width / 2)); // 최대 화면의 절반까지만 이동
            
            // 회전 각도 (0 ~ 30도), 오른쪽으로 회전
            const newRotate = (dragDistance / width) * 30;
            rotate.setValue(Math.min(newRotate, 30));
            
            // 투명도 설정
            const newOpacity = 1 - (dragDistance / width) * 0.3;
            opacity.setValue(Math.max(newOpacity, 0.7));
            
            // 그림자 효과 (단일 값)
            const newShadowValue = dragDistance / width;
            shadowValue.setValue(Math.min(newShadowValue, 1));
            
            console.log('이전 페이지 드래그:', dragDistance, newPosition, newRotate);
            
            // 일정 비율 이상 넘기면 자동으로 이전 페이지로 전환 (민감도 높임)
            if (dragDistance > width * 0.2 && !isAnimating) {
              console.log('자동 이전 페이지 전환 시도');
              animateToPrev();
            }
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const { dx, vx } = gestureState;
          
          // 이미 애니메이션 중이면 추가 처리하지 않음
          if (isAnimating) return;
          
          // 로그 추가
          console.log('터치 놓음 - 현재 페이지:', currentIndex, '총 페이지:', children.length, 'dx:', dx, 'vx:', vx);
          
          // 다음 페이지로 (민감도 조정 - 오른쪽에서 왼쪽으로)
          if ((dx < -width / 10 || vx < -0.2) && currentIndex < children.length - 1) {
            console.log('다음 페이지로 전환 시도');
            animateToNext();
          } 
          // 이전 페이지로 (민감도 조정 - 왼쪽에서 오른쪽으로)
          else if ((dx > width / 8 || vx > 0.15) && currentIndex > 0) {
            console.log('이전 페이지로 전환 시도');
            animateToPrev();
          } 
          // 충분히 이동하지 않았을 때 원위치
          else {
            console.log('원위치로 복귀');
            Animated.parallel([
              Animated.timing(position, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(rotate, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(shadowValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
          }
        },
      })
    ).current;

    // 그림자 스타일을 transform과 opacity로만 구현
    const createShadowStyle = () => {
      const shadowOpacity = shadowValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.6],
      });
      
      return {
        opacity: opacity,
        // useNativeDriver가 지원하는 속성만 사용
        transform: [
          { translateX: position },
          {
            rotateY: rotate.interpolate({
              inputRange: [-30, 0],
              outputRange: ['-30deg', '0deg'],
            }),
          },
        ],
      };
    };

    return (
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* 현재 페이지 (움직이는 페이지) */}
        <Animated.View
          style={[
            styles.page,
            createShadowStyle(),
            { zIndex: 2 }
          ]}
        >
          {children[currentIndex]}
          
          {/* 페이지 사이드 그림자 (정적) */}
          <Animated.View 
            style={[
              styles.staticShadow,
              {
                opacity: shadowValue
              }
            ]} 
          />
        </Animated.View>

        {/* 페이지 접힘 효과 (왼쪽 모서리) */}
        <Animated.View
          style={[
            styles.pageFold,
            {
              opacity: shadowValue,
              transform: [
                { translateX: position },
                {
                  rotateY: rotate.interpolate({
                    inputRange: [-30, 0],
                    outputRange: ['-50deg', '0deg'],
                  }),
                },
              ],
            },
          ]}
        />

        {/* 다음 페이지 (배경에 있는 페이지) */}
        {currentIndex < children.length - 1 && (
          <View style={[styles.page, { zIndex: 1 }]}>
            {children[currentIndex + 1]}
          </View>
        )}

        {/* 마지막 페이지 표시 */}
        {currentIndex === children.length - 1 && (
          <Animated.View
            style={[
              styles.lastPageIndicator,
              {
                opacity: shadowValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                })
              }
            ]}
          >
            <Text style={styles.lastPageText}>마지막 페이지입니다</Text>
          </Animated.View>
        )}

        {/* 이전 페이지 */}
        {currentIndex > 0 && (
          <View style={[styles.page, { zIndex: 0, display: 'none' }]}>
            {children[currentIndex - 1]}
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF2',
    overflow: 'hidden',
  },
  page: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  pageFold: {
    position: 'absolute',
    width: 20,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    right: 0,
    zIndex: 3,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  staticShadow: {
    position: 'absolute',
    left: -10,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  lastPageIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    zIndex: 4,
  },
  lastPageText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default CustomPageFlipper; 