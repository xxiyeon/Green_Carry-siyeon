import axios from "axios";
import { installMutationGuard } from "./mutationGuard";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKSERVER}`,
});

installMutationGuard(api);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          console.log("🔄 토큰 만료! 새 토큰 재발급 시도 중...");

          const res = await axios.post(
            `${import.meta.env.VITE_BACKSERVER}/member/refresh`,
            {
              refreshToken: refreshToken,
            },
          );

          if (res.status === 200) {
            const newAccessToken = res.data.accessToken;

            localStorage.setItem("accessToken", newAccessToken);
            console.log("✅ 토큰 재발급 성공!");

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error("❌ 리프레시 토큰 만료. 로그아웃 처리합니다.");
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
