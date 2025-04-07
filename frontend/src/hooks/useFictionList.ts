import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";

interface Fiction {
  fictionId: number;
  title: string;
  artUrl: string;
  createdAt: string;
}

interface Series {
  seriesId: number;
  seriesName: string;
  fictions: Fiction[];
}

interface FictionListResponse {
  status: string;
  data: {
    series: Series[];
  } | null;
  timestamp: string;
  success: boolean;
}
interface FictionListParams {
  pageno?: number;
  size?: number;
  sort?: string;
}

const fetchFictionList = async (params?: FictionListParams): Promise<FictionListResponse> => {
  console.log("소설 불러오기");

  const response = await axiosInstance.get("/fictions", {
    params: {
      pageno: params?.pageno || 1,
      size: params?.size || 15,
      sort: params?.sort || "DESC",
    },
  });

  // console.log(response)

  return response.data.data;
};

export const useFictionList = (params?: FictionListParams) => {
  return useQuery({
    queryKey: ["fictions", params],
    queryFn: () => fetchFictionList(params),
    select: (data) => {
      if (!data.data?.series) {
        return {
          series: [],
          message: "데이터가 안들어옴",
        };
      }
      return {
        series: data.data.series,
        message: "데이터가 성공적으로 들어옴",
      };
    },
  });
}; 