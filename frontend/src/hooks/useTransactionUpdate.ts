import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { axiosInstance } from '../api/axios';
import { 
  updateTransactionStart, 
  updateTransactionSuccess, 
  updateTransactionFailure 
} from '../store/financeSlice';

interface UpdateTransactionParams {
  transactionId: string;
  accountNo: string;
  updatedTargetName: string;
}

interface UpdateTransactionResponse {
  transactionId: string;
  updatedTargetName: string;
}

export const useTransactionUpdate = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation<UpdateTransactionResponse, Error, UpdateTransactionParams>({
    mutationFn: async ({ transactionId, accountNo, updatedTargetName }) => {
      dispatch(updateTransactionStart());
      try {
        const response = await axiosInstance.put<UpdateTransactionResponse>(
          `/api/v1/accounts/${accountNo}/transactions/${transactionId}`,
          { targetName: updatedTargetName }
        );
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          throw new Error('거래 내역을 찾을 수 없습니다.');
        }
        throw new Error('거래 내역 수정에 실패했습니다.');
      }
    },
    onSuccess: (data) => {
      dispatch(updateTransactionSuccess(data));
      queryClient.invalidateQueries({ queryKey: ['accountDetail'] });
    },
    onError: (error) => {
      dispatch(updateTransactionFailure(error.message));
    },
  });
}; 