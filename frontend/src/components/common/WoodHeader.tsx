// components/common/WoodHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';

interface WoodHeaderProps {
  title: string;
  showBack?: boolean;
  showShare?: boolean;
  showFontSelector?: boolean;
  onBack?: () => void;
  onShare?: () => void;
  onFontSelect?: () => void;
}

const WoodHeader: React.FC<WoodHeaderProps> = ({
  title,
  showBack = false,
  showShare = false,
  showFontSelector = false,
  onBack,
  onShare,
  onFontSelect,
}) => {
  return (
    <ImageBackground 
      source={require('../../../assets/images/common/wood.jpg')} 
      style={styles.header}
    >
      <View style={styles.headerContent}>
        {showBack && (
          <Pressable style={styles.iconButton} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
          </Pressable>
        )}
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.rightButtons}>
          {showFontSelector && (
            <Pressable style={styles.iconButton} onPress={onFontSelect}>
              <View style={styles.fontButton}>
                <Text style={styles.fontButtonText}>A</Text>
              </View>
            </Pressable>
          )}
        
        {showShare && (
          <Pressable style={styles.iconButton} onPress={onShare}>
            <MaterialCommunityIcons name="share-variant" size={24} color="white" />
          </Pressable>
        )}
        
          {!showShare && !showFontSelector && <View style={{width: 28}} />}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  iconButton: {
    padding: 8,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default WoodHeader;