import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Swal from "sweetalert2";
import useEcoEffects from "../../hooks/useEcoEffects";
import styles from "./UserSignup.module.css";
import ButtonSpinner from "../../components/commons/ButtonSpinner";

const ManagerSignup = () => {
  //  leafData와 fireflyData를 함께 사용
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
    memberPhone: "",
    memberEmail: "",
    //storeName: "",
    //storeOwnerNo: "",
    //openingDate: "",
  });
  const [store, setStore] = useState({
    storeName: "",
    memberId: "",
    storeOwner: "",
  });
  const [memberPwRe, setMemberPwRe] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checkId, setCheckId] = useState(0);
  const [mailAuth, setMailAuth] = useState(0);
  //const [checkStoreOwnerNo, setCheckStoreOwnerNo] = useState(0);
  const [mailAuthCode, setMailAuthCode] = useState(null);
  const [mailAuthInput, setMailAuthInput] = useState("");
  const [time, setTime] = useState(180);
  const [timeout, setTimeout] = useState(null);
  const [checkEmail, setCheckEmail] = useState(0);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const resetMailAuthState = () => {
    if (timeout) window.clearInterval(timeout);
    setTimeout(null);
    setMailAuth(0);
    setMailAuthCode(null);
    setMailAuthInput("");
    setTime(180);
  };

  const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const pwRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  const inputMember = (e) => {
    const { name, value } = e.target;

    // 휴대폰 번호 자동 하이픈 처리
    if (name === "memberPhone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      let formattedPhone = "";
      if (onlyNums.length < 4) formattedPhone = onlyNums;
      else if (onlyNums.length < 8)
        formattedPhone = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      else
        formattedPhone = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;

      setMember({ ...member, memberPhone: formattedPhone });
      return;
    }

    // 입력값에 따라 member/store 상태를 분리해서 반영
    if (name === "memberId") {
      // memberId는 member와 store에 함께 반영
      setMember((prev) => ({ ...prev, memberId: value }));
      setStore((prev) => ({ ...prev, memberId: value }));
      setCheckId(0);
    } else if (name === "memberName") {
      // memberName은 회원 이름과 대표자명으로 함께 사용
      setMember((prev) => ({ ...prev, memberName: value }));
      setStore((prev) => ({ ...prev, storeOwner: value }));
    } else if (name === "storeName") {
      // 상호명은 store 상태에만 반영
      setStore((prev) => ({ ...prev, storeName: value }));
    } else {
      // 나머지 값은 member 상태에만 반영
      setMember((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "memberEmail") {
      setCheckEmail(0);
      resetMailAuthState();
    }

    // 사업자번호 자동 하이픈 처리
    /*
    if (name === "storeOwnerNo") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      let formattedStoreNo = "";
      if (onlyNums.length < 4) formattedStoreNo = onlyNums;
      else if (onlyNums.length < 6)
        formattedStoreNo = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      else
        formattedStoreNo = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 5)}-${onlyNums.slice(5, 10)}`;
      setMember({ ...member, [name]: formattedStoreNo });
      setCheckStoreOwnerNo(0);
      return;
    }
    */
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
      setTimeout(intervalId);
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
      window.clearInterval(timeout);
      setTimeout(null);
    } else {
      Swal.fire({
        icon: "error",
        text: "인증번호가 일치하지 않습니다. 다시 확인해주세요.",
      });
    }
  };

  useEffect(() => {
    if (time === 0) {
      window.clearInterval(timeout);
      setMailAuthCode(null);
      setTimeout(null);
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
  /*
  const handleStoreOwnerNoCheck = () => {
    if (member.storeOwnerNo.length < 12) {
      Swal.fire({
        icon: "warning",
        text: "사업자번호 10자리를 모두 입력해주세요.",
      });
      return;
    }
    storeDupCheck();
  };

  const storeDupCheck = () => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/member/storeDupCheck?storeOwnerNo=${member.storeOwnerNo}`,
      )
      .then((res) => {
        if (res.data === null || res.data === "") {
          Swal.fire({ icon: "success", text: "사용 가능한 사업자번호입니다." });
          setCheckStoreOwnerNo(2);
        } else {
          Swal.fire({ icon: "error", text: "중복된 사업자번호입니다." });
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          text: "사업자번호 중복 확인 중 서버 오류가 발생했습니다.",
        });
      });
  };
*/

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
  /*
  const getStoreOwnerNoMessage = () => {
    if (!member.storeOwnerNo.trim())
      return {
        text: isSubmitted ? "사업자번호를 입력해주세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (member.storeOwnerNo.length < 12)
      return { text: "사업자번호 10자리를 모두 입력해주세요.", isError: true };
    if (checkStoreOwnerNo !== 2)
      return { text: "사업자번호 중복 확인을 눌러주세요.", isError: true };
    return { text: "사용 가능한 사업자번호입니다.", isError: false };
  };
  */
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
  const getStoreNameMessage = () => {
    if (!store.storeName.trim())
      return {
        text: isSubmitted ? "상호명을 입력해주세요." : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };
  const getMemberNameMessage = () => {
    if (!member.memberName.trim())
      return {
        text: isSubmitted ? "대표자명을 입력해주세요." : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };
  /*
  const getOpeningDateMessage = () => {
    if (!member.openingDate.trim())
      return {
        text: isSubmitted ? "개업일자를 선택해주세요." : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };
  */
  const idStatus = getIdMessage();
  const pwStatus = getPwMessage();
  const pwReStatus = getPwReMessage();
  const emailStatus = getEmailMessage();
  const storeNameStatus = getStoreNameMessage();
  const memberNameStatus = getMemberNameMessage();
  const phoneStatus = getPhoneMessage();
  /*
  const openingDateStatus = getOpeningDateMessage();
  const storeOwnerNoStatus = getStoreOwnerNoMessage();
  */
  const joinSubmit = async (e) => {
    e.preventDefault();
    if (isJoining) return;
    setIsSubmitted(true);
    const hasEmpty =
      !member.memberId ||
      !member.memberPw ||
      !memberPwRe ||
      !member.memberEmail ||
      !member.memberPhone.trim() ||
      !store.storeName.trim() ||
      !member.memberName.trim();
    //!member.storeOwnerNo.trim() ||
    //!member.openingDate.trim();
    if (
      hasEmpty ||
      idStatus.isError ||
      pwStatus.isError ||
      pwReStatus.isError ||
      emailStatus.isError ||
      phoneStatus.isError ||
      storeNameStatus.isError ||
      memberNameStatus.isError
      //storeOwnerNoStatus.isError ||
      //openingDateStatus.isError
    ) {
      Swal.fire({
        icon: "warning",
        text: "입력하신 정보를 다시 확인해주세요.",
      });
      return;
    }
    const submitData = {
      ...member,
      ...store,
      memberGrade: 2,
    };
    setIsJoining(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/member/signupManager`,
        submitData,
      );
      await Swal.fire({
        icon: "success",
        text: "사업자 회원가입이 완료되었습니다.",
      });
      navigate("/login");
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: "회원가입 처리 중 오류가 발생했습니다.",
      });
    } finally {
      setIsJoining(false);
    }
  };

  /*
  const [showCalendar, setShowCalendar] = useState(false);
  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setMember({ ...member, openingDate: `${year}-${month}-${day}` });
    setShowCalendar(false);
  };
*/
  return (
    <div
      className={styles.signupScreenContainer}
      ref={containerRef}
      style={{ backgroundImage: `url(${selectedBg})` }}
    >
      {/* 마우스 이동 이펙트 */}
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

      {/* 에코 버블 */}
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

        {/* 스크롤 가능한 카드 레이아웃 */}
        <div className={`${styles.signupCard} ${styles.signupCardScroll}`}>
          <h2 className={styles.signupTitle}>사업자 회원가입</h2>

          <form className={styles.signupForm} onSubmit={joinSubmit}>
            {/* 아이디 */}
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

            {/* 비밀번호 */}
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

            {/* 비밀번호 확인 */}
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

            {/* 이메일 */}
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

            {/* 휴대폰 번호 */}
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

            {/* 
            사업자번호
            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>사업자번호</label>
              <div className={styles.signupInputArea}>
                <div className={styles.signupInputInner}>
                  <input
                    type="text"
                    name="storeOwnerNo"
                    value={member.storeOwnerNo}
                    onChange={inputMember}
                    className={styles.signupInputUnderline}
                    placeholder="숫자만 입력해주세요."
                    readOnly={checkStoreOwnerNo === 2}
                  />
                  <button
                    type="button"
                    className={styles.signupBtnOutlined}
                    onClick={handleStoreOwnerNoCheck}
                    disabled={checkStoreOwnerNo === 2}
                  >
                    중복 확인
                  </button>
                </div>
                <p
                  className={`${styles.signupStatusMsg} ${storeOwnerNoStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {storeOwnerNoStatus.text}
                </p>
              </div>
            </div>
            */}

            {/* 상호명 */}
            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>상호명</label>
              <div className={styles.signupInputArea}>
                <input
                  type="text"
                  name="storeName"
                  value={store.storeName}
                  onChange={inputMember}
                  className={styles.signupInputUnderline}
                  placeholder="상호명을 입력해주세요."
                />
                <p
                  className={`${styles.signupStatusMsg} ${storeNameStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {storeNameStatus.text}
                </p>
              </div>
            </div>

            {/* 대표자명 */}
            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>대표자명</label>
              <div className={styles.signupInputArea}>
                <input
                  type="text"
                  name="memberName"
                  value={member.memberName}
                  onChange={inputMember}
                  className={styles.signupInputUnderline}
                  placeholder="대표자명을 입력해주세요."
                />
                <p
                  className={`${styles.signupStatusMsg} ${memberNameStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {memberNameStatus.text}
                </p>
              </div>
            </div>

            {/*
             개업일자 선택 영역
            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>개업일자</label>
              <div className={styles.signupInputArea}>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <input
                    type="text"
                    name="openingDate"
                    value={member.openingDate}
                    className={styles.signupInputUnderline}
                    placeholder="YYYY-MM-DD"
                    readOnly
                    onClick={() => setShowCalendar(!showCalendar)}
                    style={{ cursor: "pointer", paddingRight: "35px" }}
                  />
                  <CalendarMonthIcon
                    onClick={() => setShowCalendar(!showCalendar)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      cursor: "pointer",
                      color: "var(--color-brand)",
                    }}
                  />

                  
                  {showCalendar && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: "0",
                        zIndex: 50,
                        marginTop: "5px",
                        borderRadius: "15px",
                        overflow: "hidden",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Calendar
                        onChange={handleDateChange}
                        calendarType="gregory"
                        value={
                          member.openingDate
                            ? new Date(member.openingDate)
                            : new Date()
                        }
                        formatDay={(locale, date) =>
                          date.toLocaleString("en", { day: "numeric" })
                        }
                      />
                    </div>
                  )}
                </div>
                <p
                  className={`${styles.signupStatusMsg} ${openingDateStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {openingDateStatus.text}
                </p>
              </div>
            </div>
            */}

            {/* 가입 버튼 */}
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
                "사업자 회원가입"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerSignup;
