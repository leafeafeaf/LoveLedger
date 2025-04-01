import axios from "axios";
import {
  AccountVerifyRequest,
  AccountVerifyResponse,
  AccountVerifyConfirmRequest,
  AccountVerifyConfirmResponse,
} from "../types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const verifyAccount = async (
  data: AccountVerifyRequest,
  token: string
): Promise<AccountVerifyResponse> => {
  const response = await axios.post(
    `${BASE_URL}/account/verify/request`,
    data,
    {
      headers: {
        "Content-Type": "application/json; charset=utf8",
        Authorization: token,
      },
    }
  );
  return response.data;
};

export const confirmAccountVerification = async (
  data: AccountVerifyConfirmRequest,
  token: string
): Promise<AccountVerifyConfirmResponse> => {
  const response = await axios.post(
    `${BASE_URL}/account/verify/confirm`,
    data,
    {
      headers: {
        "Content-Type": "application/json; charset=utf8",
        Authorization: token,
      },
    }
  );
  return response.data;
};
