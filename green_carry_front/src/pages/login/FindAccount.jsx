import React, { useEffect } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../utils/accessToken";
import useAccountStore from "../../store/accountStore";
import useEcoEffects from "../../hooks/useEcoEffects";

const isBrowser = typeof window !== "undefined";

const Account = () => {
  const { containerRef, bubblesRef, selectedBg, bubbleData, fireflyData } =
    useEcoEffects();
  const navigate = useNavigate();
  const [isSendingCode, setIsSendingCode] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);

  const {
    activeTab,
    isCodeSent,
    isVerified,
    inputCode,
    timeLeft,
    isTimerActive,
    formData,
    newPassword,
    confirmPassword,
    pwError,
    matchError,
    setIsCodeSent,
    setIsVerified,
    setInputCode,
    setTimeLeft,
    setIsTimerActive,
    handleInputChange,
    handleTabChange,
    handlePwChange,
    handleConfirmPwChange,
  } = useAccountStore();

  useEffect(() => {
    let timer;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft, setTimeLeft, setIsTimerActive]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const sendCode = () => {
    if (!formData.memberEmail) {
      Swal.fire({ icon: "warning", title: "이메일을 입력해주세요." });
      return;
    }

    if (isSendingCode) {
      return;
    }

    setIsSendingCode(true);

    api
      .post("/member/sendAuthCode", { memberEmail: formData.memberEmail })
      .then(() => {
        setTimeLeft(180);
        setIsTimerActive(true);
        setInputCode("");
        Swal.fire({
          icon: "success",
          title: isCodeSent ? "인증번호 재전송 완료" : "인증번호 발송 완료",
          text: "입력하신 이메일로 인증번호가 발송되었습니다. (3분 이내 입력)",
        });
        setIsCodeSent(true);
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "발송 실패",
          text: "잠시 후 다시 시도해주세요.",
        });
      })
      .finally(() => {
        setIsSendingCode(false);
      });
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();

    if (isVerifying) {
      return;
    }

    if (!inputCode) {
      Swal.fire({ icon: "warning", title: "인증번호를 입력해주세요." });
      return;
    }
    if (timeLeft <= 0) {
      Swal.fire({
        icon: "error",
        title: "시간 만료",
        text: "인증 시간이 초과되었습니다.",
      });
      return;
    }

    setIsVerifying(true);

    api
      .post("/member/verifyCode", {
        memberEmail: formData.memberEmail,
        inputCode,
      })
      .then((res) => {
        if (res.data === true || res.data === "true") {
          setIsTimerActive(false);

          if (activeTab === "findId") {
            api
              .post("/member/findId", {
                memberName: formData.memberName,
                memberEmail: formData.memberEmail,
              })
              .then((resId) => {
                Swal.fire({
                  icon: "success",
                  title: "아이디 찾기 성공",
                  html: `고객님의 아이디는 <b>${resId.data}</b> 입니다.`,
                }).then(() => {
                  if (isBrowser) {
                    navigate("/login");
                  }
                });
              })
              .catch(() =>
                Swal.fire({
                  icon: "error",
                  title: "조회 실패",
                  text: "일치하는 정보가 없습니다.",
                }),
              );
          } else {
            api
              .post("/member/checkMember", {
                memberId: formData.memberId,
                memberEmail: formData.memberEmail,
              })
              .then((resCheck) => {
                if (resCheck.data === true || resCheck.data === 1)
                  setIsVerified(true);
                else
                  Swal.fire({
                    icon: "error",
                    title: "인증 실패",
                    text: "정보가 일치하는 회원이 없습니다.",
                  });
              })
              .catch(() =>
                Swal.fire({
                  icon: "error",
                  title: "오류",
                  text: "문제가 발생했습니다.",
                }),
              );
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "인증 실패",
            text: "인증번호가 일치하지 않습니다.",
          });
        }
      })
      .catch(() =>
        Swal.fire({
          icon: "error",
          title: "오류",
          text: "문제가 발생했습니다.",
        }),
      )
      .finally(() => {
        setIsVerifying(false);
      });
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    if (
      isResettingPassword ||
      pwError ||
      matchError ||
      !newPassword ||
      !confirmPassword
    ) {
      return;
    }

    setIsResettingPassword(true);

    api
      .post("/member/resetPw", {
        memberId: formData.memberId,
        memberPw: newPassword,
      })
      .then((res) => {
        if (res.data === -1) {
          Swal.fire({
            icon: "warning",
            title: "변경 불가",
            text: "기존과 동일한 비밀번호입니다. 다른 비밀번호를 입력해주세요.",
          });
          return;
        }
        Swal.fire({
          icon: "success",
          title: "변경 완료",
          text: "비밀번호가 성공적으로 변경되었습니다.",
        }).then(() => {
          if (isBrowser) {
            navigate("/login");
          }
        });
      })
      .catch(() =>
        Swal.fire({
          icon: "error",
          title: "변경 실패",
          text: "비밀번호 변경 중 서버 오류가 발생했습니다.",
        }),
      )
      .finally(() => {
        setIsResettingPassword(false);
      });
  };

  return (
    <div
      className="screen-container"
      ref={containerRef}
      style={{ backgroundImage: `url(${selectedBg})` }}
    >
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
        <h1
          className="logo"
          style={{
            textAlign: "center",
            padding: "30px 0",
            margin: 0,
            fontSize: "2.2rem",
            fontWeight: 700,
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "inherit",
              fontFamily: "var(--font-logo)",
            }}
          >
            GreenCarry
          </Link>
        </h1>
      </header>

      <div className="main-content find-content">
        <section className="info-section" style={{ width: "320px" }}>
          <h2
            className="main-title"
            style={{ fontFamily: "var(--font-title)" }}
          >
            계정을 잊으셨나요?
            <br />
            금방 찾아드릴게요
          </h2>
          <div className="stats notice-list">
            <div className="stat-item">
              🌱 다시 로그인하여 에코 히어로가 되어주세요.
            </div>
            <div className="stat-item">
              🛡️ 본인 인증을 통해 안전하게 정보를 보호합니다.
            </div>
          </div>
        </section>

        <section className="find-card premium-glass" style={{ width: "450px" }}>
          <div className="premium-tabs">
            <div
              className={`slide-indicator ${
                activeTab === "resetPw" ? "right" : "left"
              }`}
            ></div>
            <button
              type="button"
              className={`tab-button ${activeTab === "findId" ? "active" : ""}`}
              onClick={() => handleTabChange("findId")}
            >
              아이디 찾기
            </button>
            <button
              type="button"
              className={`tab-button ${
                activeTab === "resetPw" ? "active" : ""
              }`}
              onClick={() => handleTabChange("resetPw")}
            >
              비밀번호 재설정
            </button>
          </div>

          {!isVerified ? (
            <form className="find-form" onSubmit={handleVerifySubmit}>
              {activeTab === "findId" ? (
                <input
                  type="text"
                  name="memberName"
                  className="full-input"
                  placeholder="이름"
                  value={formData.memberName}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <input
                  type="text"
                  name="memberId"
                  className="full-input"
                  placeholder="아이디"
                  value={formData.memberId}
                  onChange={handleInputChange}
                  required
                />
              )}

              <div className="input-with-btn">
                <input
                  type="email"
                  name="memberEmail"
                  className="flex-input"
                  placeholder="이메일"
                  value={formData.memberEmail}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="verify-send-btn"
                  disabled={isSendingCode}
                  onClick={sendCode}
                >
                  {isSendingCode
                    ? "전송 중..."
                    : isCodeSent
                      ? "재전송"
                      : "인증번호 전송"}
                </button>
              </div>

              {isCodeSent && (
                <>
                  <div className="timer-wrapper">
                    <input
                      type="text"
                      className="full-input"
                      placeholder="인증번호 입력"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      required
                      style={{ paddingRight: "75px" }}
                    />
                    <span
                      className={`timer-text ${timeLeft < 30 ? "danger" : ""}`}
                    >
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="submit-verify-btn shimmer-btn"
                    disabled={isVerifying}
                    style={{ marginTop: "15px" }}
                  >
                    {isVerifying
                      ? "확인 중..."
                      : activeTab === "findId"
                        ? "아이디 찾기"
                        : "인증 확인"}
                  </button>
                </>
              )}
            </form>
          ) : (
            <form className="find-form" onSubmit={handlePasswordChangeSubmit}>
              <h3
                style={{
                  textAlign: "center",
                  color: "var(--font-main)",
                  marginBottom: "5px",
                  marginTop: "0",
                  fontFamily: "var(--font-sub)",
                }}
              >
                새 비밀번호 설정
              </h3>
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-sub)",
                  fontSize: "0.85rem",
                  marginTop: "0",
                  marginBottom: "20px",
                }}
              >
                새롭게 사용할 비밀번호를 입력해주세요.
              </p>

              <div style={{ marginBottom: "15px" }}>
                <input
                  type="password"
                  className="full-input"
                  placeholder="새 비밀번호 (대문자+소문자+숫자+특수문자 10자 이상)"
                  value={newPassword}
                  onChange={(e) => handlePwChange(e.target.value)}
                  required
                />
                {pwError && (
                  <div
                    style={{
                      color: "#e53935",
                      fontSize: "0.75rem",
                      marginTop: "5px",
                    }}
                  >
                    {pwError}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <input
                  type="password"
                  className="full-input"
                  placeholder="새 비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPwChange(e.target.value)}
                  required
                />
                {matchError && (
                  <div
                    style={{
                      color: "#e53935",
                      fontSize: "0.75rem",
                      marginTop: "5px",
                    }}
                  >
                    {matchError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="submit-verify-btn shimmer-btn"
                disabled={
                  isResettingPassword ||
                  pwError ||
                  matchError ||
                  !confirmPassword ||
                  !newPassword
                }
                style={{
                  opacity:
                    isResettingPassword ||
                    pwError ||
                    matchError ||
                    !confirmPassword ||
                    !newPassword
                      ? 0.5
                      : 1,
                }}
              >
                {isResettingPassword ? "변경 중..." : "비밀번호 변경 완료"}
              </button>
            </form>
          )}

          <div className="find-footer">
            <Link to="/login" className="back-to-login">
              ← 로그인 화면으로 돌아가기
            </Link>
          </div>
        </section>

        <section
          className="illustration-section"
          style={{ width: "320px", visibility: "hidden" }}
        ></section>
      </div>
    </div>
  );
};

export default Account;
