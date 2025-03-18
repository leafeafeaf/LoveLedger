import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function CoverPreviewScreen({ navigation, route }) {
  const { settings, series, story, coverImage, coverStyle } = route.params;
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    navigation.navigate('StorySave', {
      settings,
      series,
      story,
      coverImage,
      coverStyle
    });
  };

  return (
    <View style={styles.container}>  <View style={styles.header}>
        <View style={styles.headerButtons}>          <Pressable 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.colors.text} />
          </Pressable>          <Pressable 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="close" size={28} color={theme.colors.text} />
          </Pressable>
        </View>
        <Text style={styles.title}>Cover Preview</Text>
        <Text style={styles.subtitle}>Review your book cover</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.coverPreviewContainer}>
          <Image 
            source={{ uri: coverImage }} 
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.coverOverlay}>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.seriesTitle}>{series.name}</Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <Pressable 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <MaterialCommunityIcons name="image-edit" size={20} color={theme.colors.primary} />
            <Text style={styles.editButtonText}>
              {isEditing ? 'Cancel Editing' : 'Modify Cover'}
            </Text>
          </Pressable>

          {isEditing && (
            <View style={styles.editingTools}>
              <Text style={styles.editingTitle}>Editing Tools</Text>
              <Text style={styles.editingHint}>
                In a full implementation, this area would contain tools to:
              </Text>
              <View style={styles.toolsList}>
                <View style={styles.toolItem}>
                  <MaterialCommunityIcons name="crop" size={20} color={theme.colors.text} />
                  <Text style={styles.toolText}>Crop Image</Text>
                </View>
                <View style={styles.toolItem}>
                  <MaterialCommunityIcons name="palette" size={20} color={theme.colors.text} />
                  <Text style={styles.toolText}>Adjust Colors</Text>
                </View>
                <View style={styles.toolItem}>
                  <MaterialCommunityIcons name="format-font" size={20} color={theme.colors.text} />
                  <Text style={styles.toolText}>Change Text Style</Text>
                </View>
                <View style={styles.toolItem}>
                  <MaterialCommunityIcons name="filter" size={20} color={theme.colors.text} />
                  <Text style={styles.toolText}>Apply Filters</Text>
                </View>
              </View>
              <Text style={styles.editingNote}>
                For this demo, we'll use the cover as-is when you continue.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Continue</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={theme.colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },  header: {
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.xl * 1.5,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
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
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  coverPreviewContainer: {
    aspectRatio: 0.75, // 3:4 ratio
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginVertical: theme.spacing.md,
    ...theme.shadows.medium,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  seriesTitle: {
    fontSize: 16,
    fontStyle: 'italic',
    color: theme.colors.white,
    opacity: 0.9,
  },
  optionsContainer: {
    marginTop: theme.spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    gap: theme.spacing.sm,
    ...theme.shadows.small,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  editingTools: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  editingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  editingHint: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  toolsList: {
    marginVertical: theme.spacing.md,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  toolText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  editingNote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
});