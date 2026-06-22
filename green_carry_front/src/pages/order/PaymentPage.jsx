import React, { useState, useEffect, useContext } from "react";
import styles from "./PaymentPage.module.css";
import RoomIcon from "@mui/icons-material/Room";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore";
import axios from "axios";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { AuthContext } from "../../context/AuthContext";
import Swal from "sweetalert2";

const PaymentPage = () => {
  //user 가져오기
  const { user } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState({
    memberPhone: "",
    memberAddrCode: "",
    memberAddr: "",
    memberDetailAddr: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchUserInfo = async () => {
      if (!user?.memberId) {
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/member/getMemberInfo`,
          {
            params: { memberId: user.memberId },
          },
        );
        if (response.data) {
          const { memberPhone, memberAddr, memberDetailAddr, memberAddrCode } =
            response.data;
          setUserInfo({
            memberPhone,
            memberAddr,
            memberDetailAddr,
            memberAddrCode: memberAddrCode,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserInfo();
  }, [user?.memberId]);

  const { superTotalPrice, deliveryPrice, setUsingEcoPoint } = useCartStore();
  const navigate = useNavigate();

  // 상태 관리
  const [storeRequest, setStoreRequest] = useState("");
  const [deliveryRequest, setDeliveryRequest] = useState("");
  const [ecoPoint, setEcoPoint] = useState(0); // 사용자가 입력한 사용 포인트
  const [availableEcoPoint, setAvailableEcoPoint] = useState(0); // 로컬 스토리지에서 가져온 보유 포인트

  const [isPaying, setIsPaying] = useState(false);
  const [itemPrice] = useState(superTotalPrice);
  const cartList = useCartStore((state) => state.cart);
  const memberId = localStorage.getItem("memberId");
  const memberAddr = localStorage.getItem("memberAddr");
  const storeId = useCartStore((state) => state.storeId);

  // 배달 타입 및 탄소 계산
  const deliveryType = deliveryPrice === 0 ? 1 : deliveryPrice === 1000 ? 2 : 3;
  const deliveryCarbon = deliveryType === 3 ? 0 : 300;
  const cartStorage = JSON.parse(localStorage.getItem("cartList"));
  const totalCarbon = useCartStore((state) => state.finalCarbon);
  const totalPrice = itemPrice + deliveryPrice - ecoPoint;

  //  [핵심] 페이지 로드 시 로컬 스토리지에서 포인트 바로 가져오기
  useEffect(() => {
    const savedPoint = localStorage.getItem("memberPoint");
    if (savedPoint) {
      setAvailableEcoPoint(Number(savedPoint));
    }
  }, []);

  // 결제 요청 함수
  const handlePayment = async () => {
    if (isPaying) {
      return;
    }
    console.log("주문하려는 매장 ID:", storeId);
    console.log(cartList);
    //  결제 시점의 최신 데이터를 담은 orderData
    const orderData = {
      memberId: memberId,
      storeId: storeId,
      usedPoint: ecoPoint,
      deliveryType: deliveryType,
      reviewStatus: 0,
      deliveryAddress: memberAddr,
      items: cartList.map((item) => ({
        menuId: Number(item.menuId),
        quantity: item.quantity,
        price: item.unitPrice,
        optionString: item.options?.map((o) => o.optionName).join(",") || "",
      })),
      totalPrice: totalPrice,

      getPoint: totalCarbon,
    };

    try {
      setIsPaying(true);
      // 1. 우리 서버에 주문 데이터 임시 저장
      const response = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/stores/order`,
        orderData,
      );

      const savedOrderId = response.data;
      // 2. 토스페이먼츠 호출
      const tossPayments = await loadTossPayments(
        import.meta.env.VITE_TOSS_CLIENT_KEY,
      );
      const payment = tossPayments.payment({ customerKey: `user_${memberId}` });
      console.log("🚀 ~ handlePayment ~ payment:", payment);

      const orderNameStr =
        cartList.length > 1
          ? `${cartList[0].name} 외 ${cartList.length - 1}건`
          : `${cartList[0].name}`;

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: totalPrice,
        },
        orderId: `ORDER_${savedOrderId}_${Date.now()}`,
        orderName: orderNameStr,
        successUrl: `${window.location.origin}/checkoutPage?orderId=ORDER_${savedOrderId}`,
        failUrl: `${window.location.origin}/orderPage`,
        customerName: memberId,
      });
      ///이구간이 결제 완료된 구간

      // Zustand 스토어에 사용 포인트 기록 (필요 시)
      setUsingEcoPoint(ecoPoint);
    } catch (error) {
      console.error("결제 중 에러 발생:", error);
      if (totalPrice === 0) {
        Swal.fire({
          icon: "info",
          text: "최소결제 금액은 1원 이상이어야 합니다. 사용 포인트를 조정해주세요",
        });
      } else {
        Swal.fire({
          icon: "error",
          text: "결제 처리 중 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsPaying(false);
    }
  };
  // 포인트 입력 핸들러
  const handlePointChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const num = value === "" ? 0 : Number(value);

    // 보유량과 상품가격을 넘지 못하게 제어
    const maxUsable = Math.min(availableEcoPoint, itemPrice);
    setEcoPoint(Math.min(num, maxUsable));
  };

  return (
    <div className={styles["payment-page"]}>
      <main className={styles["payment-main"]}>
        <div className={styles["payment-top-text"]}>
          <button
            className={styles["back-btn"]}
            onClick={() => navigate("/orderPage")}
          >
            장바구니로 돌아가기
          </button>
          <p>주문 정보를 확인하고 결제를 완료하세요</p>
        </div>

        <div className={styles["payment-content"]}>
          {/* 왼쪽 섹션 */}
          <section className={styles["payment-left"]}>
            <div className={styles["info-card"]}>
              <div className={styles["card-title-row"]}>
                <div className={styles["card-title-left"]}>
                  <RoomIcon />
                  <h2>배송정보</h2>
                </div>
                {/* <button
                  className={styles["text-btn"]}
                  onClick={() =>
                    navigate("/mypage/user/profile", {
                      state: { openAddress: true },
                    })
                  }
                >
                  주소 변경
                </button> */}
              </div>
              <div className={styles["form-group"]}>
                <label>배송 주소</label>
                <input
                  type="text"
                  value={userInfo.memberAddr + " " + userInfo.memberDetailAddr}
                  readOnly
                />
              </div>
              <div className={styles["form-group"]}>
                <label>연락처</label>
                <input type="text" value={userInfo.memberPhone} readOnly />
              </div>
            </div>

            <div className={styles["info-card"]}>
              <div className={styles["card-title-row"]}>
                <div className={styles["card-title-left"]}>
                  <ChatBubbleIcon />
                  <h2>요청사항</h2>
                </div>
              </div>
              <div className={styles["form-group"]}>
                <label>가게 요청사항</label>
                <input
                  type="text"
                  placeholder="예: 땅콩 알레르기가 있어요"
                  value={storeRequest}
                  onChange={(e) => setStoreRequest(e.target.value)}
                />
              </div>
              <div className={styles["form-group"]}>
                <label>배달 요청사항</label>
                <select
                  value={deliveryRequest}
                  onChange={(e) => setDeliveryRequest(e.target.value)}
                >
                  <option value="">요청사항 선택</option>
                  <option value="door">문 앞에 두고 벨 눌러주세요</option>
                  <option value="call">도착하면 전화주세요</option>
                  <option value="safe">경비실에 맡겨주세요</option>
                </select>
              </div>
            </div>

            <div className={styles["info-card"]}>
              <div className={styles["card-title-row"]}>
                <div className={styles["card-title-left"]}>
                  <CardGiftcardIcon />
                  <h2>에코 포인트 사용 및 적립</h2>
                </div>
              </div>
              <div className={styles["form-group"]}>
                <label>에코 포인트 사용</label>
                <div className={styles["point-row"]}>
                  <input
                    type="text"
                    placeholder="0"
                    value={ecoPoint === 0 ? "" : ecoPoint}
                    onChange={handlePointChange}
                  />
                  <button
                    className={styles["point-all-btn"]}
                    onClick={() =>
                      setEcoPoint(Math.min(availableEcoPoint, itemPrice))
                    }
                    style={{ marginLeft: "10px", cursor: "pointer" }}
                  >
                    전액사용
                  </button>
                  <button
                    className={styles["point-cancel-btn"]}
                    onClick={() => setEcoPoint(0)}
                  >
                    취소
                  </button>
                </div>
                <p className={styles["point-desc"]}>
                  보유 포인트:{" "}
                  <strong>{availableEcoPoint.toLocaleString()}</strong> P
                </p>
              </div>
              <div className={styles["form-group"]}>
                <label>이번 주문으로 받을 포인트(절감 탄소량)</label>
                <input
                  type="text"
                  value={totalCarbon.toLocaleString() + " g"}
                  readOnly
                />
              </div>
            </div>
          </section>

          {/* 오른쪽 섹션 (결제 요약) */}
          <aside className={styles["payment-right"]}>
            <div className={styles["summary-card"]}>
              <h2 className={styles["summary-title"]}>결제 정보</h2>
              <div className={styles["price-list"]}>
                <div className={styles["price-row"]}>
                  <span>상품합계</span>
                  <span>{itemPrice.toLocaleString()}원</span>
                </div>
                <div className={styles["price-row"]}>
                  <span>배달비</span>
                  <span>{deliveryPrice.toLocaleString()}원</span>
                </div>
                <div className={styles["price-row"]}>
                  <span>포인트 사용</span>
                  <span style={{ color: "#ff4757" }}>
                    -{ecoPoint.toLocaleString()}원
                  </span>
                </div>
              </div>
              <div className={styles["total-row"]}>
                <span>최종 결제 금액</span>
                <strong>{totalPrice.toLocaleString()}원</strong>
              </div>
              <div className={styles["carbon-card"]}>
                <p className={styles["carbon-title"]}>🌱 탄소 절감 효과</p>
                <strong className={styles["carbon-value"]}>
                  {totalCarbon.toLocaleString()}g
                </strong>
              </div>
              <button
                className={styles["pay-btn"]}
                onClick={handlePayment}
                disabled={isPaying}
              >
                {totalPrice.toLocaleString()}원 결제하기
              </button>
              <p className={styles["pay-notice"]}>
                결제 시 주문이 확정되며
                <br />
                가게 승인 전까지만 취소가 가능합니다.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;
