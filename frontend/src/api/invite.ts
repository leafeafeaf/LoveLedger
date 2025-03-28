import { axiosInstance } from "./axios";
import { InviteResponse, InviteValidateResponse } from "../types/invite";

/**
 * 초대 링크 생성 API
 * @returns API 응답
 */
export const generateInviteLink = async () => {
  const { data } = await axiosInstance.get<InviteResponse>("/invite");
  return data;
};

/**
 * 초대 링크 검증 API
 * @param inviteCode 초대 코드
 * @param userId 사용자 ID
 * @returns API 응답
 */
export const validateInviteLink = async (
  inviteCode: string,
  userId: string
) => {
  const { data } = await axiosInstance.get<InviteValidateResponse>(
    `/invite/validate/${inviteCode}`,
    {
      params: { userId },
    }
  );
  return data;
};
