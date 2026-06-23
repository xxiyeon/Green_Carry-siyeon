import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import "./EcoNight.css";

const EcoNight = () => {
  const [isActive, setIsActive] = useState(false);
  const [isFullyDark, setIsFullyDark] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponPosition, setCouponPosition] = useState({
    top: "50%",
    left: "50%",
  });

  //  손전등 크기 상태 (평소 135px)
  const [flashlightSize, setFlashlightSize] = useState("135px");
  const overlayRef = useRef(null);

  useEffect(() => {
    let keys = [];
    const handleKeyDown = (e) => {
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-5);
      if (keys.join("") === "night") {
        triggerBlackout();
        keys = [];
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  const generateRandomPosition = () => {
    const randomTop = Math.floor(Math.random() * 60) + 20;
    const randomLeft = Math.floor(Math.random() * 60) + 20;
    setCouponPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });
  };

  const triggerBlackout = () => {
    if (isActive) return;
    generateRandomPosition();
    setFlashlightSize("135px"); // 초기 크기 고정
    setIsActive(true);
    setIsFullyDark(false);

    setTimeout(() => {
      setIsFullyDark(true);
      //  기존에 여기서 350px로 키우던 로직을 제거했습니다! 끝까지 135px로 찾아야 합니다.
    }, 1000);

    const handleMouseMove = (e) => {
      if (overlayRef.current) {
        overlayRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
        overlayRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  };

  // 로컬 스토리지 포인트 업데이트 함수
  const updateLocalStoragePoints = (newPoint) => {
    const storedMember = JSON.parse(localStorage.getItem("member"));
    if (storedMember) {
      storedMember.memberPoint = newPoint;
      localStorage.setItem("member", JSON.stringify(storedMember));
    }
    localStorage.setItem("memberPoint", newPoint);
    window.dispatchEvent(new Event("storage"));
  };

  const handleCouponClick = async () => {
    if (isSubmitting) return;

    const memberId = localStorage.getItem("memberId");

    if (!memberId) {
      Swal.fire({
        title: "로그인이 필요합니다!",
        icon: "warning",
        background: "#111",
        color: "#fff",
        confirmButtonColor: "#2ecc71",
      }).then(() => resetState());
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/member/Addpoint/${memberId}`,
        { event_code: "NIGHT_COUPON" },
      );

      // 서버에서 준 최신 포인트 동기화
      updateLocalStoragePoints(res.data);

      //  쿠폰을 찾아서 포인트 지급까지 성공하면, 그때 시야를 350px로 확 밝혀줍니다!
      setFlashlightSize("350px");

      Swal.fire({
        title: "올빼미족 인증!",
        html: `어둠 속에서 쿠폰을 발견하셨군요!<br/><b> 2000P 지급!</b>`,
        icon: "success",
        background: "#000",
        color: "#fff",
        confirmButtonColor: "#2ecc71",
      }).then(() => resetState());
    } catch (error) {
      console.error("포인트 지급 실패:", error);
      const errorMsg =
        error.response?.status === 409
          ? "이미 이 쿠폰의 보상을 받으셨습니다!"
          : "시스템 오류가 발생했습니다.";

      Swal.fire({
        title: "앗!",
        text: errorMsg,
        icon: "error",
        background: "#111",
        color: "#ff4757",
        confirmButtonColor: "#ff4757",
      }).then(() => resetState());
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setIsActive(false);
    setIsFullyDark(false);
    setFlashlightSize("135px"); //  리셋할 때도 확실하게 135px로 돌려놓습니다.
  };

  if (!isActive) return null;

  return (
    <>
      <div
        className={`blackout-overlay ${isFullyDark ? "active" : ""}`}
        ref={overlayRef}
        style={{
          "--mouse-x": "50%",
          "--mouse-y": "50%",
          "--flashlight-size": flashlightSize, //  상태에 따라 크기 변경
        }}
      />

      {isFullyDark && (
        <div
          className="secret-coupon"
          onClick={handleCouponClick}
          style={couponPosition}
        >
          🍕 깜짝 쿠폰!
        </div>
      )}
    </>
  );
};

export default EcoNight;
