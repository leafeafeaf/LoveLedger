import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';

interface FictionDetailResponse {
  status: number;
  message: string;
  data: {
    createdAt: string;
    arturl: string;
    content: string;
    title: string;
  } | null;
  timestamp: string;
}

export const useFictionDetail = (fictionId: string) => {
  const queryOptions: UseQueryOptions<FictionDetailResponse, Error> = {
    queryKey: ['fiction', fictionId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/fiction/${fictionId}`);
      return response.data;
    },
    enabled: !!fictionId,
    retry: false,
  };

  return useQuery(queryOptions);
}; 