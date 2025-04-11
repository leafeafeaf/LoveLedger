import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

// Gradient 대신 평범한 View를 사용합니다
type GradientProps = {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
  style?: ViewStyle;
};

const Gradient: React.FC<GradientProps> = ({ style, colors, ...rest }) => {
  // 첫 번째 색상만 사용하거나 회색을 기본값으로 사용
  const backgroundColor = colors.length > 0 ? colors[0] : '#f0f0f0';
  
  return (
    <View
      style={[
        styles.gradient,
        { backgroundColor },
        style
      ]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
  }
});

export { Gradient };
