import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { axiosInstance } from '../api/axios';
import { 
  fetchAccountDetailStart, 
  fetchAccountDetailSuccess, 
  fetchAccountDetailFailure 
} from '../store/financeSlice';

interface AccountDetailParams {
  year?: number;
  month?: number;
  day?: number;
  pageno?: number;
  size?: number;
  sort?: 'ASC' | 'DESC';
}

interface TransactionDetail {
  transactionId: string;
  date: string;
  time: string;
  remittance: boolean;
  targetName: string;
  afterAmount: number;
  amount: number;
  categoryName: string;
}

interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

interface AccountDetailResponse {
  content: TransactionDetail[];
  page: PageInfo;
}

export const useAccountDetail = (params: AccountDetailParams = {}) => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ['accountDetail', params],
    queryFn: async () => {
      dispatch(fetchAccountDetailStart());
      try {
        const response = await axiosInstance.get<AccountDetailResponse>(
          `/account/history/detail/list`,
          { params }
        );
        
        // API 응답에 accountNo 필드 추가
        const enrichedData = {
          ...response.data,
          content: response.data.content.map(transaction => ({
            ...transaction,
            accountNo: transaction.transactionId.split('-')[0] // 임시로 transactionId의 첫 부분을 accountNo로 사용
          }))
        };
        
        dispatch(fetchAccountDetailSuccess(enrichedData));
        return enrichedData;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '계좌 상세 내역을 불러오는데 실패했습니다.';
        dispatch(fetchAccountDetailFailure(errorMessage));
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000,   // 30분
  });
}; 