import React, { useEffect, useRef, useState, useContext } from "react";
import styles from "./CheckoutPage.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore";
import axios from "axios";
import Swal from "sweetalert2";
import { withButtonLoading } from "../../utils/buttonLoading";
import { AuthContext } from "../../context/AuthContext";

const CheckoutPage = () => {
  const { clearCart } = useCartStore();
  const { user, setUser } = useContext(AuthContext);
  const cartList = useCartStore((state) => state.cart);

  const [storeId, setStoreId] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [storeLat, setStoreLat] = useState(0);
  const [storeLong, setStoreLong] = useState(0);

  const [orderList, setOrderList] = useState([]);
  const [usedPoint, setUsedPoint] = useState(0);
  const [getPoint, setGetPoint] = useState(0);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [completeDate, setCompleteDate] = useState("");
  const [orderAmount, setOrderAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const params = new URLSearchParams(location.search);
  const paymentOrderId = params.get("orderId");
  const orderId = paymentOrderId ? Number(paymentOrderId.split("_")[1]) : null;

  const [storeName, setStoreName] = useState("");
  const [orderState, setOrderState] = useState(0);
  const [rawOrderStatus, setRawOrderStatus] = useState(0);
  const [orderDate, setOrderDate] = useState("");
  const [confirmDate, setConfirmDate] = useState("");
  const [totalCarbon, setTotalCarbon] = useState(0);
  const [deliveryType, setDeliveryType] = useState(0);

  const [expectedTime, setExpectedTime] = useState(null);
  const [remainingTimeText, setRemainingTimeText] = useState("시간 계산 중...");
  const [targetArrivalTime, setTargetArrivalTime] = useState("--:--");
  const isFirst = useRef(true);

  //  [추가] 0순위 보안 가드: 비로그인 유저 차단 로직
  useEffect(() => {
    const loggedInMemberId = localStorage.getItem("memberId") || user?.memberId;

    // 로컬스토리지에도 없고 컨텍스트에도 없으면 로그인 안 한 것임
    if (!loggedInMemberId) {
      Swal.fire({
        title: "로그인 필요",
        text: "로그인 후 이용 가능합니다.",
        icon: "warning",
        confirmButtonText: "로그인하러 가기",
      }).then(() => {
        // replace: true를 써야 뒤로가기로 다시 이 페이지에 못 들어옵니다.
        navigate("/login", { replace: true });
      });
    }
  }, [user, navigate]);

  // 1. 하버사인 공식 기반 거리 계산 함수
  const getNumericDistance = (storeLat, storeLng) => {
    const myLat = parseFloat(
      user?.LATITUDE || localStorage.getItem("LATITUDE"),
    );
    const myLng = parseFloat(
      user?.LONGITUDE || localStorage.getItem("LONGITUDE"),
    );
    const sLat = parseFloat(storeLat);
    const sLng = parseFloat(storeLng);

    if (isNaN(myLat) || isNaN(myLng) || isNaN(sLat) || isNaN(sLng)) return null;

    const R = 6371;
    const dLat = ((sLat - myLat) * Math.PI) / 180;
    const dLng = ((sLng - myLng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((myLat * Math.PI) / 180) *
        Math.cos((sLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 2. 뒤로가기 방지 및 히스토리 관리
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);

    const handlePopState = () => {
      Swal.fire({
        title: "알림",
        text: "이미 완료된 주문입니다. 주문 내역으로 이동합니다.",
        icon: "info",
        confirmButtonText: "확인",
      }).then(() => {
        navigate("/mypage/user/orderList", { replace: true });
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  // 3. 주문 ID 기반 초기 새로고침 (세션 체크)
  useEffect(() => {
    const hasRefreshed = sessionStorage.getItem(`refreshed_${orderId}`);
    if (!hasRefreshed && orderId) {
      sessionStorage.setItem(`refreshed_${orderId}`, "true");
      window.location.reload();
    }
  }, [orderId]);

  // 4. 최신 포인트 정보 서버 동기화
  const fetchLatestPoint = async () => {
    const memberId = localStorage.getItem("memberId") || user?.memberId;
    if (!memberId) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKSERVER}/member/point/${memberId}`,
      );
      const latestPoint = res.data || 0;
      localStorage.setItem("memberPoint", latestPoint);

      setUser((prevUser) => ({
        ...prevUser,
        memberPoint: latestPoint,
      }));
    } catch (err) {
      console.error("포인트 갱신 실패:", err);
    }
  };

  // 5. 주문 상세 데이터 조회 (본인 확인 보안 로직 포함)
  const fetchOrderDetails = () => {
    if (!orderId) return;

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/order/${orderId}`)
      .then((res) => {
        //  [보안 로직: 아이디 대조]
        const loggedInMemberId =
          localStorage.getItem("memberId") || user?.memberId;
        const orderOwnerId = res.data.memberId;

        if (
          loggedInMemberId &&
          orderOwnerId &&
          String(loggedInMemberId).trim() !== String(orderOwnerId).trim()
        ) {
          Swal.fire({
            title: "접근 제한",
            text: "본인의 주문 정보만 확인할 수 있습니다.",
            icon: "error",
            confirmButtonText: "확인",
          }).then(() => {
            navigate("/", { replace: true });
          });
          return;
        }

        setOrderList(res.data.items ?? []);
        setUsedPoint(Number(res.data.usedPoint ?? 0));
        setGetPoint(Number(res.data.getPoint ?? 0));
        setDeliveryPrice(Number(res.data.deliveryPrice ?? 0));
        setStoreName(res.data.storeName ?? "");
        setDeliveryType(Number(res.data.deliveryType ?? 0));
        setOrderDate(res.data.orderDate ?? "");
        setConfirmDate(res.data.confirmDate ?? "");
        setTotalCarbon(Number(res.data.totalReduceCarbon ?? 0));
        setCompleteDate(res.data.completeDate ?? "");
        setExpectedTime(res.data.expectedTime ?? null);
        setStoreId(Number(res.data.storeId ?? 0));

        const status = Number(res.data.orderStatus ?? 0);
        setRawOrderStatus(status);

        if (status === 9 || status < 2) {
          setOrderState(-1);
        } else {
          setOrderState(status - 2);
        }
      })
      .catch((err) => {
        console.error("주문 정보 갱신 실패:", err);
      });
  };

  // 6. 도착 예정 시간 계산 및 실시간 타이머
  useEffect(() => {
    if (rawOrderStatus === 5 && completeDate) {
      const timeText = completeDate.includes(" ")
        ? completeDate.split(" ")[1]
        : completeDate;
      setTargetArrivalTime(timeText || "--:--");
      setRemainingTimeText("이용해 주셔서 감사합니다!");
      return;
    }

    if (
      !confirmDate ||
      !expectedTime ||
      rawOrderStatus === 9 ||
      rawOrderStatus === 5
    ) {
      if (rawOrderStatus === 9) setRemainingTimeText("");
      else if (rawOrderStatus === 5)
        setRemainingTimeText("이용해 주셔서 감사합니다!");
      else setRemainingTimeText("가게 수락 대기 중...");

      setTargetArrivalTime("--:--");
      return;
    }

    const distance = getNumericDistance(storeLat, storeLong);
    const travelTime = deliveryType === 1 ? 0 : Math.ceil((distance || 0) * 6);
    const totalMinutes = Number(expectedTime) + travelTime;

    const safeConfirmDate = confirmDate.replace(" ", "T");
    const targetDate = new Date(safeConfirmDate);
    targetDate.setMinutes(targetDate.getMinutes() + totalMinutes);

    const h = String(targetDate.getHours()).padStart(2, "0");
    const m = String(targetDate.getMinutes()).padStart(2, "0");
    setTargetArrivalTime(`${h}:${m}`);

    const updateTimer = () => {
      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setRemainingTimeText(
          deliveryType === 1 ? "픽업할 시간이에요! 🏃‍♂️" : "곧 도착합니다! 🛵",
        );
        return;
      }

      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      setRemainingTimeText(`${diffMins}분 ${diffSecs}초 남음`);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [
    confirmDate,
    expectedTime,
    rawOrderStatus,
    deliveryType,
    completeDate,
    storeLat,
    storeLong,
    user,
  ]);

  // 7. 주문 취소 처리
  const cancelOrder = withButtonLoading(async () => {
    return Swal.fire({
      title: "주문 취소",
      text: "정말 주문을 취소하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "취소 확정",
      cancelButtonText: "돌아가기",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(
            `${import.meta.env.VITE_BACKSERVER}/stores/order/${orderId}/status`,
            { status: 9 },
          )
          .then(async () => {
            await fetchLatestPoint();
            Swal.fire(
              "취소 완료",
              "주문이 정상적으로 취소되었으며 포인트가 복구되었습니다.",
              "success",
            ).then(() => {
              navigate("/mypage/user/orderList");
            });
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("오류", "주문 취소를 실패했습니다.", "error");
          });
      }
    });
  });

  // 8. 기타 연동 로직
  useEffect(() => {
    if (!storeId) return;
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/location/${storeId}`)
      .then((res) => {
        setStoreLat(Number(res.data.latitude ?? 0));
        setStoreLong(Number(res.data.longitude ?? 0));
      })
      .catch((err) => console.log("가게 좌표 조회 실패:", err));
  }, [storeId]);

  useEffect(() => {
    clearCart();
    fetchOrderDetails();
    const intervalId = setInterval(() => {
      fetchOrderDetails();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    if (!isFirst.current) return;
    isFirst.current = false;
  }, []);

  useEffect(() => {
    fetchLatestPoint();
  }, []);

  useEffect(() => {
    const total = orderList.reduce(
      (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 0),
      0,
    );
    setOrderAmount(total);
  }, [orderList]);

  useEffect(() => {
    const paymentAmount = Math.max(
      0,
      Number(orderAmount ?? 0) +
        Number(deliveryPrice ?? 0) -
        Number(usedPoint ?? 0),
    );
    setFinalPrice(paymentAmount);
  }, [orderAmount, deliveryPrice, usedPoint]);

  // 9. 네이버 지도 렌더링
  useEffect(() => {
    const checkNaver = setInterval(() => {
      if (window.naver && window.naver.maps && mapElement.current) {
        setMapLoaded(true);
        clearInterval(checkNaver);
      }
    }, 100);
    return () => clearInterval(checkNaver);
  }, []);

  useEffect(() => {
    if (
      !mapLoaded ||
      !mapElement.current ||
      !storeLat ||
      !storeLong ||
      !window.naver ||
      !window.naver.maps
    )
      return;

    const { naver } = window;
    const position = new naver.maps.LatLng(storeLat, storeLong);

    try {
      if (!mapRef.current) {
        mapRef.current = new naver.maps.Map(mapElement.current, {
          center: position,
          zoom: 17,
          zoomControl: true,
        });
      } else {
        mapRef.current.setCenter(position);
      }

      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new naver.maps.Marker({
        position,
        map: mapRef.current,
        icon: {
          content: `<div style="background:#1a1a2e; color:#fff; border-radius:50% 50% 50% 0; transform:rotate(-45deg); width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 2px 8px rgba(0,0,0,0.3);"><span style="transform:rotate(45deg)">🍽️</span></div>`,
          size: new naver.maps.Size(40, 40),
          anchor: new naver.maps.Point(20, 40),
        },
      });
    } catch (e) {
      console.error("지도 생성 중 에러:", e);
    }
  }, [mapLoaded, storeLat, storeLong]);

  const getStatusMessage = (status, isPickup) => {
    if (status === 9) return "주문이 아쉽게도 취소되었습니다.";
    if (status === 0 || status === 1)
      return "주문이 전달되었습니다. 사장님의 수락을 기다리고 있어요!";
    if (status === 2)
      return "사장님이 주문을 확인했습니다. 곧 조리가 시작됩니다.";
    if (status === 3)
      return "맛있게 음식을 조리하고 있습니다. 조금만 기다려주세요 🍳";
    if (status === 4)
      return isPickup
        ? "음식이 준비되었습니다! 매장으로 방문해 주세요 🏃‍♂️"
        : "기사님이 배달을 출발했습니다! 곧 도착합니다 🛵";
    if (status === 5)
      return isPickup
        ? "픽업이 완료되었습니다. 맛있게 드세요! 😋"
        : "배달이 완료되었습니다. 맛있게 드세요! 😋";
    return "주문 상태를 확인하고 있습니다.";
  };

  const isPickupInUI = deliveryType === 1;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.completeCard}>
          <div
            className={styles.completeIcon}
            style={{ backgroundColor: rawOrderStatus === 9 ? "#ff4757" : "" }}
          >
            {rawOrderStatus === 9 ? "✕" : "✓"}
          </div>

          <h1 className={styles.completeTitle}>
            {rawOrderStatus === 9
              ? "주문이 취소되었습니다."
              : "주문이 완료되었습니다!"}
          </h1>

          <p className={styles.completeDesc}>
            {rawOrderStatus === 9
              ? "결제하신 금액은 카드사에 따라 영업일 기준 2~3일 내로 환불될 예정입니다."
              : isPickupInUI
                ? "매장 방문 픽업을 선택해 주셔서 감사합니다."
                : "친환경 배달을 선택해 주셔서 감사합니다."}
          </p>

          <button
            className={styles.orderCheckBtn}
            onClick={() => navigate("/mypage/user/orderList")}
          >
            주문내역 확인
          </button>

          <p
            className={styles.orderNumber}
            onClick={() => navigate("/mypage/user/orderList")}
          >
            ECO-{orderDate ? orderDate.substring(0, 10).replace(/-/g, "") : ""}-
            {orderId}
          </p>
        </section>

        <section className={styles.statusCard}>
          <h2 className={styles.sectionTitle}>실시간 주문 현황</h2>

          <div className={styles.progressWrapper}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${Math.max(0, Math.min(100, (orderState / 3) * 100))}%`,
                }}
              >
                <span className={styles.seed}>🌱</span>
              </div>
            </div>

            <div className={styles.progressSteps}>
              {[
                "주문 접수",
                "조리중",
                isPickupInUI ? "픽업 대기" : "배달중",
                isPickupInUI ? "픽업 완료" : "배달 완료",
              ].map((label, index) => (
                <div key={index} className={styles.step}>
                  <div
                    className={`${styles.circle} ${orderState >= index ? styles.active : ""}`}
                  />
                  <p
                    className={
                      orderState >= index ? styles.labelActive : styles.label
                    }
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className={styles.statusMessage}>
            {getStatusMessage(rawOrderStatus, isPickupInUI)}
          </p>
        </section>

        <div className={styles.bottomSection}>
          <section className={styles.leftColumn}>
            <div className={styles.mapCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <span className={styles.smallIcon}></span>
                  <h3 className={styles.cardTitle}>
                    가게 위치 &gt;{" "}
                    <span className={styles.subtitle}>{storeName}</span>
                  </h3>
                </div>
              </div>

              <div className={styles.mapBox}>
                <div className={styles.mapWrapper}>
                  {!mapLoaded && (
                    <div className={styles.mapLoading}>
                      지도를 불러오는 중입니다...
                    </div>
                  )}
                  {mapLoaded && (!storeLat || !storeLong) && (
                    <div className={styles.mapLoading}>
                      가게 위치 정보를 불러오는 중입니다...
                    </div>
                  )}
                  <div ref={mapElement} className={styles.map} />
                </div>
              </div>

              <div className={styles.arrivalRow}>
                <div className={styles.arrivalLeft}>
                  <span
                    className={styles.smallIcon}
                    style={{
                      backgroundColor:
                        rawOrderStatus === 5 ? "#2f8f46" : "#ccc",
                      boxShadow:
                        rawOrderStatus === 5
                          ? "0 0 8px rgba(47, 143, 70, 0.6)"
                          : "none",
                    }}
                  ></span>
                  <span
                    style={{
                      color: rawOrderStatus === 5 ? "#2f8f46" : "#333",
                      fontWeight: rawOrderStatus === 5 ? "bold" : "500",
                    }}
                  >
                    {rawOrderStatus === 5
                      ? isPickupInUI
                        ? "픽업 완료 시간"
                        : "배달 완료 시간"
                      : rawOrderStatus !== 9
                        ? isPickupInUI
                          ? "픽업 예정 시간"
                          : "도착 예정 시간"
                        : "주문이 취소되었습니다."}
                  </span>
                  {rawOrderStatus === 5 && completeDate && (
                    <span style={{ color: "#2f8f46", fontWeight: "bold" }}>
                      {" "}
                      {completeDate}{" "}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#ff4757",
                      marginTop: "2px",
                    }}
                  >
                    {remainingTimeText}
                  </span>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    {targetArrivalTime}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <aside className={styles.rightColumn}>
            <div className={styles.orderInfoCard}>
              <h3 className={styles.rightTitle}>주문 내역</h3>
              {orderDate && (
                <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                  주문 일시 : {orderDate}
                </p>
              )}
              {confirmDate && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "#2f8f46",
                    fontWeight: "bold",
                    margin: "5px 0",
                  }}
                >
                  주문 승인 : {confirmDate}
                </p>
              )}

              <div className={styles.orderList}>
                <OrderListMap orderList={orderList} />
                <div className={styles.orderRow}>
                  <span>상품 금액</span>
                  <span>{orderAmount.toLocaleString()} 원</span>
                </div>
                <div className={styles.orderRow}>
                  <span>{isPickupInUI ? "포장 / 픽업" : "배달팁"}</span>
                  <span>{deliveryPrice.toLocaleString()} 원</span>
                </div>
                <div className={styles.orderRow}>
                  <span>에코포인트 사용</span>
                  <span>- {usedPoint.toLocaleString()} 원</span>
                </div>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.totalRow}>
                <span>총 결제 금액</span>
                <strong
                  style={{
                    color: rawOrderStatus === 9 ? "#999" : "",
                    textDecoration:
                      rawOrderStatus === 9 ? "line-through" : "none",
                  }}
                >
                  {finalPrice.toLocaleString()} 원
                </strong>
              </div>
            </div>

            <div className={styles.ecoCard}>
              <div className={styles.ecoHeader}>
                <span className={styles.smallIcon}></span>
                <h3 className={styles.rightTitle}>환경 기여도</h3>
              </div>
              <div className={styles.ecoInnerBox}>
                <p className={styles.ecoInnerTitle}>
                  이번 주문으로 절감한 탄소
                </p>
                <strong className={styles.ecoValue}>{getPoint}g</strong>
                <p className={styles.ecoInnerDesc}>
                  이번 주문으로 나무 가지 하나를 피웠습니다!
                </p>
              </div>
              <div className={styles.ecoInfoRow}>
                <span>에코 포인트 적립</span>
                <strong>+{getPoint.toLocaleString()}p</strong>
              </div>
              <div className={styles.ecoInfoRow}>
                <span>누적 탄소 절감량</span>
                <strong>
                  {totalCarbon ? totalCarbon.toLocaleString() : "0"}kg
                </strong>
              </div>
            </div>

            <button
              className={styles.primaryBtn}
              onClick={() => navigate("/mypage/user/orderList")}
            >
              주문 목록 보기
            </button>
            {(rawOrderStatus === 0 || rawOrderStatus === 1) && (
              <button className={styles.secondaryBtn} onClick={cancelOrder}>
                주문 취소
              </button>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;

const OrderListMap = ({ orderList }) =>
  orderList.map((cart, index) => (
    <OrderItemList key={`orderList-${index}`} cart={cart} />
  ));
const OrderItemList = ({ cart }) => (
  <div style={{ marginBottom: "10px" }}>
    <div className={`${styles.orderRow} ${styles.order_price}`}>
      <span>
        {cart.menuName} * {cart.quantity}
      </span>
      <span>{(cart.price * cart.quantity).toLocaleString()}원</span>
    </div>
    {cart.optionString && (
      <p
        className={styles.option_list}
        style={{ fontSize: "12px", color: "#888" }}
      >
        {cart.optionString}
      </p>
    )}
  </div>
);
