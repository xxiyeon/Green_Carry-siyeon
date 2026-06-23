import React, { createContext, useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logoutTimerRef = useRef(null);
  const isLoggingOut = useRef(false);

  // SweetAlert2 커스텀 스타일 주입
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .greencarry-swal-popup {
        border-radius: 20px !important;
        padding: 2rem !important;
        font-family: 'Pretendard', sans-serif;
      }
      .greencarry-swal-title {
        color: var(--color-brand, #2e7d32) !important;
        font-size: 1.5rem !important;
        font-weight: 700 !important;
      }
      .swal2-icon.swal2-warning {
        border-color: var(--color-brand, #2e7d32) !important;
        color: var(--color-brand, #2e7d32) !important;
      }
      .swal2-icon.swal2-success {
        border-color: var(--color-brand, #2e7d32) !important;
      }
      .swal2-icon.swal2-success [class^='swal2-success-line'] {
        background-color: var(--color-brand, #2e7d32) !important;
      }
      .swal2-icon.swal2-success .swal2-success-ring {
        border: 4px solid var(--color-brand, #2e7d32) !important;
        opacity: 0.3;
      }
      .greencarry-swal-confirm-button {
        background-color: var(--color-brand, #2e7d32) !important;
        color: white !important;
        border-radius: 12px !important;
        padding: 12px 35px !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        margin-top: 1rem !important;
        cursor: pointer;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      .greencarry-swal-confirm-button:hover {
        filter: brightness(0.9);
      }
    `;
    document.head.appendChild(style);
  }, []);

  const fireStyledSwal = (icon, title, text) => {
    return Swal.fire({
      icon: icon,
      title: title,
      text: text,
      customClass: {
        popup: "greencarry-swal-popup",
        title: "greencarry-swal-title",
        confirmButton: "greencarry-swal-confirm-button",
      },
      buttonsStyling: false,
      confirmButtonText: "확인",
    });
  };

  // 로컬 스토리지 데이터 초기화
  const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isAutoLogin");
    localStorage.removeItem("memberId");
    localStorage.removeItem("memberName");
    localStorage.removeItem("memberGrade");
    localStorage.removeItem("memberThumb");
    localStorage.removeItem("memberPoint");
    localStorage.removeItem("storeId");
    localStorage.removeItem("LATITUDE");
    localStorage.removeItem("LONGITUDE");
    setIsLogin(false);
    setUser(null);
  };

  // 로그아웃 처리 (async 추가)
  const logout = async (isExpired = false) => {
    // 1. 타이머 및 상태 초기화
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    //  2. 백엔드 Redis 데이터 삭제 시도
    // memberId는 AuthContext 상태나 localStorage에서 가져옵니다.
    const memberId = user?.memberId || localStorage.getItem("memberId");

    try {
      if (memberId) {
        // /member/logout은 SecurityConfig에서 permitAll 되어 있어야 함
        await api.post("/member/logout", { memberId });
        console.log("✅ 서버 세션(Redis) 삭제 성공");
      }
    } catch (err) {
      // 서버 통신 실패 시에도 로그아웃은 진행되어야 하므로 에러 로그만 기록
      console.error("서버 로그아웃 요청 실패 (Redis 삭제 안됨):", err);
    } finally {
      //  3. 로컬 인증 데이터 삭제 및 리다이렉트 (공통 로직)
      if (isExpired === true) {
        fireStyledSwal(
          "warning",
          "세션 만료",
          "로그인 유지 시간이 만료되어 자동 로그아웃 되었습니다.",
        ).then(() => {
          clearAuthData();
          window.location.replace("/");
        });
      } else {
        isLoggingOut.current = true;
        clearAuthData();
        window.location.replace("/");
      }
    }
  };

  // 앱 로드시 인증 상태 복구
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const name = localStorage.getItem("memberName");
    const grade = localStorage.getItem("memberGrade");
    const id = localStorage.getItem("memberId");
    const thumb = localStorage.getItem("memberThumb");
    const point = localStorage.getItem("memberPoint"); //  [추가] 포인트 로드

    const lat = localStorage.getItem("LATITUDE");
    const lng = localStorage.getItem("LONGITUDE");

    const storeId = localStorage.getItem("storeId");

    const isAutoLogin = localStorage.getItem("isAutoLogin") === "true";

    if (token) {
      try {
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));
        const currentTime = Math.floor(Date.now() / 1000);

        //  전역 유저 객체 생성 (포인트 포함)
        const userData = {
          memberId: id,
          memberName: name,
          memberGrade: Number(grade),
          memberThumb: thumb,
          memberPoint: Number(point) || 0, // 숫자로 형변환
          storeId: Number(storeId) || null,
        };

        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
          if (!isAutoLogin) {
            logout(true);
          } else {
            setIsLogin(true);
            setUser({
              memberId: id,
              memberName: name,
              memberGrade: Number(grade),
              memberThumb: thumb,
              lat: lat ? parseFloat(lat) : null,
              lng: lng ? parseFloat(lng) : null,
              storeId: Number(storeId) || null,
            });
          }
        } else {
          setIsLogin(true);
          setUser({
            memberId: id,
            memberName: name,
            memberGrade: Number(grade),
            memberThumb: thumb,
            lat: lat ? parseFloat(lat) : null,
            lng: lng ? parseFloat(lng) : null,
            storeId: Number(storeId) || null,
          });

          if (!isAutoLogin) {
            const remainingTimeInMs = (decodedPayload.exp - currentTime) * 1000;

            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

            if (remainingTimeInMs > 0 && remainingTimeInMs < 2147483647) {
              logoutTimerRef.current = setTimeout(() => {
                if (!isLoggingOut.current) {
                  logout(true);
                }
              }, remainingTimeInMs);
            }
          } else {
            console.log("자동 로그인 유저: 인터셉터 모드로 작동합니다.");
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
          }
        }
      } catch (error) {
        console.error("토큰 검증 에러:", error);
        clearAuthData();
      }
    }

    setIsLoading(false);

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLogin, setIsLogin, user, setUser, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
