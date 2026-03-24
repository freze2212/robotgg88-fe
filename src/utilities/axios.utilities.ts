import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { DateTime } from 'luxon';
const Cookie = require("js-cookie");
const token = Cookie.get("access_token");
const baseURL = process.env.REACT_APP_URL_API;

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token} `,
    "accept": "*/*",
  },
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

export const getUserProfile = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/users/current");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFormattedTime = () => {
  return DateTime.now()
    .setZone('Asia/Ho_Chi_Minh')
    .toFormat('dd-MM-yyyy HH:mm:ss');
};