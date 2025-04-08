import { useQuery } from "@tanstack/react-query";
import { useAppSelector, useAppDispatch } from "../reduxHooks";
import { axiosInstance } from "../../api/axios";
import { setExtendedInviteLink } from "../../store/coupleSlice";

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
  const accessToken = useAppSelector((state) => state.auth.userToken);
  const userId = useAppSelector((state) => state.auth.userInfo?.id);
  const dispatch = useAppDispatch();

  return useQuery<CurrentInviteResponse, CurrentInviteError>({
    queryKey: ["currentInvite", userId],
    queryFn: async () => {
      if (!accessToken) {
        throw {
          status: 401,
          message: "인증 토큰이 없습니다.",
          data: null,
          timestamp: new Date().toISOString(),
        } as CurrentInviteError;
      }

      if (!userId) {
        throw {
          status: 400,
          message: "사용자 ID가 필요합니다.",
          data: null,
          timestamp: new Date().toISOString(),
        } as CurrentInviteError;
      }

      try {
        const response = await axiosInstance.get<CurrentInviteResponse>(
          "/invite/current",
          {
            headers: {
              Authorization: accessToken,
              "Content-Type": "application/json; charset=utf8",
            },
            params: {
              userId,
            },
          }
        );

        // 성공적으로 데이터를 가져왔다면 Redux 스토어에 저장
        if (response.data.success) {
          dispatch(
            setExtendedInviteLink({
              status: response.data.status.toString(),
              message: "초대 링크가 조회되었습니다.",
              data: {
                link: response.data.data.link,
                inviteCode: response.data.data.inviteCode,
                createdAt: response.data.data.createdAt,
                expiresAt: response.data.data.expiresAt,
                remainingHours: response.data.data.remainingHours,
              },
              timestamp: response.data.timestamp,
              success: response.data.success,
            })
          );
        }

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
    enabled: !!accessToken && !!userId,
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1분 동안 캐시 유지
  });
};
