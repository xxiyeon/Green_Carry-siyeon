import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./StoreDetail.module.css";

const API_BASE_URL = import.meta.env.VITE_BACKSERVER?.trim() || "";
const isBrowser = typeof window !== "undefined";
const DEFAULT_LATITUDE = 37.497952;
const DEFAULT_LONGITUDE = 127.027619;

const toNumberOrNull = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const dayMap = {
  mon: "월요일",
  tue: "화요일",
  wed: "수요일",
  thu: "목요일",
  fri: "금요일",
  sat: "토요일",
  sun: "일요일",
};

const weekMap = {
  0: "매주",
  1: "매월 첫번째",
  2: "매월 두번째",
  3: "매월 세번째",
  4: "매월 네번째",
};

const dayOrder = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7,
};

export default function StoreDetail() {
  //  배포 환경에서 깨지기 쉬운 API/지도 초기화 흐름을 안전하게 감쌌습니다.
  const { id } = useParams();
  const storeId = Number(id);

  const [storeInfo, setStoreInfo] = useState(null);
  const [operatingHours, setOperatingHours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const mapElement = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(storeId) || storeId <= 0) {
      setLoadError("유효하지 않은 매장 번호입니다.");
      setStoreInfo(null);
      setOperatingHours([]);
      setIsLoading(false);
      return;
    }

    if (!API_BASE_URL) {
      setLoadError("서버 주소가 설정되지 않아 매장 정보를 불러올 수 없습니다.");
      setStoreInfo(null);
      setOperatingHours([]);
      setIsLoading(false);
      console.error("VITE_BACKSERVER is not configured for StoreDetail.");
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError("");

    Promise.allSettled([
      axios.get(`${API_BASE_URL}/stores/${storeId}`),
      axios.get(`${API_BASE_URL}/stores/${storeId}/hours`),
    ]).then(([storeResult, hoursResult]) => {
      if (!isMounted) {
        return;
      }

      if (storeResult.status === "fulfilled") {
        setStoreInfo(storeResult.value.data ?? null);
      } else {
        console.error("상점 정보 로딩 실패:", storeResult.reason);
        setStoreInfo(null);
        setLoadError("매장 정보를 불러오지 못했습니다.");
      }

      if (hoursResult.status === "fulfilled") {
        const hoursList = Array.isArray(hoursResult.value.data)
          ? hoursResult.value.data
          : [];

        const sortedHours = [...hoursList].sort((a, b) => {
          if ((a?.weekOfMonth ?? 0) !== (b?.weekOfMonth ?? 0)) {
            return (a?.weekOfMonth ?? 0) - (b?.weekOfMonth ?? 0);
          }

          const aOrder =
            dayOrder[String(a?.dayOfWeek ?? "").toLowerCase()] ?? 99;
          const bOrder =
            dayOrder[String(b?.dayOfWeek ?? "").toLowerCase()] ?? 99;
          return aOrder - bOrder;
        });

        setOperatingHours(sortedHours);
      } else {
        console.error("운영시간 로딩 실패:", hoursResult.reason);
        setOperatingHours([]);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [storeId]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const checkNaver = setInterval(() => {
      if (window.naver?.maps && mapElement.current) {
        setMapLoaded(true);
        clearInterval(checkNaver);
      }
    }, 100);

    return () => clearInterval(checkNaver);
  }, []);

  useEffect(() => {
    if (!isBrowser || !mapLoaded || !mapElement.current || !storeInfo) {
      return;
    }

    const { naver } = window;
    const lat = toNumberOrNull(storeInfo.latitude) ?? DEFAULT_LATITUDE;
    const lng = toNumberOrNull(storeInfo.longitude) ?? DEFAULT_LONGITUDE;
    const location = new naver.maps.LatLng(lat, lng);

    try {
      const map = new naver.maps.Map(mapElement.current, {
        center: location,
        zoom: 17,
        zoomControl: true,
        minZoom: 10,
      });

      new naver.maps.Marker({
        position: location,
        map,
        icon: {
          content: `<div style="
            background:#1a1a2e;
            color:#fff;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            width:40px;height:40px;
            display:flex;align-items:center;justify-content:center;
            font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.3);
          "><span style="transform:rotate(45deg)">🍽️</span></div>`,
          size: new naver.maps.Size(40, 40),
          anchor: new naver.maps.Point(20, 40),
        },
      });
    } catch (error) {
      console.error("지도 생성 중 에러:", error);
    }
  }, [mapLoaded, storeInfo]);

  if (isLoading) {
    return (
      <div className={styles.container}>상점 정보를 불러오는 중입니다...</div>
    );
  }

  if (!storeInfo) {
    return (
      <div className={styles.container}>
        {loadError || "상점 정보를 찾을 수 없습니다."}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>매장정보</h2>

      <div className={styles.mapWrapper}>
        {!mapLoaded && (
          <div className={styles.mapLoading}>지도를 불러오는 중입니다...</div>
        )}
        <div ref={mapElement} className={styles.map} />
      </div>

      <section className={styles.section}>
        <h3 className={styles.storeName}>
          {storeInfo.storeName || "매장명 없음"}
        </h3>
        <table className={styles.infoTable}>
          <tbody>
            <tr>
              <th>상호명</th>
              <td>{storeInfo.storeName || "-"}</td>
            </tr>
            <tr>
              <th>주소</th>
              <td>{storeInfo.storeAddress || "-"}</td>
            </tr>
            <tr>
              <th>운영시간</th>
              <td>
                {operatingHours.filter((h) => h?.isDayOff === "N").length > 0
                  ? operatingHours
                      .filter((h) => h?.isDayOff === "N")
                      .map((h) => (
                        <div
                          key={`${h.dayOfWeek}-${h.weekOfMonth}-${h.openTime}`}
                        >
                          {dayMap[String(h.dayOfWeek ?? "").toLowerCase()] ||
                            h.dayOfWeek ||
                            "요일 정보 없음"}{" "}
                          : {h.openTime || "-"} ~ {h.closeTime || "-"}
                        </div>
                      ))
                  : "운영시간 정보가 없습니다."}
              </td>
            </tr>
            <tr>
              <th>휴무일</th>
              <td>
                {(() => {
                  const dayOffList = operatingHours.filter(
                    (h) => h?.isDayOff === "Y",
                  );

                  if (dayOffList.length > 0) {
                    return dayOffList
                      .map((h) => {
                        const weekPrefix = weekMap[h.weekOfMonth] || "";
                        const dayText =
                          dayMap[String(h.dayOfWeek ?? "").toLowerCase()] ||
                          h.dayOfWeek ||
                          "휴무일 정보 없음";
                        return `${weekPrefix} ${dayText}`.trim();
                      })
                      .join(", ");
                  }

                  if (operatingHours.length < 7 && operatingHours.length > 0) {
                    return "직접 문의";
                  }

                  return "연중무휴";
                })()}
              </td>
            </tr>
            <tr>
              <th>전화번호</th>
              <td>{storeInfo.storePhone || "-"}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>매장 소개</h3>
        <p className={styles.description}>
          {storeInfo.storeIntro || "소개 정보가 없습니다."}
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>사업자 정보</h3>
        <table className={styles.infoTable}>
          <tbody>
            <tr>
              <th>대표자명</th>
              <td>{storeInfo.storeOwner || "-"}</td>
            </tr>
            <tr>
              <th>상호명</th>
              <td>{storeInfo.storeName || "-"}</td>
            </tr>

            <tr>
              <th>사업자등록번호</th>
              <td>{storeInfo.storeOwnerNo || "-"}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>원산지 표기</h3>
        <p className={styles.description}>
          {storeInfo.storeOriginInfo || "원산지 정보가 없습니다."}
        </p>
      </section>
    </div>
  );
}
