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
        const response = await axiosInstance.get(`/account/history/detail/list`, { params });
        console.log('API 호출 시작 - 파라미터:', { params });
        console.log('API 응답:', response.data);

        // axios 인스턴스나 인터셉터가 응답 데이터를 언랩한 경우 response.data가 실제 데이터임.
        const data: AccountDetailResponse = response.data.content ? response.data : response.data.data;
        console.log('API 응답 데이터:', data.content);

        // 예시: transactionId의 첫 부분을 accountNo로 사용
        const enrichedData = {
          ...data,
          content: data.content.map(transaction => ({
            ...transaction,
            accountNo: transaction.transactionId.split('-')[0]
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
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
};
