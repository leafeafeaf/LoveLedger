import { useQuery } from "@tanstack/react-query";
import { generateInviteLink } from "../api/invite";
import { InviteResponse, InviteErrorResponse } from "../types/invite";
import { validateInviteLink } from "../api/invite";
import { InviteValidateResponse } from "../types/invite";

/**
 * 초대 링크 생성을 위한 커스텀 훅
 * @returns query 객체 (data, isLoading, isError 등)
 */
export const useInviteLink = () => {
  return useQuery<InviteResponse, InviteErrorResponse>({
    queryKey: ["inviteLink"],
    queryFn: generateInviteLink,
    select: (response) => response,
    staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
    retry: false, // 에러 발생 시 재시도하지 않음
  });
};

/**
 * 초대 링크 검증을 위한 커스텀 훅
 * @param inviteCode 초대 코드
 * @param userId 사용자 ID
 * @returns query 객체 (data, isLoading, isError 등)
 */
export const useValidateInviteLink = (inviteCode: string, userId: string) => {
  return useQuery<InviteValidateResponse, InviteErrorResponse>({
    queryKey: ["inviteValidate", inviteCode, userId],
    queryFn: () => validateInviteLink(inviteCode, userId),
    select: (response) => response,
    enabled: !!inviteCode && !!userId, // inviteCode와 userId가 있을 때만 쿼리 실행
    staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
    retry: false, // 에러 발생 시 재시도하지 않음
  });
};
