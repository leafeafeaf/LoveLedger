import React from 'react';
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

export default function StorySaveScreen({ navigation, route }) {
  const { settings, series, story, coverImage } = route.params;

  const handleSave = () => {
    // In a real app, you would save the story to your database here
    navigation.navigate('Library');
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
        <Text style={styles.title}>Save Story</Text>
        <Text style={styles.subtitle}>Review and save your story</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.previewContainer}>
          <View style={styles.bookPreview}>
            <Image 
              source={{ uri: coverImage }} 
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>
          
          <View style={styles.storyInfo}>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.seriesName}>{series.name}</Text>
            <Text style={styles.storyTheme}>
              Theme: {settings.themeStyle.charAt(0).toUpperCase() + settings.themeStyle.slice(1)}
            </Text>
            <Text style={styles.storyPeriod}>
              Period: {settings.period.charAt(0).toUpperCase() + settings.period.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Story Preview</Text>
          <Text style={styles.summaryText}>
            {story.content.substring(0, 200)}...
          </Text>
          <Pressable style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Read Full Story</Text>
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Your story will be saved to the Library, where you can access it anytime. It will be part of the {series.name} series.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={styles.editButton}
          onPress={() => navigation.navigate('StorySettings')}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
        
        <Pressable 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <MaterialCommunityIcons name="content-save" size={20} color={theme.colors.white} />
          <Text style={styles.saveButtonText}>Save</Text>
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
  previewContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  bookPreview: {
    width: 120,
    height: 160,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  storyInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  seriesName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  storyTheme: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  storyPeriod: {
    fontSize: 14,
    color: theme.colors.text,
  },
  summaryContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  readMoreButton: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.md,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
    gap: theme.spacing.md,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    gap: theme.spacing.sm,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    gap: theme.spacing.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
});