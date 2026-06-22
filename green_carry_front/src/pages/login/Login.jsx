import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./Auth.css";

import useEcoEffects from "../../hooks/useEcoEffects";

// MUI Icons & Components
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EcoEarth from "../../components/Easter Egg/EcoEarth";

const API_BASE_URL = import.meta.env.VITE_BACKSERVER?.trim() || "";
const isBrowser = typeof window !== "undefined";
//합치기용 주석
const Login = () => {
  //  1번 이스터에그 상태 (로고 클릭)
  const [clickCount, setClickCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogoEasterEgg = () => {
    setClickCount((prev) => prev + 1);
    if (clickCount + 1 === 5) {
      Swal.fire({
        title: "당신은 진정한 에코 히어로!",
        text: "그린캐리와 함께 지구를 구해주셔서 감사합니다!",
        iconHtml: "🌿",
        showConfirmButton: false,
        timer: 2000,
        customClass: swalCustomClass,
      });
      setClickCount(0);
    }
  };

  useEffect(() => {
    let inputKeys = [];
    const konamiCode = "ArrowUpArrowUpArrowDownArrowDown";

    const triggerLeafRain = () => {
      for (let i = 0; i < 600; i++) {
        const leaf = document.createElement("div");
        leaf.className = "easter-egg-leaf";
        leaf.innerHTML = "🍃"; // 나뭇잎 이모지
        leaf.style.left = Math.random() * 130 + "vw";
        leaf.style.top = -(Math.random() * 130) + "vh";
        leaf.style.animationDuration = Math.random() * 1 + 3 + "s";
        leaf.style.opacity = Math.random();
        leaf.style.fontSize = Math.random() * 20 + 10 + "px";

        document.body.appendChild(leaf);

        setTimeout(() => {
          leaf.remove();
        }, 6000);
      }
    };

    const handleKeyDown = (e) => {
      inputKeys.push(e.key);
      inputKeys = inputKeys.slice(-4);

      if (inputKeys.join("") === konamiCode) {
        triggerLeafRain();

        Swal.fire({
          title: "🍃 Nature Power!",
          text: "에코 에너지가 쏟아집니다!",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          customClass: swalCustomClass,
        });
        inputKeys = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 유저 카운트 및 [추가] 커뮤니티 탄소 절감량 상태
  const [userCount, setUserCount] = useState(0);
  const [communityCarbon, setCommunityCarbon] = useState(0);

  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
    memberGrade: 1,
  });
  const [activeTab, setActiveTab] = useState("personal");

  const [rememberId, setRememberId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  // 비밀번호 보이기/숨기기 상태
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const swalCustomClass = {
    popup: "greencarry-swal-popup",
    title: "greencarry-swal-title",
    confirmButton: "greencarry-swal-confirm-button",
  };

  useEffect(() => {
    if (!API_BASE_URL) {
      console.error("VITE_BACKSERVER is not configured for the login page.");
      return;
    }

    let isMounted = true;

    // 1. 유저 수 로드
    Promise.allSettled([
      axios.get(`${API_BASE_URL}/member`),
      axios.get(`${API_BASE_URL}/member/community-carbon`),
    ]).then(([memberResult, communityCarbonResult]) => {
      if (!isMounted) {
        return;
      }

      if (memberResult.status === "fulfilled") {
        const memberList = Array.isArray(memberResult.value.data)
          ? memberResult.value.data
          : [];
        setUserCount(memberList.length);
      } else {
        console.error("유저 수 로드 실패:", memberResult.reason);
      }

      if (communityCarbonResult.status === "fulfilled") {
        setCommunityCarbon(Number(communityCarbonResult.value.data) || 0);
      } else {
        console.error(
          "커뮤니티 탄소량 로드 실패:",
          communityCarbonResult.reason,
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const { containerRef, bubblesRef, selectedBg, bubbleData, fireflyData } =
    useEcoEffects();

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const savedId = localStorage.getItem("savedUserId");
    if (savedId) {
      setMember((prev) => ({ ...prev, memberId: savedId }));
      setRememberId(true);
    }
  }, []);

  // 복붙할 때 들어오는 공백 원천 차단
  const inputMember = (e) => {
    const { name, value } = e.target;
    const noSpaceValue = value.replace(/\s/g, ""); // 모든 공백 제거
    setMember((prev) => ({ ...prev, [name]: noSpaceValue }));
  };

  // 스페이스바 타이핑 자체를 막는 함수
  const preventSpace = (e) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  const handleKeyUp = (e) => {
    setIsCapsLockOn(e.getModifierState("CapsLock"));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMember((prev) => ({ ...prev, memberGrade: tab === "personal" ? 1 : 2 }));
  };

  const persistLoginSession = (
    loginUser,
    accessToken,
    refreshToken,
    memberId,
  ) => {
    // 브라우저 저장소 접근은 한 곳으로 모아두면 배포 환경 이슈를 추적하기 쉽습니다.
    if (!isBrowser) {
      return;
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("memberId", loginUser.memberId ?? "");
    localStorage.setItem("memberName", loginUser.memberName ?? "");
    localStorage.setItem("memberGrade", String(loginUser.memberGrade ?? ""));
    localStorage.setItem("memberThumb", loginUser.memberThumb ?? "");
    localStorage.setItem("memberAddr", loginUser.memberAddr ?? "");
    localStorage.setItem("LATITUDE", String(loginUser.latitude ?? ""));
    localStorage.setItem("LONGITUDE", String(loginUser.longitude ?? ""));
    localStorage.setItem("memberPoint", String(loginUser.memberPoint ?? 0));

    if (loginUser.storeId) {
      localStorage.setItem("storeId", String(loginUser.storeId));
    } else {
      localStorage.removeItem("storeId");
    }

    if (rememberId) {
      localStorage.setItem("savedUserId", memberId);
    } else {
      localStorage.removeItem("savedUserId");
    }

    if (autoLogin) {
      localStorage.setItem("isAutoLogin", "true");
    } else {
      localStorage.removeItem("isAutoLogin");
    }
  };

  const login = async () => {
    const { memberId, memberPw } = member;

    if (!memberId || !memberPw) {
      Swal.fire({
        icon: "warning",
        title: "입력 오류",
        text: "아이디와 비밀번호를 모두 입력해주세요.",
        customClass: swalCustomClass,
      });
      return;
    }

    const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!idRegex.test(memberId) && memberId !== "admin1111") {
      Swal.fire({
        icon: "error",
        title: "아이디 형식 오류",
        text: "아이디는 영문과 숫자를 포함하여 8자 이상이어야 합니다.",
        customClass: swalCustomClass,
      });
      return;
    }

    const pwRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,}$/;
    if (!pwRegex.test(memberPw) && memberId !== "admin1111") {
      Swal.fire({
        icon: "warning",
        title: "비밀번호 보안 수준 미달",
        html: `비밀번호 형식이 올바르지 않습니다.<br/><small>(대/소문자, 숫자, 특수문자 포함 10자 이상)</small>`,
        customClass: swalCustomClass,
      });
      return;
    }

    if (!API_BASE_URL) {
      Swal.fire({
        icon: "error",
        title: "서버 설정 오류",
        text: "로그인 서버 주소가 설정되지 않았습니다.",
        customClass: swalCustomClass,
      });
      return;
    }

    if (isSubmitting) {
      return;
    }

    const loginPayload = {
      ...member,
      autoLogin,
    };

    setIsSubmitting(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/member/login`,
        loginPayload,
      );
      const { member: loginUser, accessToken, refreshToken } = res.data ?? {};

      if (loginUser && Number(loginUser.memberStatus) === 2) {
        Swal.fire({
          icon: "error",
          title: "로그인 불가",
          text: "탈퇴한 회원입니다. 다시 이용하시려면 고객센터에 문의해주세요.",
          customClass: swalCustomClass,
        });
        return;
      }

      if (!loginUser || !accessToken) {
        throw new Error("Login response is missing required session data.");
      }

      persistLoginSession(loginUser, accessToken, refreshToken, memberId);

      let welcomeTitle = "";
      let welcomeHtml = "";
      let targetPath = "/";
      const grade = Number(loginUser.memberGrade);

      if (grade === 0) {
        welcomeTitle = "관리자 시스템 접속";
        welcomeHtml = `<b style="color: #2e7d32;">관리자님</b> 환영합니다! <br/>그린캐리 관리자 모드로 로그인되었습니다.`;
        targetPath = "/mypage/admin";
      } else if (grade === 2) {
        welcomeTitle = "파트너 센터 접속";
        welcomeHtml = `<b>${loginUser.memberName}</b> 사장님! <br/>매장 관리 화면으로 이동합니다.`;
        targetPath = "/mypage/manager";
      } else {
        welcomeTitle = "로그인 성공!";
        welcomeHtml = `<b>${loginUser.memberName}</b> 에코 히어로님! 환영합니다!<br/>메인 페이지로 이동합니다.`;
        targetPath = "/";
      }

      await Swal.fire({
        icon: "success",
        title: welcomeTitle,
        html: welcomeHtml,
        showConfirmButton: false,
        timer: 1500,
        customClass: swalCustomClass,
      });

      if (isBrowser) {
        window.location.replace(targetPath);
      }
    } catch (err) {
      console.error("Login failed:", err);
      Swal.fire({
        icon: "error",
        title: "로그인 실패",
        text: "정보가 일치하지 않거나 서버 연결에 문제가 있습니다.",
        customClass: swalCustomClass,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="screen-container"
      ref={containerRef}
      style={{ backgroundImage: `url(${selectedBg})` }}
    >
      <EcoEarth></EcoEarth>
      {fireflyData &&
        fireflyData.map((style, i) => (
          <div
            key={`firefly-${i}`}
            className="firefly"
            style={{
              left: style.left,
              top: style.top,
              animationDuration: style.animationDuration,
              animationDelay: style.animationDelay,
            }}
          />
        ))}

      {bubbleData.map((style, i) => (
        <div
          key={i}
          className="eco-bubble"
          ref={(el) => (bubblesRef.current[i] = el)}
          style={{
            left: style.left,
            top: style.top,
            width: style.size,
            height: style.size,
            animationDelay: style.delay,
          }}
        />
      ))}

      <header className="header">
        <h1 className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            GreenCarry
          </Link>
        </h1>
      </header>

      <div className="main-content">
        <section className="info-section">
          <h2 className="main-title">
            탄소 발자국을 줄이는
            <br />
            맛있는 한 끼
          </h2>
          <div className="stats">
            {/*  실제 데이터 바인딩 영역 */}
            <div className="stat-item">
              🌿 함께 아낀 탄소{" "}
              <span className="stat-value">
                {communityCarbon.toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}
                kg
              </span>
            </div>
            <div className="stat-item">
              🌳 식재 효과{" "}
              <span className="stat-value">
                {Math.floor((communityCarbon * 1000) / 6600).toLocaleString()}
                그루
              </span>
            </div>
          </div>
        </section>

        <section className="login-card premium-glass">
          <h3 className="card-title">반가워요, 에코 히어로!</h3>
          <h2 className="card-info blooming-text">
            로그인하여 <span className="leaf-point">친</span>환경 배달을
            시작하세요
          </h2>

          <div className="premium-tabs">
            <div
              className={`slide-indicator ${
                activeTab === "business" ? "right" : "left"
              }`}
            ></div>
            <button
              type="button"
              className={`tab-button ${
                activeTab === "personal" ? "active" : ""
              }`}
              onClick={() => handleTabChange("personal")}
            >
              개인 이용자
            </button>
            <button
              type="button"
              className={`tab-button ${
                activeTab === "business" ? "active" : ""
              }`}
              onClick={() => handleTabChange("business")}
            >
              사업자
            </button>
          </div>

          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              name="memberId"
              placeholder="아이디를 입력해주세요."
              value={member.memberId}
              onChange={inputMember}
              onKeyDown={preventSpace}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon style={{ color: "#2e7d32" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              type={showPassword ? "text" : "password"}
              name="memberPw"
              placeholder="비밀번호를 입력해주세요."
              value={member.memberPw}
              onChange={inputMember}
              onKeyUp={handleKeyUp}
              onKeyDown={preventSpace}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon style={{ color: "#2e7d32" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <div className={`caps-warning ${isCapsLockOn ? "show" : ""}`}>
              <span>⚠️ Caps Lock이 켜져 있습니다.</span>
            </div>

            <div
              className="remember-me"
              style={{
                marginTop: "5px",
                display: "flex",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <input
                  type="checkbox"
                  id="remember_check"
                  checked={rememberId}
                  onChange={(e) => setRememberId(e.target.checked)}
                />
                <label htmlFor="remember_check" style={{ margin: 0 }}>
                  아이디 저장
                </label>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <input
                  type="checkbox"
                  id="auto_login_check"
                  checked={autoLogin}
                  disabled={isSubmitting}
                  onChange={(e) => setAutoLogin(e.target.checked)}
                />
                <label htmlFor="auto_login_check" style={{ margin: 0 }}>
                  자동 로그인
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="login-button shimmer-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="card-footer">
            <Link to="/signup">회원가입</Link>
            <Link to="/account">아이디/비밀번호 찾기</Link>
          </div>
        </section>

        <section className="illustration-section">
          <div className="speech-bubble">
            <p>
              현재 <span>{userCount}</span>명이 환경을 지키고 있어요!
            </p>
          </div>
          <div className="character-illustration" onClick={handleLogoEasterEgg}>
            <img
              src="/image/logo-upscale.png"
              alt="Logo"
              style={{
                cursor: "pointer",
                transition: "transform 0.5s",
                transform:
                  clickCount > 0 ? `rotate(${clickCount * 72}deg)` : "none",
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
