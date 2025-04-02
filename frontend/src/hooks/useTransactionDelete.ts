import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { axiosInstance } from '../api/axios';
import { 
  deleteTransactionStart, 
  deleteTransactionSuccess, 
  deleteTransactionFailure 
} from '../store/financeSlice';

interface DeleteTransactionResponse {
  status: string;
  message: string;
  data: null;
  timestamp: string;
  code?: string;
}

export const useTransactionDelete = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation<DeleteTransactionResponse, Error, string>({
    mutationFn: async (transactionId: string) => {
      dispatch(deleteTransactionStart());
      try {
        const response = await axiosInstance.delete<DeleteTransactionResponse>(
          `/account/history/detail/${transactionId}`
        );
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          if (error.response?.data?.code === 'A001') {
            throw new Error('요청한 계좌를 찾을 수 없습니다.');
          } else if (error.response?.data?.code === 'T001') {
            throw new Error('해당 거래 내역을 찾을 수 없습니다.');
          }
        } else if (error.response?.status === 409) {
          throw new Error('해당 거래 내역은 이미 삭제되었습니다.');
        }
        throw new Error('거래 내역 삭제에 실패했습니다.');
      }
    },
    onSuccess: (_, transactionId) => {
      dispatch(deleteTransactionSuccess(transactionId));
      queryClient.invalidateQueries({ queryKey: ['accountDetail'] });
    },
    onError: (error) => {
      dispatch(deleteTransactionFailure(error.message));
    },
  });
}; 