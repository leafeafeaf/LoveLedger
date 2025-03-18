import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  rightElement?: React.ReactNode;
}

export default function Header({ 
  title, 
  subtitle, 
  showBack = true, 
  showClose = true,
  onBack,
  onClose,
  rightElement
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerButtons}>
        {showBack && (
          <Pressable 
            style={styles.headerButton} 
            onPress={onBack}
          >
            <MaterialCommunityIcons 
              name="arrow-left" 
              size={28} 
              color={theme.colors.text} 
            />
          </Pressable>
        )}
        {showClose && (
          <Pressable 
            style={styles.headerButton} 
            onPress={onClose}
          >
            <MaterialCommunityIcons 
              name="close" 
              size={28} 
              color={theme.colors.text} 
            />
          </Pressable>
        )}
        {rightElement}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({  header: {
    backgroundColor: theme.colors.white,
    marginTop: 20,
    paddingTop: theme.spacing.xl * 1.5,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.md,
    position: 'absolute',
    right: theme.spacing.md,
    top: theme.spacing.xl * 1.5,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
});