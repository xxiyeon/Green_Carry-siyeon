import { useContext, useEffect, useState } from "react";
import styles from "../ManagerDashboard.module.css";
import OrderStatsChart from "./managerCharts/OrderStatsChart";
import ReviewStatsChart from "./managerCharts/ReviewStatsChart";
import DeliveryPathStats from "./managerCharts/DeliveryPathStats";
import { AuthContext } from "../../../../context/AuthContext";
import axios from "axios";

const StoreStats = () => {
  const { user } = useContext(AuthContext);
  const backHost = import.meta.env.VITE_BACKSERVER;

  const [storeId, setStoreId] = useState(null);
  const [orderStatsData, setOrderStatsData] = useState([]); // 주문/배달 경로 데이터
  const [reviewStatsData, setReviewStatsData] = useState(null); // 리뷰 별점 데이터
  const [isLoading, setIsLoading] = useState(true);

  // 수치보정 함수 (100% 로 맞추기)
  const getAdjustedData = (rawData) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      // rawData가 배열인지 검증
      return [];
    }
    // 1.모든숫자 정수로 만들기
    let roundedData = rawData.map((item) => {
      const multiplied = (item.percent || 0) * 10;
      const rounded = Math.round(multiplied);
      return {
        ...item,
        tempValue: rounded, // 정수값 저장 (333)
        diff: multiplied - rounded, // 오차 저장
      };
    });
    // 2.현재 합계 계산(정수)
    const currentSum = roundedData.reduce(
      (sum, item) => sum + item.tempValue,
      0,
    );
    const targetSum = 1000; // 100.0%는 정수로 1000
    let difference = targetSum - currentSum; // 모자라거나 남는 양 (예: 2)

    // 3.오차보정
    if (difference !== 0) {
      const sortedByDiff = [...roundedData].sort((a, b) => b.diff - a.diff);
      const direction = difference > 0 ? 1 : -1;
      const absDiff = Math.abs(difference);

      for (let i = 0; i < absDiff; i++) {
        // 차이가 큰 항목부터 0.1%씩 조정
        const targetIndex = roundedData.findIndex(
          (item) => item === sortedByDiff[i % roundedData.length],
        );
        if (targetIndex !== -1) {
          roundedData[targetIndex].tempValue += direction;
        }
      }
    }
    // 4. 다시 10으로 나눠서 최종 percent 결정 (334 -> 33.4)
    return roundedData.map((item) => ({
      ...item,
      percent: item.tempValue / 10,
      tempValue: undefined, // 임시 변수 삭제
      diff: undefined, // 임시 변수 삭제
    }));
  };

  // 현재 날짜를 'YYYY-MM' 형식으로 반환 (예: 2026-04)
  const getYearMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  useEffect(() => {
    if (user && user.memberId && user.memberGrade === 2) {
      setIsLoading(true);

      // 1️⃣ 먼저 memberId로 storeId를 조회합니다.
      axios
        .get(`${backHost}/stores/id`, {
          params: { memberId: user.memberId },
        })
        .then((res) => {
          const fetchedStoreId = res.data.storeId;
          // [수정] storeId는 수치 보정 함수(getAdjustedData)를 타면 안 됩니다.
          setStoreId(fetchedStoreId);

          if (fetchedStoreId) {
            // 2️⃣ storeId가 확인되면 주문 통계와 리뷰 통계를 동시에 요청합니다.
            return Promise.all([
              axios.get(`${backHost}/stores/stats/order`, {
                params: {
                  storeId: fetchedStoreId,
                  yearMonth: getYearMonth(),
                },
              }),
              axios.get(`${backHost}/stores/stats/review`, {
                params: { storeId: fetchedStoreId },
              }),
            ]);
          }
        })
        .then((responses) => {
          if (responses) {
            const [orderRes, reviewRes] = responses;

            // 📊 주문 및 배달 경로 데이터 설정 (배달비 포함 금액 처리)
            console.log("주문 통계 로드 완료:", orderRes.data);
            const rawOrderData = orderRes.data || [];

            // 전체 금액 합산 (seriesAmount 기준)
            const totalSales = rawOrderData.reduce(
              (sum, item) => sum + (item.seriesAmount || 0),
              0,
            );

            let finalOrderData = [];
            if (totalSales > 0) {
              // 각 항목별 비중(%)을 먼저 계산한 배열 생성
              const dataWithPercent = rawOrderData.map((item) => ({
                ...item,
                percent: ((item.seriesAmount || 0) / totalSales) * 100,
              }));
              // 퍼센트가 들어간 배열을 보정 함수에 넘김
              finalOrderData = getAdjustedData(dataWithPercent);
            } else {
              finalOrderData = rawOrderData;
            }

            setOrderStatsData(finalOrderData);

            //  리뷰 통계 데이터 가공 및 설정
            const rd = reviewRes.data;
            const total = rd.totalCount || 1; // 0으로 나누기 방지

            // 차트에서 사용할 비율(%) 계산
            const series = [
              Math.round((rd.star5 / total) * 100),
              Math.round((rd.star4 / total) * 100),
              Math.round((rd.star3 / total) * 100),
              Math.round((rd.star2 / total) * 100),
              Math.round((rd.star1 / total) * 100),
            ];

            setReviewStatsData({
              avgRating: rd.avgRating,
              totalCount: rd.totalCount,
              reviewCounts: {
                star5: rd.star5,
                star4: rd.star4,
                star3: rd.star3,
                star2: rd.star2,
                star1: rd.star1,
              },
              series: series,
            });
          }
        })
        .catch((err) => {
          console.error("통계 데이터 로드 중 에러 발생:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user, backHost]);

  if (isLoading)
    return (
      <div className={styles.loadingBox}>데이터를 불러오는 중입니다...</div>
    );

  return (
    <div className={styles.statsLayout}>
      {/* 1. 왼쪽: 주문 통계 + 배달 경로 */}
      <div className={`${styles.commonCard} ${styles.combinedStatsCard}`}>
        {/* [수정] seriesAmount라는 변수는 없으므로 orderStatsData 자체를 넘깁니다 */}
        <OrderStatsChart data={orderStatsData} />
        <div className={styles.deliveryPathSection}>
          <div className={styles.centeredSubTitleGroup}>
            <h3 className={styles.sectionSubTitle}>배달 경로</h3>
          </div>
          <DeliveryPathStats data={orderStatsData} />
        </div>
      </div>

      {/* 2. 오른쪽: 리뷰 통계 (DB 데이터 연결) */}
      <div className={`${styles.commonCard} ${styles.rightCardArea}`}>
        {reviewStatsData ? (
          <ReviewStatsChart data={reviewStatsData} />
        ) : (
          <div className={styles.emptyMsg}>리뷰 데이터가 없습니다. 🌱</div>
        )}
      </div>
    </div>
  );
};

export default StoreStats;
