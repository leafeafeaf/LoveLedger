// components/library/SearchBar.tsx
import React from 'react';
import { View, TextInput, StyleSheet, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText }) => {
  return (
    <ImageBackground
      source={require('../../../assets/images/library/library_bg.png')}
      style={styles.container}
      imageStyle={{ borderRadius: 20 }}
    >
      <MaterialCommunityIcons name="magnify" size={20} color="white" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search"
        placeholderTextColor="rgba(255, 255, 255, 0.85)"
        value={value}
        onChangeText={onChangeText}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: -1, height: -1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    padding: 0,
    fontWeight: 'bold',
  },
});

export default SearchBar;