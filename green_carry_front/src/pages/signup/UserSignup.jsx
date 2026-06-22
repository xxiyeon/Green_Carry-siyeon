import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDaumPostcodePopup } from "react-daum-postcode";
import axios from "axios";
import Swal from "sweetalert2";
import useEcoEffects from "../../hooks/useEcoEffects";
import styles from "./UserSignup.module.css";
import ButtonSpinner from "../../components/commons/ButtonSpinner";

const UserSignup = () => {
  const {
    containerRef,
    bubblesRef,
    selectedBg,
    bubbleData,
    leafData,
    fireflyData,
  } = useEcoEffects();
  const navigate = useNavigate();

  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
    memberName: "",
    memberEmail: "",
    memberPhone: "",
    memberAddrcode: "",
    memberAddr: "",
    memberDetailAddr: "",
    latitude: 0,
    longitude: 0,
  });

  const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const pwRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  const [checkId, setCheckId] = useState(0);
  const [checkEmail, setCheckEmail] = useState(0);
  const [memberPwRe, setMemberPwRe] = useState("");
  const [mailAuth, setMailAuth] = useState(0);
  const [mailAuthCode, setMailAuthCode] = useState(null);
  const [mailAuthInput, setMailAuthInput] = useState("");
  const [time, setTime] = useState(180);
  const [timeoutId, setTimeoutId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const resetMailAuthState = () => {
    if (timeoutId) window.clearInterval(timeoutId);
    setTimeoutId(null);
    setMailAuth(0);
    setMailAuthCode(null);
    setMailAuthInput("");
    setTime(180);
  };

  const inputMember = (e) => {
    const { name, value } = e.target;
    if (name === "memberPhone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      let formattedPhone = "";
      if (onlyNums.length < 4) formattedPhone = onlyNums;
      else if (onlyNums.length < 8)
        formattedPhone = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      else
        formattedPhone = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
      setMember({ ...member, [name]: formattedPhone });
      return;
    }
    setMember({ ...member, [name]: value });
    if (name === "memberId") setCheckId(0);
    if (name === "memberEmail") {
      setCheckEmail(0);
      resetMailAuthState();
    }
  };

  const handleIdCheck = async () => {
    if (isCheckingId) return;
    if (!idRegex.test(member.memberId)) {
      Swal.fire({ icon: "warning", text: "아이디 형식을 먼저 맞춰주세요." });
      return;
    }
    setIsCheckingId(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKSERVER}/member/exists?memberId=${member.memberId}`,
      );
      if (res.data) {
        Swal.fire({ icon: "success", text: "사용 가능한 아이디입니다." });
        setCheckId(2);
      } else {
        Swal.fire({ icon: "error", text: "이미 사용 중인 아이디입니다." });
        setCheckId(1);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: "서버와 통신 중 오류가 발생했습니다.",
      });
    } finally {
      setIsCheckingId(false);
    }
  };

  const handleSendMail = async () => {
    if (isSendingMail) return;
    if (!emailRegex.test(member.memberEmail)) {
      Swal.fire({
        icon: "warning",
        text: "올바른 이메일 형식을 먼저 입력해주세요.",
      });
      setCheckEmail(0);
      resetMailAuthState();
      return;
    }
    try {
      //  인증 메일 발송 시도마다 이메일 중복 검사를 다시 수행
      const res = await axios.get(
        `${import.meta.env.VITE_BACKSERVER}/member/emailDupCheck`,
        {
          params: {
            memberEmail: member.memberEmail.trim(),
            _: Date.now(),
          },
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
      );
      if (!res.data) {
        Swal.fire({ icon: "error", text: "이미 사용 중인 이메일입니다." });
        setCheckEmail(1);
        resetMailAuthState();
        return;
      }
      setCheckEmail(2);
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: "이메일 중복 확인 중 오류가 발생했습니다.",
      });
      return;
    }
    resetMailAuthState();
    setMailAuth(1);
    setIsSendingMail(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/member/email-verification`,
        {
          memberEmail: member.memberEmail,
        },
      );
      setMailAuthCode(res.data);
      setMailAuth(2);
      const intervalId = window.setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
      setTimeoutId(intervalId);
    } catch (err) {
      resetMailAuthState();
      Swal.fire({ icon: "error", text: "메일 발송 중 오류가 발생했습니다." });
    } finally {
      setIsSendingMail(false);
    }
  };

  const handleVerifyMail = () => {
    if (mailAuth !== 2) {
      Swal.fire({
        icon: "warning",
        text: "먼저 인증 메일 발송 버튼을 눌러주세요.",
      });
      return;
    }
    if (String(mailAuthCode) === mailAuthInput) {
      Swal.fire({ icon: "success", text: "이메일 인증이 완료되었습니다." });
      setMailAuth(3);
      window.clearInterval(timeoutId);
      setTimeoutId(null);
    } else {
      Swal.fire({
        icon: "error",
        text: "인증번호가 일치하지 않습니다. 다시 확인해주세요.",
      });
    }
  };

  useEffect(() => {
    if (time === 0) {
      window.clearInterval(timeoutId);
      setMailAuthCode(null);
      setTimeoutId(null);
      Swal.fire({
        icon: "error",
        text: "인증 시간이 만료되었습니다. 다시 시도해주세요.",
      });
      setMailAuth(0);
    }
  }, [time]);

  const showTime = () => {
    const min = Math.floor(time / 60);
    const sec = String(time % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const openPostcode = useDaumPostcodePopup(
    "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js",
  );

  const handleCompletePostcode = (data) => {
    let fullAddress = data.address;
    let extraAddress = "";
    if (data.addressType === "R") {
      if (data.bname !== "") extraAddress += data.bname;
      if (data.buildingName !== "")
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    //  네이버 Geocoding API로 좌표를 변환
    if (window.naver && naver.maps.Service) {
      naver.maps.Service.geocode({ query: fullAddress }, (status, response) => {
        if (status === naver.maps.Service.Status.OK) {
          const result = response.v2.addresses[0];
          setMember((prev) => ({
            ...prev,
            memberAddrcode: data.zonecode,
            memberAddr: fullAddress,
            latitude: parseFloat(result.y),
            longitude: parseFloat(result.x),
          }));
        } else {
          console.error("좌표 변환 실패");
          setMember((prev) => ({
            ...prev,
            memberAddrcode: data.zonecode,
            memberAddr: fullAddress,
          }));
        }
      });
    } else {
      setMember((prev) => ({
        ...prev,
        memberAddrcode: data.zonecode,
        memberAddr: fullAddress,
      }));
    }
  };

  const handleSearchAddress = () => {
    openPostcode({ onComplete: handleCompletePostcode });
  };

  const getIdMessage = () => {
    if (!member.memberId)
      return {
        text: isSubmitted ? "아이디를 입력해주세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (!idRegex.test(member.memberId))
      return { text: "영문, 숫자 조합 8자 이상 입력해주세요.", isError: true };
    if (checkId !== 2)
      return { text: "중복 확인 버튼을 눌러주세요.", isError: true };
    return { text: "사용 가능한 아이디입니다.", isError: false };
  };

  const getPwMessage = () => {
    if (!member.memberPw)
      return {
        text: isSubmitted ? "비밀번호를 입력해주세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (!pwRegex.test(member.memberPw))
      return {
        text: "영문 대/소문자, 숫자, 특수기호 포함 10자 이상 입력해주세요.",
        isError: true,
      };
    return { text: "사용 가능한 비밀번호입니다.", isError: false };
  };

  const getPwReMessage = () => {
    if (!memberPwRe)
      return {
        text: isSubmitted ? "비밀번호 확인을 입력해주세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (member.memberPw !== memberPwRe)
      return { text: "비밀번호가 일치하지 않습니다.", isError: true };
    return { text: "비밀번호가 일치합니다.", isError: false };
  };

  const getEmailMessage = () => {
    if (!member.memberEmail)
      return {
        text: isSubmitted ? "이메일을 입력해주세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (!emailRegex.test(member.memberEmail))
      return { text: "올바른 이메일 형식을 입력해주세요.", isError: true };
    if (mailAuth === 0)
      return { text: "인증 이메일을 발송해주세요.", isError: true };
    if (mailAuth === 2)
      return {
        text: `인증번호를 입력해주세요. (남은 시간: ${showTime()})`,
        isError: true,
      };
    if (mailAuth === 3)
      return { text: "이메일 인증이 완료되었습니다.", isError: false };
    return { text: "\u00A0", isError: false };
  };

  const getNameMessage = () => {
    if (!member.memberName.trim())
      return {
        text: isSubmitted ? "이름을 입력해주세요." : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };

  const getPhoneMessage = () => {
    if (!member.memberPhone.trim())
      return {
        text: isSubmitted ? "휴대폰 번호를 입력해주세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (member.memberPhone.length < 13)
      return { text: "연락처 11자리를 모두 입력해주세요.", isError: true };
    return { text: "\u00A0", isError: false };
  };

  const getAddrMessage = () => {
    if (!member.memberAddrcode || !member.memberDetailAddr.trim())
      return {
        text: isSubmitted ? "주소 및 상세 주소를 모두 입력해주세요." : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };

  const idStatus = getIdMessage();
  const pwStatus = getPwMessage();
  const pwReStatus = getPwReMessage();
  const emailStatus = getEmailMessage();
  const nameStatus = getNameMessage();
  const addrStatus = getAddrMessage();
  const phoneStatus = getPhoneMessage();

  const joinSubmit = async (e) => {
    e.preventDefault();
    if (isJoining) return;
    setIsSubmitted(true);
    const hasEmpty =
      !member.memberId ||
      !member.memberPw ||
      !memberPwRe ||
      !member.memberEmail ||
      !member.memberName.trim() ||
      !member.memberPhone.trim() ||
      !member.memberAddrcode ||
      !member.memberDetailAddr.trim();

    if (
      hasEmpty ||
      idStatus.isError ||
      pwStatus.isError ||
      pwReStatus.isError ||
      emailStatus.isError ||
      nameStatus.isError ||
      phoneStatus.isError ||
      addrStatus.isError
    ) {
      Swal.fire({
        icon: "warning",
        text: "입력하신 정보를 다시 확인해주세요.",
      });
      return;
    }

    setIsJoining(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/member/userSignup`,
        member,
      );
      await Swal.fire({
        icon: "success",
        text: "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.",
      });
      navigate("/login");
    } catch (err) {
      console.log(err);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div
      className={styles.signupScreenContainer}
      ref={containerRef}
      style={{ backgroundImage: `url(${selectedBg})` }}
    >
      {leafData &&
        leafData.map((leaf) => (
          <div
            key={leaf.id}
            className={styles.particleLeaf}
            style={{ left: leaf.x, top: leaf.y }}
          />
        ))}
      {fireflyData &&
        fireflyData.map((style, i) => (
          <div
            key={`firefly-${i}`}
            className={styles.firefly}
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
          className={styles.ecoBubble}
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

      <div className={styles.signupMainContent}>
        <header>
          <h1 className={styles.signupLogo} onClick={() => navigate("/")}>
            GreenCarry
          </h1>
        </header>

        <div className={`${styles.signupCard} ${styles.signupCardScroll}`}>
          <h2 className={styles.signupTitle}>개인 회원가입</h2>

          <form className={styles.signupForm} onSubmit={joinSubmit}>
            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>아이디</label>
              <div className={styles.signupInputArea}>
                <div className={styles.signupInputInner}>
                  <input
                    type="text"
                    name="memberId"
                    value={member.memberId}
                    onChange={inputMember}
                    className={styles.signupInputUnderline}
                    placeholder="영문, 숫자 조합 8자 이상"
                    readOnly={checkId === 2}
                  />
                  <button
                    type="button"
                    className={styles.signupBtnOutlined}
                    onClick={handleIdCheck}
                    disabled={checkId === 2 || isCheckingId}
                  >
                    {isCheckingId ? (
                      <>
                        <ButtonSpinner />
                        <span>확인 중</span>
                      </>
                    ) : (
                      "중복 확인"
                    )}
                  </button>
                </div>
                <p
                  className={`${styles.signupStatusMsg} ${idStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {idStatus.text}
                </p>
              </div>
            </div>

            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>비밀번호</label>
              <div className={styles.signupInputArea}>
                <input
                  type="password"
                  name="memberPw"
                  value={member.memberPw}
                  onChange={inputMember}
                  className={styles.signupInputUnderline}
                  placeholder="영문 대/소문자, 숫자, 특수기호 포함 10자 이상"
                />
                <p
                  className={`${styles.signupStatusMsg} ${pwStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {pwStatus.text}
                </p>
              </div>
            </div>

            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>비밀번호 확인</label>
              <div className={styles.signupInputArea}>
                <input
                  type="password"
                  name="memberPwRe"
                  value={memberPwRe}
                  onChange={(e) => setMemberPwRe(e.target.value)}
                  className={styles.signupInputUnderline}
                  placeholder="비밀번호를 다시 입력해주세요."
                />
                <p
                  className={`${styles.signupStatusMsg} ${pwReStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {pwReStatus.text}
                </p>
              </div>
            </div>

            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>이름</label>
              <div className={styles.signupInputArea}>
                <input
                  type="text"
                  name="memberName"
                  value={member.memberName}
                  onChange={inputMember}
                  className={styles.signupInputUnderline}
                  placeholder="이름을 입력해주세요."
                />
                <p
                  className={`${styles.signupStatusMsg} ${nameStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {nameStatus.text}
                </p>
              </div>
            </div>

            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>이메일</label>
              <div className={styles.signupInputArea}>
                <div className={styles.signupInputInner}>
                  <input
                    type="email"
                    name="memberEmail"
                    value={member.memberEmail}
                    onChange={inputMember}
                    className={styles.signupInputUnderline}
                    placeholder="example@greencarry.com"
                    readOnly={mailAuth === 3}
                  />
                  <button
                    type="button"
                    className={styles.signupBtnOutlined}
                    onClick={handleSendMail}
                    disabled={mailAuth === 1 || mailAuth === 3 || isSendingMail}
                  >
                    {isSendingMail ? (
                      <>
                        <ButtonSpinner />
                        <span>발송 중</span>
                      </>
                    ) : mailAuth === 0 ? (
                      "인증 메일 발송"
                    ) : (
                      "재전송"
                    )}
                  </button>
                </div>
                <div
                  className={`${styles.signupInputInner} ${styles.signupMt10}`}
                >
                  <input
                    type="text"
                    className={styles.signupInputUnderline}
                    placeholder="인증번호"
                    value={mailAuthInput}
                    onChange={(e) => setMailAuthInput(e.target.value)}
                    disabled={mailAuth !== 2}
                  />
                  <button
                    type="button"
                    className={styles.signupBtnFilled}
                    onClick={handleVerifyMail}
                    disabled={mailAuth !== 2}
                  >
                    인증번호 확인
                  </button>
                </div>
                <p
                  className={`${styles.signupStatusMsg} ${emailStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {emailStatus.text}
                </p>
              </div>
            </div>

            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>휴대폰 번호</label>
              <div className={styles.signupInputArea}>
                <input
                  type="text"
                  name="memberPhone"
                  value={member.memberPhone}
                  onChange={inputMember}
                  className={styles.signupInputUnderline}
                  placeholder="숫자만 입력해주세요."
                />
                <p
                  className={`${styles.signupStatusMsg} ${phoneStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {phoneStatus.text}
                </p>
              </div>
            </div>

            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>주소</label>
              <div className={styles.signupInputArea}>
                <div className={styles.signupInputInner}>
                  <input
                    type="text"
                    placeholder="우편번호"
                    name="memberAddrcode"
                    value={member.memberAddrcode}
                    className={styles.signupInputUnderline}
                    readOnly
                  />
                  <button
                    type="button"
                    className={styles.signupBtnFilled}
                    onClick={handleSearchAddress}
                  >
                    우편번호 검색
                  </button>
                </div>
                <div
                  className={`${styles.signupInputInner} ${styles.signupMt10}`}
                >
                  <input
                    type="text"
                    placeholder="주소"
                    name="memberAddr"
                    value={member.memberAddr}
                    className={styles.signupInputUnderline}
                    readOnly
                  />
                </div>
                <div
                  className={`${styles.signupInputInner} ${styles.signupMt10}`}
                >
                  <input
                    type="text"
                    placeholder="상세 주소"
                    name="memberDetailAddr"
                    value={member.memberDetailAddr}
                    onChange={inputMember}
                    className={styles.signupInputUnderline}
                  />
                </div>
                <p
                  className={`${styles.signupStatusMsg} ${!member.memberAddrcode && isSubmitted ? styles.signupErrorMsg : ""}`}
                >
                  {!member.memberAddrcode && isSubmitted
                    ? "주소를 입력해주세요."
                    : "\u00A0"}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className={styles.signupBtn}
              disabled={isJoining}
            >
              {isJoining ? (
                <>
                  <ButtonSpinner />
                  <span>가입 처리 중...</span>
                </>
              ) : (
                "가입하기"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
