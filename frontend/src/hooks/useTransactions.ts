import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { useDispatch } from 'react-redux';
import { 
  fetchTransactionsStart, 
  fetchTransactionsSuccess, 
  fetchTransactionsFailure 
} from '../store/financeSlice';
import type { Transaction } from '../types';

interface TransactionsResponse {
  data: Transaction[];
}

export const useTransactions = () => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      dispatch(fetchTransactionsStart());
      try {
        const response = await axiosInstance.get<TransactionsResponse>('/account/history');
        dispatch(fetchTransactionsSuccess(response.data.data));
        return response.data;
      } catch (error) {
        dispatch(fetchTransactionsFailure(error instanceof Error ? error.message : '거래 내역을 불러오는데 실패했습니다.'));
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
  });
}; 