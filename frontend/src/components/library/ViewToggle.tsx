// components/library/ViewToggle.tsx
import React from 'react';
import { View, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';

interface ViewToggleProps {
  activeView: 'album' | 'list';
  onToggle: (view: 'album' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ activeView, onToggle }) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.toggleButton, activeView === 'album' ? styles.activeButton : styles.inactiveButton]}
        onPress={() => onToggle('album')}
      >
        <ImageBackground
          source={
            activeView === 'album'
              ? require('../../../assets/images/library/library_bg.png')
              : require('../../../assets/images/library/library_bg2.png')
          }
          style={styles.buttonBg}
          imageStyle={{ borderRadius: 4 }}
        >
          <MaterialCommunityIcons
            name="view-grid"
            size={20}
            color={activeView === 'album' ? 'white' : theme.colors.primary}
          />
        </ImageBackground>
      </Pressable>
      
      <Pressable
        style={[styles.toggleButton, activeView === 'list' ? styles.activeButton : styles.inactiveButton]}
        onPress={() => onToggle('list')}
      >
        <ImageBackground
          source={
            activeView === 'list'
              ? require('../../../assets/images/library/library_bg.png')
              : require('../../../assets/images/library/library_bg2.png')
          }
          style={styles.buttonBg}
          imageStyle={{ borderRadius: 4 }}
        >
          <MaterialCommunityIcons
            name="view-list"
            size={20}
            color={activeView === 'list' ? 'white' : theme.colors.primary}
          />
        </ImageBackground>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 4,
  },
  buttonBg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  inactiveButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
    transform: [{ translateY: -2 }]
  }
});

export default ViewToggle;