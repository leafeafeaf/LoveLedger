// components/common/BlinkingText.tsx
import React, { useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet, TextStyle } from 'react-native';

interface BlinkingTextProps {
  text: string;
  style?: TextStyle;
  blinkInterval?: number;
}

const BlinkingText: React.FC<BlinkingTextProps> = ({ 
  text, 
  style, 
  blinkInterval = 800 
}) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: blinkInterval,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: blinkInterval,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();

    return () => {
      animation.stop();
    };
  }, [blinkInterval]);

  return (
    <Animated.Text style={[styles.text, style, { opacity }]}>
      {text}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
});

export default BlinkingText;