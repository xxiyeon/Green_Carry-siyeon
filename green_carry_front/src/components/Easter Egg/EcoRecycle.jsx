import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import "./EcoRecycle.css";

const EcoRecycle = () => {
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);

  const cloneRef = useRef(null);
  const originRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // 1. 'recycle' 타이핑 감지
  useEffect(() => {
    let keys = [];
    const secretWord = "recycle";

    const handleKeyDown = (e) => {
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-7);
      if (keys.join("") === secretWord) {
        setIsActive(true);
        keys = [];
        Swal.fire({
          title: "♻️ 분리수거 모드 발동!",
          text: "배너, 사진, 카드 등을 마우스로 뜯어서 쓰레기통에 쏙 넣어보세요!",
          icon: "info",
          confirmButtonColor: "#2e7d32",
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. 커스텀 드래그 로직 (이벤트 위임 방식)
  useEffect(() => {
    if (!isActive) return;

    //  배너 슬라이드, 카드, 이미지 등을 뜯어낼 수 있도록 타겟 설정
    const targetSelectors =
      "img, button, h2, h3, div[class*='card_item'], div[class*='banner_slide']";
    const targets = document.querySelectorAll(targetSelectors);

    targets.forEach((el) => el.classList.add("eco-draggable"));

    const handlePointerDown = (e) => {
      const target = e.target.closest(".eco-draggable");
      if (!target) return;

      //  핵심: 텍스트 선택(파란 블록) 및 기본 유령 이미지 드래그 원천 차단
      e.preventDefault();

      originRef.current = target;
      const rect = target.getBoundingClientRect();

      // 마우스가 클릭한 요소 내의 상대 좌표 계산
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // 요소 복제 (마우스에 붙이고 다닐 가짜 요소)
      const clone = target.cloneNode(true);
      clone.classList.add("eco-clone");
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.left = `${rect.left}px`;
      clone.style.top = `${rect.top}px`;

      document.body.appendChild(clone);
      cloneRef.current = clone;

      // 원본 요소는 흐리게 처리
      target.classList.add("eco-hidden");
    };

    const handlePointerMove = (e) => {
      if (!cloneRef.current) return;

      // 복제된 요소가 마우스를 부드럽게 따라다님
      cloneRef.current.style.left = `${e.clientX - offsetRef.current.x}px`;
      cloneRef.current.style.top = `${e.clientY - offsetRef.current.y}px`;
    };

    const handlePointerUp = (e) => {
      if (!cloneRef.current || !originRef.current) return;

      //  복제 요소가 마우스를 가리지 않도록 숨긴 뒤, 현재 위치의 요소(쓰레기통) 확인
      cloneRef.current.style.display = "none";
      const dropZone = document.elementFromPoint(e.clientX, e.clientY);
      const isBin = dropZone && dropZone.closest(".eco-recycle-bin");
      cloneRef.current.style.display = "block"; // 다시 보이게

      if (isBin) {
        // 🗑️ 쓰레기통에 넣기 성공!
        cloneRef.current.style.transition = "all 0.3s ease-in";
        cloneRef.current.style.transform = "scale(0) rotate(180deg)";
        cloneRef.current.style.opacity = "0";

        originRef.current.style.display = "none"; // 원본 영구 삭제

        setScore((prev) => prev + 10); // 점수 획득

        // +10 이펙트
        const floatingText = document.createElement("div");
        floatingText.className = "eco-floating-score";
        floatingText.innerText = "+10";
        dropZone.closest(".eco-recycle-bin").appendChild(floatingText);
        setTimeout(() => floatingText.remove(), 1000);

        // 클론 제거
        setTimeout(() => {
          if (cloneRef.current) cloneRef.current.remove();
          cloneRef.current = null;
        }, 300);
      } else {
        // ❌ 쓰레기통 밖에서 놓았을 때 (원상복구)
        cloneRef.current.remove();
        cloneRef.current = null;
        originRef.current.classList.remove("eco-hidden");
      }

      originRef.current = null;
    };

    // 이벤트 리스너 등록 (캡처링 단계에서 이벤트를 가로채어 스와이퍼 충돌 방지)
    document.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
    });
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      targets.forEach((el) => el.classList.remove("eco-draggable"));
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="eco-recycle-container">
      <div className="eco-score-board">분리수거 점수: {score}</div>
      <button className="eco-close-btn" onClick={() => setIsActive(false)}>
        모드 종료
      </button>

      <div className="eco-recycle-bin">🗑️</div>
    </div>
  );
};

export default EcoRecycle;
