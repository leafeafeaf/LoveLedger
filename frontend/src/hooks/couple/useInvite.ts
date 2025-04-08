import { useMutation } from "@tanstack/react-query";
import { useAppSelector, useAppDispatch } from "../reduxHooks";
import { axiosInstance } from "../../api/axios";
import { InviteSuccessResponse } from "../../types";
import {
  setInviteLink,
  startGenerateInviteLink,
  generateInviteLinkFailure,
} from "../../store/coupleSlice";

/**
 * 저장된 초대 링크 정보를 Redux 스토어에서 가져오는 훅
 *
 * @returns 저장된 초대 링크 정보와 로딩 상태
 */
export const useStoredInviteLink = () => {
  const {
    inviteLink,
    inviteLinkMessage,
    inviteLinkCreatedAt,
    inviteLinkExpiresAt,
    inviteCode,
    remainingHours,
    isLinkGenerating,
    error,
  } = useAppSelector((state) => state.couple);

  return {
    data: inviteLink
      ? {
          status: "200",
          message: inviteLinkMessage || "초대 링크가 생성되었습니다.",
          data: {
            link: inviteLink,
            inviteCode: inviteCode || undefined,
            createdAt: inviteLinkCreatedAt || undefined,
            expiresAt: inviteLinkExpiresAt || undefined,
            remainingHours: remainingHours || undefined,
          },
          timestamp: inviteLinkCreatedAt || new Date().toISOString(),
        }
      : null,
    isLoading: isLinkGenerating,
    error: error ? { message: error } : null,
  };
};

/**
 * 초대 링크를 생성하는 훅
 *
 * @returns 초대 링크 생성 뮤테이션 객체
 */
export const useGenerateInvite = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async () => {

      dispatch(startGenerateInviteLink());

      try {
        const response = await axiosInstance.get<InviteSuccessResponse>("/invite",);
        // Redux 스토어에 링크 정보 저장
        console.log(response.data)
        dispatch(setInviteLink(response.data));

        return response.data;
      } catch (error: any) {
        // 서버 응답이 없는 경우
        if (!error.response) {
          const errorMessage = "서버에 연결할 수 없습니다.";
          dispatch(generateInviteLinkFailure(errorMessage));
          throw new Error(errorMessage);
        }

        // 409 에러 (중복 링크) 처리 - 성공 응답으로 변환하여 기존 링크 활용
        if (error.response.status === 409) {
          const errorData = error.response.data;
          const response = {
            status: "200",
            message: "이미 활성화된 초대 링크가 있습니다.",
            data: {
              link: "이미 생성된 초대 링크가 있습니다. 관리자에게 문의하세요.",
            },
            timestamp: errorData.timestamp || new Date().toISOString(),
          } as InviteSuccessResponse;
          
          console.log(error)
          dispatch(setInviteLink(response));
          return response;
        }

        // 400 에러 (이미 연인과 연결) 처리
        if (error.response.status === 400) {
          const errorMessage =
            error.response.data.message || "이미 연인과 연결된 상태입니다.";
          dispatch(generateInviteLinkFailure(errorMessage));
          throw new Error(errorMessage);
        }

        // 기타 에러 처리
        const errorMessage = "초대 링크 생성 중 오류가 발생했습니다.";
        dispatch(generateInviteLinkFailure(errorMessage));
        throw new Error(errorMessage);
      }
    },
  });
};
