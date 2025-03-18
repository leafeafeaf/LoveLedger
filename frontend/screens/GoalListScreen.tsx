import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function GoalListScreen({ navigation }) {
  const [goals, setGoals] = useState([
    {
      id: '1',
      title: '제주도 여행 자금',
      description: '신혼여행으로 제주도 여행 가기',
      target: 1000000,
      current: 450000,
      deadline: '2025-06-30',
      icon: 'airplane',
    },
    {
      id: '2',
      title: '결혼 자금 모으기',
      description: '결혼식과 신혼여행을 위한 자금',
      target: 5000000,
      current: 2500000,
      deadline: '2025-12-31',
      icon: 'ring',
    },
    {
      id: '3',
      title: '자동차 구매',
      description: '가족을 위한 자동차 구매',
      target: 20000000,
      current: 3000000,
      deadline: '2026-06-30',
      icon: 'car',
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '',
    deadline: '',
    icon: 'flag'
  });

  const handleAddGoal = () => {
    // Validation
    if (!newGoal.title.trim() || !newGoal.target) {
      Alert.alert('알림', '목표 이름과 금액을 입력해주세요.');
      return;
    }

    const goalToAdd = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description || '설명 없음',
      target: parseInt(newGoal.target) || 0,
      current: 0,
      deadline: newGoal.deadline || '2025-12-31',
      icon: newGoal.icon || 'flag',
    };

    setGoals(prev => [goalToAdd, ...prev]);
    setShowAddModal(false);
    setNewGoal({
      title: '',
      description: '',
      target: '',
      deadline: '',
      icon: 'flag'
    });
  };

  // Function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Function to calculate progress percentage
  const calculateProgress = (current, target) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  // Goal icons
  const goalIcons = [
    { id: 'flag', name: '일반 목표', icon: 'flag' },
    { id: 'home', name: '주택', icon: 'home' },
    { id: 'ring', name: '결혼', icon: 'ring' },
    { id: 'car', name: '자동차', icon: 'car' },
    { id: 'airplane', name: '여행', icon: 'airplane' },
    { id: 'school', name: '교육', icon: 'school' },
    { id: 'heart-pulse', name: '건강', icon: 'heart-pulse' },
    { id: 'shopping', name: '쇼핑', icon: 'shopping' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>목표 관리</Text>
        <Pressable 
          style={styles.headerButton} 
          onPress={() => setShowAddModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={28} color={theme.colors.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {goals.length > 0 ? (
          goals.map(goal => (
            <Pressable 
              key={goal.id} 
              style={styles.goalCard}
              onPress={() => navigation.navigate('GoalDetail', { goal })}
            >
              <View style={styles.goalHeader}>
                <View style={styles.goalIconContainer}>
                  <MaterialCommunityIcons name={goal.icon} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDescription} numberOfLines={1}>{goal.description}</Text>
                </View>
              </View>
              
              <View style={styles.goalProgressContainer}>
                <View style={styles.progressDetails}>
                  <Text style={styles.currentAmount}>{formatCurrency(goal.current)}</Text>
                  <Text style={styles.targetAmount}>목표: {formatCurrency(goal.target)}</Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { width: `${calculateProgress(goal.current, goal.target)}%` }
                    ]}
                  />
                </View>
                
                <Text style={styles.progressPercentage}>
                  {calculateProgress(goal.current, goal.target)}%
                </Text>
              </View>
              
              <View style={styles.goalFooter}>
                <Text style={styles.deadlineText}>
                  마감일: {new Date(goal.deadline).toLocaleDateString('ko-KR')}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textLight} />
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="flag-outline" size={60} color={theme.colors.textLight} />
            <Text style={styles.emptyStateText}>아직 목표가 없습니다</Text>
            <Text style={styles.emptyStateSubtext}>+ 버튼을 눌러 새 목표를 추가하세요</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>새 목표 추가</Text>
              <Pressable 
                style={styles.closeModalButton}
                onPress={() => setShowAddModal(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>목표 이름 *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newGoal.title}
                  onChangeText={(text) => setNewGoal(prev => ({ ...prev, title: text }))}
                  placeholder="목표 이름을 입력하세요"
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>설명</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newGoal.description}
                  onChangeText={(text) => setNewGoal(prev => ({ ...prev, description: text }))}
                  placeholder="목표에 대한 설명을 입력하세요"
                  placeholderTextColor={theme.colors.textLight}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>목표 금액 (원) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newGoal.target}
                  onChangeText={(text) => setNewGoal(prev => ({ ...prev, target: text }))}
                  placeholder="목표 금액을 입력하세요"
                  placeholderTextColor={theme.colors.textLight}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>마감일</Text>
                <TextInput
                  style={styles.textInput}
                  value={newGoal.deadline}
                  onChangeText={(text) => setNewGoal(prev => ({ ...prev, deadline: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>아이콘 선택</Text>
                <View style={styles.iconGrid}>
                  {goalIcons.map(iconItem => (
                    <Pressable 
                      key={iconItem.id}
                      style={[
                        styles.iconOption,
                        newGoal.icon === iconItem.icon && styles.selectedIconOption
                      ]}
                      onPress={() => setNewGoal(prev => ({ ...prev, icon: iconItem.icon }))}
                    >
                      <MaterialCommunityIcons 
                        name={iconItem.icon} 
                        size={24} 
                        color={newGoal.icon === iconItem.icon ? theme.colors.white : theme.colors.primary} 
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable 
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>
              
              <Pressable 
                style={styles.addButton}
                onPress={handleAddGoal}
              >
                <Text style={styles.addButtonText}>추가</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.xl * 1.5,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  goalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  goalDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  goalProgressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  targetAmount: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressPercentage: {
    fontSize: 14,
    color: theme.colors.textLight,
    alignSelf: 'flex-end',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  deadlineText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxHeight: '80%',
    ...theme.shadows.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeModalButton: {
    padding: theme.spacing.xs,
  },
  modalForm: {
    padding: theme.spacing.md,
  },
  formField: {
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  selectedIconOption: {
    backgroundColor: theme.colors.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 2,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});