import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "../reduxHooks";
import { axiosInstance } from "../../api/axios";

interface ErrorResponseType {
  status: string;
  message: string;
  data: null;
  timestamp: string;
}

export interface UnlinkCoupleResponse {
  data: null;
  message: string;
}

export const useUnlinkCouple = () => {
  const queryClient = useQueryClient();
  const userToken = useAppSelector((state) => state.auth.userToken);

  return useMutation<UnlinkCoupleResponse, ErrorResponseType, number, unknown>({
    mutationFn: async (coupleId: number) => {
      const response = await axiosInstance.delete<UnlinkCoupleResponse>(
        `/couple/${coupleId}`,
        {
          headers: {
            "Content-Type": "application/json; charset=utf8",
            Authorization: userToken,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["couple"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userDetail"],
      });
    },
  });
};
