import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { Transaction, TransactionStackScreenProps } from "../../types";
import Header from "../../components/common/Header";
import { useTransactionUpdate } from "@hooks/useTransactionUpdate";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useTransactionDelete } from "@hooks/useTransactionDelete";

export default function TransactionEditScreen({
  navigation,
  route,
}: TransactionStackScreenProps<"TransactionEdit">) {
  const { transaction } = route.params;
  const [editedTransaction, setEditedTransaction] = useState<Transaction>({
    ...transaction,
  });
  const { transactionUpdate, transactionDelete } = useSelector((state: RootState) => state.finance);
  const updateMutation = useTransactionUpdate();
  const deleteMutation = useTransactionDelete();

  const handleSave = async () => {
    if (!editedTransaction.targetname?.trim()) {
      Alert.alert('오류', '상호명을 입력해주세요.');
      return;
    }

    if (!editedTransaction.transactionid || !editedTransaction.accountNo) {
      Alert.alert('오류', '거래 정보가 올바르지 않습니다.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        transactionId: editedTransaction.transactionid,
        accountNo: editedTransaction.accountNo,
        updatedTargetName: editedTransaction.targetname.trim(),
      });
      
      Alert.alert('성공', '거래 내역이 수정되었습니다.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('오류', error.message);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '삭제 확인',
      '이 거래 내역을 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(editedTransaction.transactionid);
              Alert.alert('성공', '거래 내역이 삭제되었습니다.');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('오류', error.message);
            }
          },
        },
      ]
    );
  };

  if (transactionUpdate.isLoading || transactionDelete.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Edit Transaction"
        subtitle="Modify transaction details"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Store/Target Name</Text>
          <TextInput
            style={styles.input}
            value={editedTransaction.targetname}
            onChangeText={(text) =>
              setEditedTransaction((prev) => ({ ...prev, targetname: text }))
            }
            placeholder="Enter store name"
            maxLength={16}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={String(editedTransaction.amount)}
            onChangeText={(text) =>
              setEditedTransaction((prev) => ({
                ...prev,
                amount: parseInt(text) || 0,
              }))
            }
            keyboardType="numeric"
            placeholder="Enter amount"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={editedTransaction.category}
            onChangeText={(text) =>
              setEditedTransaction((prev) => ({ ...prev, category: text }))
            }
            placeholder="Enter category"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Transaction Type</Text>
          <View style={styles.typeSelector}>
            <Pressable
              style={[
                styles.typeOption,
                !editedTransaction.remittance && styles.selectedTypeOption,
              ]}
              onPress={() =>
                setEditedTransaction((prev) => ({ ...prev, remittance: false }))
              }
            >
              <MaterialCommunityIcons
                name="bank-plus"
                size={24}
                color={
                  !editedTransaction.remittance
                    ? theme.colors.white
                    : theme.colors.primary
                }
              />
              <Text
                style={[
                  styles.typeText,
                  !editedTransaction.remittance && styles.selectedTypeText,
                ]}
              >
                Income
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.typeOption,
                editedTransaction.remittance && styles.selectedTypeOption,
              ]}
              onPress={() =>
                setEditedTransaction((prev) => ({ ...prev, remittance: true }))
              }
            >
              <MaterialCommunityIcons
                name="bank-minus"
                size={24}
                color={
                  editedTransaction.remittance
                    ? theme.colors.white
                    : theme.colors.primary
                }
              />
              <Text
                style={[
                  styles.typeText,
                  editedTransaction.remittance && styles.selectedTypeText,
                ]}
              >
                Expense
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Transaction Time</Text>
          <TextInput
            style={styles.input}
            value={
              editedTransaction.time?.split("T")[1].substring(0, 5) || "00:00"
            }
            onChangeText={(text) => {
              const [hours, minutes] = text.split(":");
              const currentDate =
                editedTransaction.time?.split("T")[0] ||
                new Date().toISOString().split("T")[0];
              const newTime =
                currentDate + `T${hours || "00"}:${minutes || "00"}:00`;
              setEditedTransaction((prev) => ({ ...prev, time: newTime }));
            }}
            placeholder="HH:MM"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <MaterialCommunityIcons
            name="delete"
            size={24}
            color={theme.colors.error}
          />
        </Pressable>

        <Pressable 
          style={[
            styles.saveButton,
            transactionUpdate.isLoading && styles.saveButtonDisabled
          ]} 
          onPress={handleSave}
          disabled={transactionUpdate.isLoading}
        >
          <MaterialCommunityIcons
            name="content-save"
            size={24}
            color={theme.colors.white}
          />
          <Text style={styles.saveButtonText}>
            {transactionUpdate.isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: 16,
    color: theme.colors.text,
    ...theme.shadows.small,
  },
  typeSelector: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    gap: theme.spacing.sm,
    ...theme.shadows.small,
  },
  selectedTypeOption: {
    backgroundColor: theme.colors.primary,
  },
  typeText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  selectedTypeText: {
    color: theme.colors.white,
  },
  footer: {
    flexDirection: "row",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    gap: theme.spacing.md,
    ...theme.shadows.medium,
  },
  deleteButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.error,
    ...theme.shadows.small,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    gap: theme.spacing.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
});
