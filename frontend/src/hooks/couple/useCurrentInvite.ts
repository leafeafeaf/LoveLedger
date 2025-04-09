import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../api/axios";

interface CurrentInviteResponse {
  status: number;
  data: {
    link: string;
    inviteCode: string;
    createdAt: string;
    expiresAt: string;
    remainingHours: number;
  };
  timestamp: string;
  success: boolean;
}

interface CurrentInviteError {
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

/**
 * 현재 활성화된 초대 링크를 조회하는 Hook
 *
 * @returns 초대 링크 정보를 조회하는 쿼리 객체
 */
export const useCurrentInvite = () => {

  return useQuery<CurrentInviteResponse, CurrentInviteError>({
    queryKey: ["currentInvite"],
    queryFn: async () => {

      try {
        const response = await axiosInstance.get<CurrentInviteResponse>(
          "/invite/current"
        );
        console.log(response.data)
        return response.data;
      } catch (error: any) {
        // 서버 응답이 없는 경우
        if (!error.response) {
          throw {
            status: 500,
            message: "서버 연결에 실패했습니다.",
            data: null,
            timestamp: new Date().toISOString(),
          } as CurrentInviteError;
        }

        // 404 에러 (링크 없음) 처리
        if (error.response.status === 404) {
          throw {
            status: 404,
            message: "생성된 초대 링크가 없습니다.",
            data: null,
            timestamp: new Date().toISOString(),
          } as CurrentInviteError;
        }

        // 기타 에러 처리
        throw (error.response.data || {
          status: 500,
          message: "알 수 없는 오류가 발생했습니다.",
          data: null,
          timestamp: new Date().toISOString(),
        }) as CurrentInviteError;
      }
    },
    enabled: true,
    staleTime: 0,
    retry: 1,         // 실패 시 한 번만 재시도 (기본은 3회)
  });
};
