import { axiosInstance } from "./axios";

import {
  AccountVerifyRequest,
  AccountVerifyResponse,
  AccountVerifyConfirmRequest,
  AccountVerifyConfirmResponse,
} from "../types";

export const verifyAccount = async (
  data: AccountVerifyRequest,
  token: string
): Promise<AccountVerifyResponse> => {
  const response = await axiosInstance.post("/account/verify/request", data)
  return response.data;
};

export const confirmAccountVerification = async (
  data: AccountVerifyConfirmRequest,
  token: string
): Promise<AccountVerifyConfirmResponse> => {
  const response = await axiosInstance.post("/account/verify/confirm", data)
  return response.data;
};
