import React, { useContext, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({
  requireAdmin,
  requireManager,
  requireUser,
  requireGuest,
}) => {
  const { isLogin, user, isLoading } = useContext(AuthContext);

  //  마법의 메모장 2개 준비
  const isInitialCheckDone = useRef(false); // 로딩 검사가 끝났는지 체크
  const wasLoggedInInitially = useRef(false); // 로딩 끝난 직후 로그인 상태였는지 체크

  // 1. 정보를 가져오는 중에는 화면을 멈춰둡니다.
  if (isLoading) {
    return null;
  }

  //  2. 로딩이 딱 끝난 그 순간! 원래 로그인되어 있던 사람인지 기록합니다.
  if (!isInitialCheckDone.current) {
    wasLoggedInInitially.current = isLogin;
    isInitialCheckDone.current = true; // 이제 첫 기록 끝!
  }

  // ====================================================
  // 3. [비회원 전용 구역] 로그인한 유저가 로그인/회원가입 접속 시 차단
  // ====================================================
  if (requireGuest && isLogin) {
    // 과거 메모장 확인: 원래부터 로그인(true) 상태였던 사람이 들어왔을 때만 알림!
    // (방금 로그인 버튼을 눌러서 들어온 사람은 알림 없이 패스)
    if (wasLoggedInInitially.current === true) {
      Swal.fire({
        icon: "warning",
        title: "이미 로그인되어 있습니다.",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    return <Navigate to="/" replace />;
  }

  // ====================================================
  // 4. [회원 전용 구역] 아예 로그인을 안 한 사람이 주소를 치고 들어왔을 때
  // ====================================================
  if (!requireGuest && (!isLogin || !user)) {
    Swal.fire({
      icon: "warning",
      title: "로그인 필요",
      text: "로그인 후 이용할 수 있는 페이지입니다.",
    });
    return <Navigate to="/login" replace />;
  }

  // 5. 등급 변환 (알 수 없으면 -1)
  const grade =
    user?.memberGrade !== undefined && user?.memberGrade !== null
      ? Number(user.memberGrade)
      : -1;

  // 6. 권한별 강제 접속 차단
  if (requireAdmin && grade !== 0) {
    Swal.fire({
      icon: "error",
      title: "접근 불가",
      text: "관리자만 접근할 수 있는 영역입니다.",
    });
    return <Navigate to="/" replace />;
  }

  if (requireManager && grade !== 2) {
    Swal.fire({
      icon: "error",
      title: "접근 불가",
      text: "사업자 파트너 전용 영역입니다.",
    });
    return <Navigate to="/" replace />;
  }

  if (requireUser && grade !== 1) {
    Swal.fire({
      icon: "error",
      title: "접근 불가",
      text: "개인 이용자만 접근할 수 있습니다.",
    });
    return <Navigate to="/" replace />;
  }

  // 7. 모든 검문을 통과한 진짜 권한자만 입장!
  return <Outlet />;
};

export default ProtectedRoute;
