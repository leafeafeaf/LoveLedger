import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";

interface DiaryQueryParams {
  pageno?: number;
  size?: number;
  sort?: "ASC" | "DESC";
}

export const useDiaryListQuery = (params: DiaryQueryParams) => {
  return useQuery({
    queryKey: ["diary", params],
    queryFn: async () => {
      const response = await axiosInstance.get("/diary", {
        params: {
          pageno: params.pageno || 1,
          size: params.size || 20,
          sort: params.sort || "DESC",
        },
      });
      return response.data.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
};
