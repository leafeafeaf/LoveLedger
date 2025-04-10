import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "../reduxHooks";
import { axiosInstance } from "../../api/axios";
import {
  InviteValidateResponse,
  InviteValidateExpiredResponse,
  InviteValidateAlreadyLinkedResponse,
} from "../../types";

export type ValidateInviteError = {
  status: string;
  message: string;
  code?: string;
  data: any;
  timestamp: string;
};

export const useValidateInvite = (inviteCode: string, userId: string) => {

  return useQuery<InviteValidateResponse, ValidateInviteError>({
    queryKey: ["validateInvite", inviteCode, userId],
    queryFn: async () => {
      if (!inviteCode) {
        throw {
          status: "400",
          message: "초대 코드가 필요합니다.",
          data: null,
          timestamp: new Date().toISOString(),
        } as ValidateInviteError;
      }

      if (!userId) {
        throw {
          status: "400",
          message: "사용자 ID가 필요합니다.",
          data: null,
          timestamp: new Date().toISOString(),
        } as ValidateInviteError;
      }

      try {
        console.log("[useValidateInvite] API 요청 시작:", {
          url: `/invite/validate/${inviteCode}`,
          method: "GET",
          params: { userId },
        });

        const response = await axiosInstance.get<InviteValidateResponse>(
          `/invite/validate/${inviteCode}`,
          {
            params: {
              userId,
            },
          }
        );

        console.log(
          "[useValidateInvite] API 응답 성공:",
          JSON.stringify(response.data)
        );
        return response.data;
      } catch (error: any) {
        console.error("[useValidateInvite] API 응답 에러:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });

        // 서버 응답이 없는 경우
        if (!error.response) {
          throw {
            status: "500",
            message: "서버 연결에 실패했습니다.",
            data: null,
            timestamp: new Date().toISOString(),
          } as ValidateInviteError;
        }

        // 410 에러 (만료된 링크) 처리
        if (error.response.status === 410) {
          console.log(
            "[useValidateInvite] 만료된 링크 에러:",
            error.response.data
          );
          return error.response.data as ValidateInviteError;
        }

        // 400 에러 (이미 연인과 연결) 처리
        if (error.response.status === 400) {
          console.log(
            "[useValidateInvite] 이미 연결된 계정 에러:",
            error.response.data
          );
          return error.response.data as ValidateInviteError;
        }

        // 기타 에러 처리
        throw (error.response.data || {
          status: "500",
          message: "알 수 없는 오류가 발생했습니다.",
          data: null,
          timestamp: new Date().toISOString(),
        }) as ValidateInviteError;
      }
    },
    // 자동 실행되지 않도록 enabled 옵션 비활성화
    enabled: false,
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1분 동안 캐시 유지
  });
};
