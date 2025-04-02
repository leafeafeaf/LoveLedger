import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";

interface Fiction {
  title: string;
  arturl: string;
  createat: string;
}

interface Series {
  seriesid: number;
  seriesname: string;
  fictions: Fiction[];
}

interface FictionListResponse {
  status: string;
  message: string;
  data: {
    series: Series[];
  } | null;
  timestamp: string;
}

interface FictionListParams {
  pageno?: number;
  size?: number;
  sort?: string;
}

const fetchFictionList = async (params?: FictionListParams): Promise<FictionListResponse> => {
  const response = await axiosInstance.get("/fiction", {
    params: {
      pageno: params?.pageno || 1,
      size: params?.size || 15,
      sort: params?.sort || "DESC",
    },
  });
  return response.data;
};

export const useFictionList = (params?: FictionListParams) => {
  return useQuery({
    queryKey: ["fictions", params],
    queryFn: () => fetchFictionList(params),
    select: (data) => {
      if (!data.data?.series) {
        return {
          series: [],
          message: data.message,
        };
      }
      return {
        series: data.data.series,
        message: data.message,
      };
    },
  });
}; 