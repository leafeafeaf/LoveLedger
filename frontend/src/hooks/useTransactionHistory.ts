import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { useDispatch } from 'react-redux';
import { setLoading, setError } from '../store/contentSlice';
import { Alert } from 'react-native';
import {TransactionHistory, TransactionChange } from "../types";

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
  setIsLoading: (isLoading: boolean) => void
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
      Alert.alert('오류', '거래 내역을 불러오는데 실패했습니다.');
      dispatch(setError('거래 내역 불러오기 실패'));
    },

    onSettled: () => {
      setIsLoading(false);
    }
  });
};

