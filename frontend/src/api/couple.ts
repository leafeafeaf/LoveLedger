import { axiosInstance } from "./axios";
import { CoupleJoinResponse, CoupleUnlinkResponse } from "../types/couple";

/**
 * 부부 연동 API
 * @param inviteCode 초대 코드
 * @returns API 응답
 */
export const joinCouple = async (inviteCode: string) => {
  const { data } = await axiosInstance.post<CoupleJoinResponse>(
    `/couple/join/${inviteCode}`
  );
  return data;
};

/**
 * 부부 연동 해제 API
 * @param coupleId 커플 ID
 * @returns API 응답
 */
export const unlinkCouple = async (coupleId: string) => {
  const { data } = await axiosInstance.delete<CoupleUnlinkResponse>(
    `/couple/${coupleId}`
  );
  return data;
};
