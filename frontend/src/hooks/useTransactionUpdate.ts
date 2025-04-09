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
  updatedTargetName: string;
}

interface UpdateTransactionResponse {
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

export const useTransactionUpdate = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation<UpdateTransactionResponse, Error, UpdateTransactionParams>({
    mutationFn: async ({ transactionId, updatedTargetName }) => {
      try {
        const response = await axiosInstance.put(`/account/history/${transactionId}`, {
          updatedTargetName
        });
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          const errorCode = error.response.data.errorCode;
          if (errorCode === "A001") {
            throw new Error("계좌를 찾을 수 없습니다.");
          } else if (errorCode === "T001") {
            throw new Error("거래 내역을 찾을 수 없습니다.");
          }
        }
        throw new Error(error.response?.data?.message || "거래 내역 수정에 실패했습니다.");
      }
    },
    onMutate: () => {
      dispatch(updateTransactionStart());
    },
    onSuccess: (data) => {
      dispatch(updateTransactionSuccess(data));
      queryClient.invalidateQueries({ queryKey: ["accountDetail"] });
    },
    onError: (error) => {
      dispatch(updateTransactionFailure(error.message));
    },
  });
}; 