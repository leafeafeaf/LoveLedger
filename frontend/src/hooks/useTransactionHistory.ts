import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { useDispatch } from 'react-redux';
import { setLoading, setError } from '../store/contentSlice';
import { Alert } from 'react-native';
import {TransactionHistory, TransactionChange } from "../types";
import { StackActions } from "@react-navigation/native";


interface TransactionHistoryResponse {
  status: number;
  data: {
    history: TransactionHistory[];
  };
  timestamp: string;
  success: boolean;
}

export const useTransactionHistory = (
  diaryId: string,
  setChanges: (changes: TransactionChange[]) => void,
  setIsLoading: (isLoading: boolean) => void,
  navigation: any
) => {
  const dispatch = useDispatch();

  return useMutation<void, unknown, void>({
    mutationFn: async () => {
      console.log("일기 기반 수정 내역 불러오기 API 호출 "+diaryId)
      
      const response = await axiosInstance.post<TransactionHistoryResponse>(
        `/diary/${diaryId}/history`
      );

      const history = response.data.data.history;

      const transactionChanges: TransactionChange[] = history.map((item) => ({
        original: item,
        modified: {
          ...item,
          targetname: item.updatedTargetName ?? item.targetname, // null이면 원래 이름 사용
          amount: item.amount,
        },
        isSelected: true,
      }));

      setChanges(transactionChanges);
    },

    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(setError(null));
    },

    onSuccess: () => {
      dispatch(setLoading(false));
    },

    onError: (error) => {
      dispatch(setLoading(false));
      console.log(error)
      Alert.alert("",'수정할 거래 내역이 없습니다.');
      dispatch(setError('거래 내역 불러오기 실패'));
      navigation.dispatch(StackActions.replace("Main"));
    },

    onSettled: () => {
      setIsLoading(false);
    }
  });
};

