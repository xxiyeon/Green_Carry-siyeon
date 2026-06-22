import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import styles from "./Header.module.css";
import Swal from "sweetalert2";
import AccountCircleSharpIcon from "@mui/icons-material/AccountCircleSharp";
import HeaderNotification from "./HeaderNotification";

// Icons
import ParkIcon from "@mui/icons-material/Park";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import useCartStore from "../../store/useCartStore";
import { withButtonLoading } from "../../utils/buttonLoading";

export default function Header() {
  const clearCart = useCartStore((state) => state.clearCart);
  const navigate = useNavigate();
  const { isLogin, user, logout, isLoading } = useContext(AuthContext);
  const backHost = import.meta.env.VITE_BACKSERVER;

  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.length;

  const [communityPoint, setCommunityPoint] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${backHost}/member/community-carbon`)
      .then((res) => {
        setCommunityPoint(Number(res.data));
      })
      .catch((err) => {
        console.error("커뮤니티 탄소량 로드 실패:", err);
      });
  }, [backHost]);

  // 모바일 메뉴 열릴 때 스크롤 방지
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

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
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleLogoutClick = withButtonLoading(async () => {
    clearCart();
    setMobileMenuOpen(false);
    return fireStyledSwal(
      "success",
      "로그아웃 완료",
      "안전하게 로그아웃 되었습니다. 메인으로 이동합니다."
    ).then(() => {
      logout();
    });
  });

  const handleMyPageClick = () => {
    setMobileMenuOpen(false);
    if (isLogin) {
      let targetPath = "/mypage/user";
      let roleText = "에코 히어로";
      const grade = Number(user?.memberGrade);

      if (grade === 0) {
        targetPath = "/mypage/admin";
        roleText = "관리자";
      } else if (grade === 2) {
        targetPath = "/mypage/manager";
        roleText = "파트너";
      }

      fireStyledSwal(
        "success",
        "이동 중",
        `${roleText}님의 공간으로 이동합니다.`
      ).then(() => navigate(targetPath));
    } else {
      fireStyledSwal(
        "warning",
        "로그인 필요",
        "로그인 페이지로 이동합니다."
      ).then(() => navigate("/login"));
    }
  };

  const handleCartClick = () => {
    setMobileMenuOpen(false);
    navigate("/orderPage");
  };

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div
        className={styles.logo_wrap}
        onClick={() => {
          setMobileMenuOpen(false);
          navigate("/");
        }}
        style={{ cursor: "pointer" }}
      >
        <img src="/image/logo.png" alt="GreenCarry Logo" />
        <h5 className={styles.logo_text}>GreenCarry</h5>
      </div>

      <div className={styles.center_wrap}>
        <ParkIcon className={styles.park_icon} />
        <span className={styles.tree_info}>
          <span className={styles.tree_text_desktop}>
            지금까지 우리 모두가 심은 나무, 총
          </span>
          <strong>
            {" "}
            {Math.floor((communityPoint * 1000) / 6600).toLocaleString()}
          </strong>{" "}
          <span className={styles.tree_unit}>그루</span>
        </span>
      </div>

      {/* 햄버거 메뉴 아이콘 (모바일에서만 표시) */}
      <div className={styles.mobile_menu_icon}>
        {mobileMenuOpen ? (
          <CloseIcon onClick={() => setMobileMenuOpen(false)} />
        ) : (
          <MenuIcon onClick={() => setMobileMenuOpen(true)} />
        )}
      </div>

      {/* 데스크톱 & 모바일 메뉴 */}
      <div
        className={`${styles.button_wrap} ${
          mobileMenuOpen ? styles.mobile_menu_open : ""
        }`}
      >
        {isLoading ? null : (
          <>
            {isLogin && user && (
              <span className={styles.user_info}>
                <b>{user.memberName}</b>님 (
                {Number(user.memberGrade) === 0
                  ? "관리자"
                  : Number(user.memberGrade) === 1
                  ? "개인"
                  : "사업자"}
                )
              </span>
            )}

            {/* 장바구니 (개인 회원만) */}
            {isLogin && Number(user?.memberGrade) === 1 && (
              <div className={styles.cart_icon_wrap} onClick={handleCartClick}>
                <ShoppingCartIcon />
                {cartCount > 0 && (
                  <span className={styles.cart_badge}>{cartCount}</span>
                )}
                <span className={styles.mobile_menu_label}>장바구니</span>
              </div>
            )}

            {/* 실시간 알림 */}
            {isLogin && (
              <div className={styles.notification_wrap}>
                <HeaderNotification />
                <span className={styles.mobile_menu_label}>알림</span>
              </div>
            )}

            {/* 마이페이지 */}
            <div
              onClick={handleMyPageClick}
              className={styles.mypage_wrap}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {isLogin ? (
                <div className={styles.profile_circle}>
                  {user?.memberThumb && user.memberThumb !== "null" ? (
                    <img
                      src={user.memberThumb}
                      alt="profile"
                      className={styles.profile_img}
                      onError={(e) => {
                        e.target.src = "/image/default-user.png";
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <AccountCircleSharpIcon
                      className={styles.icon_inside_header_image}
                    />
                  )}
                </div>
              ) : (
                <PersonIcon titleAccess="마이페이지" />
              )}
              <span className={styles.mobile_menu_label}>마이페이지</span>
            </div>

            {/* 로그인/로그아웃 */}
            {isLogin ? (
              <div
                onClick={handleLogoutClick}
                className={styles.logout_wrap}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LogoutIcon titleAccess="로그아웃" />
                <span className={styles.mobile_menu_label}>로그아웃</span>
              </div>
            ) : (
              <div
                onClick={handleLoginClick}
                className={styles.login_wrap}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LoginIcon titleAccess="로그인" />
                <span className={styles.mobile_menu_label}>로그인</span>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
