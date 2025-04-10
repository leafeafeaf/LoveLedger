import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';

interface AccountInfo {
  accountId: string;
  bankCode: string;
  certedAt: string;
  amount: number;
  lastUpdated: string;
}

export const useAccountInfo = (): UseQueryResult<AccountInfo, Error> => {
    return useQuery<AccountInfo, Error>({
      queryKey: ['accountInfo'],
      queryFn: async () => {
        const response = await axiosInstance.get('/account/getzero');
        return response.data.data;
      },
    });
  };