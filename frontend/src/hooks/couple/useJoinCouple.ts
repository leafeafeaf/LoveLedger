import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "../reduxHooks";
import { axiosInstance } from "../../api/axios";

interface ErrorResponseType {
  status: string;
  message: string;
  code?: string;
  data: null | { registeredAt?: string };
  timestamp: string;
}

export interface JoinCoupleResponse {
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

export const useJoinCouple = () => {
  const queryClient = useQueryClient();

  return useMutation<JoinCoupleResponse, ErrorResponseType, string>({
    mutationFn: async (inviteCode: string) => {
      console.log("[useJoinCouple] API 요청 시작:", {
        url: `/couple/join/${inviteCode}`,
        method: "POST",
      });

      try {
        const response = await axiosInstance.post<JoinCoupleResponse>(
          `/couple/join/${inviteCode}`,
          {}, // 빈 객체로 body 전달 (API 명세에 따름)
          {}
        );

        console.log("[useJoinCouple] API 응답 성공:", {
          status: response.status,
          data: response.data,
          timestamp: new Date().toISOString(),
        });

        return response.data;
      } catch (error: any) {
        console.error("[useJoinCouple] API 응답 에러:", {
          status: error.response?.status,
          message: error.response?.data?.message,
          code: error.response?.data?.code,
          data: error.response?.data?.data,
          timestamp: error.response?.data?.timestamp,
        });

        // 에러 응답 처리
        if (error.response) {
          const errorData = error.response.data;

          // 에러 타입별 처리
          switch (error.response.status) {
            case 409:
              if (errorData.data?.registeredAt) {
                console.error("[useJoinCouple] 이미 연동된 계정");
              } else {
                console.error("[useJoinCouple] 상대방이 이미 연동됨");
              }
              break;
            case 400:
              if (errorData.code === "I001") {
                console.error("[useJoinCouple] 자기자신과 연동 시도");
              }
              break;
          }

          throw errorData;
        }

        // 기타 에러
        throw {
          status: "500",
          message: "알 수 없는 오류가 발생했습니다.",
          data: null,
          timestamp: new Date().toISOString(),
        };
      }
    },
    onSuccess: () => {
      console.log("[useJoinCouple] 연동 성공 - 캐시 무효화");

      // 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["couple"],
      });
    },
  });
};
