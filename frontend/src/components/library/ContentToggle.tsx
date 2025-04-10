// components/library/ContentToggle.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { theme } from '../../utils/theme';

interface ContentToggleProps {
  activeContent: 'diaries' | 'stories';
  onToggle: (content: 'diaries' | 'stories') => void;
}

const ContentToggle: React.FC<ContentToggleProps> = ({ activeContent, onToggle }) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, activeContent === 'diaries' ? styles.activeButton : styles.inactiveButton]}
        onPress={() => onToggle('diaries')}
      >
        <ImageBackground
          source={
            activeContent === 'diaries'
              ? require('../../../assets/images/library/library_bg2.png')
              : require('../../../assets/images/library/library_bg.png')
          }
          style={styles.buttonBg}
          imageStyle={{ borderRadius: 20 }}
        >
          <Text 
            style={[
              styles.buttonText, 
              activeContent === 'diaries' ? styles.activeButtonText : styles.inactiveButtonText
            ]}
          >
            Diaries
          </Text>
        </ImageBackground>
      </Pressable>
      
      <Pressable
        style={[styles.button, activeContent === 'stories' ? styles.activeButton : styles.inactiveButton]}
        onPress={() => onToggle('stories')}
      >
        <ImageBackground
          source={
            activeContent === 'stories'
              ? require('../../../assets/images/library/library_bg2.png')
              : require('../../../assets/images/library/library_bg.png')
          }
          style={styles.buttonBg}
          imageStyle={{ borderRadius: 20 }}
        >
          <Text 
            style={[
              styles.buttonText, 
              activeContent === 'stories' ? styles.activeButtonText : styles.inactiveButtonText
            ]}
          >
            Stories
          </Text>
        </ImageBackground>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  button: {
    flex: 1,
    height: 40,
    marginHorizontal: 4,
    borderRadius: 20,
    // overflow: 'hidden',
  },
  buttonBg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeButton: {
    shadowColor: '#000',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  inactiveButton: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    transform: [{ translateY: -2 }]
  },
  activeButtonText: {
    color: theme.colors.primary,
  },
  inactiveButtonText: {
    color: 'white',
  }
});

export default ContentToggle;