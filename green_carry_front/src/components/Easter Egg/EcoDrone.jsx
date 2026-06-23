import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import axios from "axios"; //  axios 추가
import "./EcoDrone.css";

const EcoDrone = () => {
  const [isActive, setIsActive] = useState(false);
  const [isDropped, setIsDropped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); //  중복 요청 방지

  const droneRef = useRef(null);
  const targetPos = useRef({ x: -100, y: 100 });
  const currentPos = useRef({ x: -100, y: 100 });
  const requestRef = useRef();

  useEffect(() => {
    let keys = [];
    const secretWord = "drone";

    const handleKeyDown = (e) => {
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-5);
      if (keys.join("") === secretWord) {
        setIsActive(true);
        setIsDropped(false);
        keys = [];
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isActive || isDropped) return;

    const handleMouseMove = (e) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = Math.min(e.clientY, 900); // 드론이니까 좀 높게 날게 수정
    };
    window.addEventListener("mousemove", handleMouseMove);

    const update = () => {
      currentPos.current.x +=
        (targetPos.current.x - currentPos.current.x) * 0.05;
      currentPos.current.y +=
        (targetPos.current.y - currentPos.current.y) * 0.05;

      if (droneRef.current) {
        const tilt = (targetPos.current.x - currentPos.current.x) * 0.1;
        droneRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) rotate(${tilt}deg)`;
      }
      requestRef.current = requestAnimationFrame(update);
    };
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, isDropped]);

  //  로컬 스토리지 포인트 동기화 (전역 업데이트)
  const syncPoints = (newPoint) => {
    const member = JSON.parse(localStorage.getItem("member"));
    if (member) {
      member.memberPoint = newPoint;
      localStorage.setItem("member", JSON.stringify(member));
    }
    localStorage.setItem("memberPoint", newPoint);
    window.dispatchEvent(new Event("storage")); // 네비바 등에 신호 발송
  };

  // 상자 투하 및 포인트 적립 로직
  const handleDrop = async () => {
    if (isDropped || isSubmitting) return;

    const memberId = localStorage.getItem("memberId");
    if (!memberId) {
      Swal.fire({
        title: "로그인 필요",
        icon: "warning",
        background: "#f8f9fa",
      });
      setIsActive(false);
      return;
    }

    setIsDropped(true); // 1. 상자 떨어지는 애니메이션 시작
    setIsSubmitting(true);

    try {
      // 2. 서버에 포인트 지급 요청 (이벤트 코드: DRONE_SUPPLY)
      const res = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/member/Addpoint/${memberId}`,
        { event_code: "DRONE_SUPPLY" },
      );

      // 3. 상자가 바닥에 닿을 때쯤(1.2초 후) 알림 띄우기
      setTimeout(() => {
        // 로컬 스토리지 업데이트
        syncPoints(res.data);

        Swal.fire({
          title: "시크릿 보급품 도착!",
          html: `하늘에서 보급품이 떨어졌습니다!<br/><b> 1000P 지급!</b>`,
          icon: "success",
          confirmButtonText: "확인",
          confirmButtonColor: "#2e7d32",
        }).then(() => {
          setIsActive(false); // 드론 퇴근
          setIsSubmitting(false);
        });
      }, 1200);
    } catch (error) {
      console.error("드론 보급 실패:", error);
      const errorMsg =
        error.response?.status === 409
          ? "보급품을 이미 받으셨습니다."
          : "보급 도중 문제가 발생했습니다.";

      setTimeout(() => {
        Swal.fire({
          title: "보급 실패",
          text: errorMsg,
          icon: "error",
          confirmButtonColor: "#d32f2f",
        }).then(() => {
          setIsActive(false);
          setIsSubmitting(false);
        });
      }, 1200);
    }
  };

  if (!isActive) return null;

  return (
    <div className="eco-drone-overlay">
      <div ref={droneRef} className="eco-drone" onClick={handleDrop}>
        <span className="drone-icon">🚁</span>
        <div className={`eco-box ${isDropped ? "drop" : ""}`}>
          <span className="parachute">🪂</span>
          📦
        </div>
      </div>
    </div>
  );
};

export default EcoDrone;
