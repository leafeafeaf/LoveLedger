import React, { useState, useEffect } from 'react';
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

export default function GoalDetailScreen({ navigation, route }) {
  const { goal: initialGoal } = route.params;
  const [goal, setGoal] = useState(initialGoal);
  const [showAddProgressModal, setShowAddProgressModal] = useState(false);
  const [progressAmount, setProgressAmount] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Generate mock transactions based on current amount
    const mockTransactions = [];
    let remainingAmount = goal.current;
    
    // Create between 1 and 5 transactions
    const transactionCount = Math.max(1, Math.min(5, Math.floor(goal.current / 100000)));
    
    for (let i = 0; i < transactionCount; i++) {
      const isLast = i === transactionCount - 1;
      const amount = isLast ? remainingAmount : Math.floor(Math.random() * remainingAmount * 0.7);
      remainingAmount -= amount;
      
      mockTransactions.push({
        id: i.toString(),
        amount,
        date: new Date(Date.now() - (i * 86400000 * Math.floor(Math.random() * 10))).toISOString(),
        notes: i % 2 === 0 ? '월급 저축' : '보너스 저축'
      });
    }
    
    setTransactions(mockTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, [goal]);

  // Function to add progress
  const handleAddProgress = () => {
    const amount = parseInt(progressAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('알림', '유효한 금액을 입력해주세요.');
      return;
    }

    const newCurrent = goal.current + amount;
    setGoal(prev => ({
      ...prev,
      current: newCurrent
    }));

    // Add new transaction
    const newTransaction = {
      id: Date.now().toString(),
      amount,
      date: new Date().toISOString(),
      notes: '직접 추가'
    };
    setTransactions(prev => [newTransaction, ...prev]);

    setShowAddProgressModal(false);
    setProgressAmount('');

    // Check if goal is completed
    if (newCurrent >= goal.target) {
      Alert.alert('축하합니다!', '목표를 달성했습니다! 🎉');
    }
  };

  // Function to handle delete confirmation
  const handleDelete = () => {
    setShowDeleteModal(false);
    navigation.goBack();
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>목표 상세</Text>
        <Pressable 
          style={styles.headerButton} 
          onPress={() => setShowDeleteModal(true)}
        >
          <MaterialCommunityIcons name="delete" size={24} color={theme.colors.error} />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.goalOverview}>
          <View style={styles.goalHeader}>
            <View style={styles.goalIconContainer}>
              <MaterialCommunityIcons name={goal.icon} size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalDeadline}>
                마감일: {new Date(goal.deadline).toLocaleDateString('ko-KR')}
              </Text>
            </View>
          </View>
          
          <Text style={styles.goalDescription}>{goal.description}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${calculateProgress(goal.current, goal.target)}%` }
                ]}
              />
            </View>
            
            <View style={styles.progressDetails}>
              <Text style={styles.progressPercentage}>
                {calculateProgress(goal.current, goal.target)}% 달성
              </Text>
              <Text style={styles.progressAmount}>
                {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
              </Text>
              <Text style={styles.remainingAmount}>
                남은 금액: {formatCurrency(goal.target - goal.current)}
              </Text>
            </View>
          </View>

          <Pressable 
            style={styles.addProgressButton}
            onPress={() => setShowAddProgressModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color={theme.colors.white} />
            <Text style={styles.addProgressText}>진행 상황 업데이트</Text>
          </Pressable>
        </View>

        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>진행 내역</Text>
          
          {transactions.length > 0 ? (
            transactions.map(transaction => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <MaterialCommunityIcons name="cash-plus" size={24} color={theme.colors.success} />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionAmount}>{formatCurrency(transaction.amount)}</Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString('ko-KR')}
                  </Text>
                  {transaction.notes && (
                    <Text style={styles.transactionNotes}>{transaction.notes}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyTransactions}>아직 진행 내역이 없습니다.</Text>
          )}
        </View>
      </ScrollView>

      {/* Add Progress Modal */}
      <Modal
        visible={showAddProgressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddProgressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>진행 상황 업데이트</Text>
              <Pressable 
                style={styles.closeModalButton}
                onPress={() => setShowAddProgressModal(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>추가할 금액 (원)</Text>
              <TextInput
                style={styles.modalInput}
                value={progressAmount}
                onChangeText={setProgressAmount}
                placeholder="금액을 입력하세요"
                placeholderTextColor={theme.colors.textLight}
                keyboardType="number-pad"
                autoFocus
              />
              
              <Text style={styles.modalInfo}>
                현재 진행 상황: {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <Pressable 
                style={styles.cancelButton}
                onPress={() => setShowAddProgressModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>
              
              <Pressable 
                style={styles.confirmButton}
                onPress={handleAddProgress}
              >
                <Text style={styles.confirmButtonText}>추가</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.deleteModalContent]}>
            <Text style={styles.deleteModalTitle}>목표 삭제</Text>
            <Text style={styles.deleteModalText}>
              정말로 이 목표를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
            </Text>
            
            <View style={styles.deleteModalButtons}>
              <Pressable 
                style={[styles.deleteButton, styles.cancelDeleteButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelDeleteText}>취소</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.deleteButton, styles.confirmDeleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.confirmDeleteText}>삭제</Text>
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
  goalOverview: {
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  goalDeadline: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  goalDescription: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressDetails: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  progressAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  remainingAmount: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  addProgressButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  addProgressText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  transactionsSection: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.success}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  transactionDate: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginVertical: 2,
  },
  transactionNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    color: theme.colors.textLight,
  },
  emptyTransactions: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
    padding: theme.spacing.md,
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
  modalBody: {
    padding: theme.spacing.md,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalInput: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  modalInfo: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
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
  confirmButton: {
    flex: 2,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalContent: {
    padding: theme.spacing.lg,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  deleteModalText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelDeleteButton: {
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  confirmDeleteButton: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.error,
  },
  cancelDeleteText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmDeleteText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});