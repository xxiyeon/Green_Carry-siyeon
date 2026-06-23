import React, { useState, useEffect, useRef } from "react";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import styles from "./HeaderNotification.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { withButtonLoading } from "../../utils/buttonLoading";

const HeaderNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [memberId, setMemberId] = useState(null);
  const backHost = import.meta.env.VITE_BACKSERVER;
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("memberId");
    if (saved) setMemberId(saved);
  }, []);

  useEffect(() => {
    if (!memberId) return;

    const fetchUnread = async () => {
      try {
        const res = await axios.get(`${backHost}/api/notification/list`, {
          params: { memberId },
        });
        setNotifications(res.data);
        setUnreadCount(res.data.length);
      } catch (err) {
        console.error("알림 목록 로딩 실패:", err);
      }
    };

    fetchUnread();

    const eventSource = new EventSource(
      `${backHost}/api/notification/subscribe?memberId=${memberId}`,
    );

    eventSource.onopen = () => {
      /* 연결 로그 */
    };
    eventSource.addEventListener("ping", () => {
      /* 핑 로그 */
    });

    eventSource.addEventListener("orderUpdate", async (event) => {
      try {
        const data = JSON.parse(event.data);

        // 포인트 동기화 (기존 로직 동일)
        if (data.message.includes("취소") || data.message.includes("완료")) {
          const token = localStorage.getItem("accessToken");
          const res = await axios.get(`${backHost}/member/point/${memberId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const latestPoint = res.data.point || res.data;
          localStorage.setItem("memberPoint", latestPoint);
          window.dispatchEvent(new Event("pointUpdated"));
        }

        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [
          {
            ...data,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...prev,
        ]);
      } catch (err) {
        console.error("데이터 파싱 에러:", err);
      }
    });

    eventSource.onerror = (e) => {
      /* 에러 처리 */
    };

    return () => {
      eventSource.close();
    };
  }, [memberId, backHost]);

  // 개별 클릭 시
  const handleNotiClick = withButtonLoading(async (_event, notiId, navUrl) => {
    try {
      if (notiId) {
        await axios.patch(`${backHost}/api/notification/read/${notiId}`);
      }
      setNotifications((prev) => prev.filter((n) => n.notiId !== notiId));
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));

      if (navUrl) navigate(navUrl);
      setIsOpen(false);
    } catch (err) {
      console.error("읽음 처리 실패:", err);
    }
  });

  // 💡 [수정] 종 아이콘 클릭 시 빨간 배지 초기화
  const handleIconClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // 드롭다운을 열 때만 숫자 0으로 초기화
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // '지우기' 버튼 클릭 시 호출되는 함수
  const handleClearAll = withButtonLoading(async (event) => {
    try {
      event?.stopPropagation();
      // 1. DB의 모든 알림을 'Y'로 업데이트 (이게 핵심!)
      await axios.patch(`${backHost}/api/notification/read/all`, null, {
        params: { memberId },
      });

      // 2. DB 업데이트 성공 후, 프론트엔드 상태 싹 비우기
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("지우기 실패:", err);
    }
  });

  return (
    <div className={styles.noti_icon_wrap} ref={dropdownRef}>
      <NotificationsNoneIcon
        className={styles.bell_icon}
        onClick={handleIconClick}
      />
      {unreadCount > 0 && (
        <span className={styles.noti_badge}>{unreadCount}</span>
      )}

      {isOpen && (
        <div className={styles.noti_dropdown}>
          <div className={styles.noti_header}>
            <span>최근 알림</span>
          </div>

          <div className={styles.noti_list}>
            {notifications.length > 0 ? (
              <>
                {notifications.map((noti) => (
                  <div
                    key={noti.notiId || Math.random()}
                    className={styles.noti_item}
                    onClick={(e) =>
                      handleNotiClick(e, noti.notiId, noti.navUrl)
                    }
                  >
                    <p className={styles.noti_msg}>{noti.message}</p>
                    <span className={styles.noti_time}>
                      {noti.time || noti.createdAt}
                    </span>
                  </div>
                ))}

                {/* 💡 오른쪽 아래 작게 배치된 '지우기' 버튼 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: "5px 15px 10px 0", // 위 5, 오른쪽 15, 아래 10 여백
                  }}
                >
                  <button
                    onClick={(e) => {
                      handleClearAll(e);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#999",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    지우기
                  </button>
                </div>
              </>
            ) : (
              <p className={styles.empty_msg}>새로운 알림이 없습니다. 🌿</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default HeaderNotification;
