import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import styles from "./OrderPage.module.css";
import Header from "../../components/commons/Header";
import Footer from "../../components/commons/Footer";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import ParkIcon from "@mui/icons-material/Park";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import axios from "axios";

const OrderPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const backHost = import.meta.env.VITE_BACKSERVER;

  // Zustand 스토어 데이터 추출
  const cartList = useCartStore((state) => state.cart);
  const clear = useCartStore((state) => state.clearCart);
  const storeId = useCartStore((state) => state.storeId);
  const storeName = useCartStore((state) => state.storeName);
  const setSuperTotalPrice = useCartStore((state) => state.setSuperTotalPrice);
  const setDeliveryPrice = useCartStore((state) => state.setDeliveryPrice);
  const { increaseQuantity, decreaseQuantity } = useCartStore();
  const setFinalCarbon = useCartStore((state) => state.setFinalCarbon);

  // 상태 관리
  const [selectedRide, setSelectedRide] = useState("pickup");
  const [realTotal, setRealTotal] = useState(0);
  const [deliveryType, setDeliveryType] = useState(1);
  const [num, setNum] = useState(0);
  const [storeLat, setStoreLat] = useState(0);
  const [storeLong, setStoreLong] = useState(0);

  const lat2 = localStorage.LATITUDE;
  const lon2 = localStorage.LONGITUDE;

  const isCartEmpty = !cartList || cartList.length === 0;
  const Co2PerKm = 80;

  //  [수정] 결제창 진입 시 DB 값으로 로컬스토리지 포인트 강제 갱신
  useEffect(() => {
    const fetchLatestPoint = async () => {
      // 컨텍스트에 없으면 로컬스토리지에서라도 가져옴
      const memberId = user?.memberId || localStorage.getItem("memberId");

      if (!memberId) return;

      try {
        const token = localStorage.getItem("accessToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        //  형님이 알려주신 포인트 전용 API 호출
        const res = await axios.get(
          `${backHost}/member/point/${memberId}`,
          config,
        );

        //  서버에서 받아온 진짜 포인트 값을 로컬스토리지에 덮어쓰기
        // res.data가 숫자 바로 오는 구조라면 그대로 넣으시면 됩니다.
        if (res.data !== undefined) {
          localStorage.setItem("memberPoint", res.data);
          console.log("DB 포인트와 로컬스토리지 동기화 완료:", res.data);
        }
      } catch (err) {
        console.error("결제 전 포인트 동기화 실패:", err);
      }
    };

    fetchLatestPoint();
  }, [user?.memberId, backHost]);

  // 탄소 절감량 계산
  const totalCarbon = Math.floor(
    cartList.reduce(
      (sum, item) =>
        sum + (item.reusableAppliedCarbon * item.quantity + item.optionCarbon),
      0,
    ),
  );

  useEffect(() => {
    if (!storeId) return;
    axios
      .get(`${backHost}/stores/location/${storeId}`)
      .then((res) => {
        setStoreLat(res.data.latitude);
        setStoreLong(res.data.longitude);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [storeId, backHost]);

  useEffect(() => {
    setNum(deliveryType === 1 ? 0 : deliveryType === 2 ? 1000 : 3000);
  }, [deliveryType]);

  const getDistance = (storeLat, storeLong, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - storeLat) * (Math.PI / 180);
    const dLon = (lon2 - storeLong) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(storeLat * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = getDistance(storeLat, storeLong, lat2, lon2);

  const formatTime = (distance) => {
    if (distance === null || isNaN(distance)) {
      return { bike: "계산 중...", motor: "계산 중..." };
    }
    const bikeTime = 15 + distance * 6;
    const motorTime = 15 + (distance * 6) / 3;
    const bikeRounded = Math.round(bikeTime / 5) * 5;
    const motorRounded = Math.round(motorTime / 5) * 5;

    return {
      bike: `${bikeRounded}분`,
      motor: `${motorRounded}분`,
    };
  };

  const finalCarbon =
    totalCarbon +
    (deliveryType === 3 ? 0 : Math.round(distance) * Co2PerKm * 2);

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        {isCartEmpty ? (
          <section className={styles.emptySection}>
            <div className={styles.emptyCard}>
              <div className={styles.emptyIcon}>
                <ShoppingBasketIcon />
              </div>
              <h2>장바구니가 비어있습니다</h2>
              <p>맛있는 음식을 담으러 가볼까요?</p>
              <button
                className={styles.goHomeButton}
                onClick={() => navigate("/")}
              >
                홈으로 가기
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className={styles.leftSection}>
              <div className={styles.card}>
                <div className={styles.cardsHeader}>
                  <h2
                    onClick={() => navigate(`/storeView/${storeId}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <u>{storeName}</u> <NavigateNextIcon />
                  </h2>
                  <CloseIcon style={{ cursor: "pointer" }} onClick={clear} />
                </div>
                <MenuList
                  cartList={cartList}
                  changeTotal={setRealTotal}
                  increaseQuantity={increaseQuantity}
                  decreaseQuantity={decreaseQuantity}
                />
              </div>
              <div className={styles.totalPriceText}>
                <u>
                  총 결제금액 <br />
                  {(realTotal + num).toLocaleString()}원
                </u>
              </div>
            </section>

            <section className={styles.rightSection}>
              <div className={styles.card_ride}>
                <h3>배달방식</h3>
                <p>탄소 절감량은 왕복으로 계산됩니다.</p>
                <div
                  className={`${styles.miniCard} ${selectedRide === "pickup" ? styles.selected : ""}`}
                  onClick={() => {
                    setSelectedRide("pickup");
                    setDeliveryType(1);
                  }}
                >
                  <DirectionsRunIcon />
                  <p>픽업</p>
                  <p className={styles.feeText}>배달비 0원</p>
                  <div className={styles.carbonBadge}>
                    <p>🌱1km당 탄소 -{Co2PerKm * 2}g</p>
                  </div>
                </div>

                <div
                  className={`${styles.miniCard} ${selectedRide === "bike" ? styles.selected : ""}`}
                  onClick={() => {
                    setSelectedRide("bike");
                    setDeliveryType(2);
                  }}
                >
                  <DirectionsBikeIcon />
                  <p>도보 / 자전거</p>
                  <p className={styles.feeText}>1,000원</p>
                  <span>예상 배달 시간 {formatTime(distance).bike}</span>
                  <div className={styles.carbonBadge}>
                    <p>🌱1km당 탄소 -{Co2PerKm * 2}g</p>
                  </div>
                </div>

                <div
                  className={`${styles.miniCard} ${selectedRide === "moto" ? styles.selected : ""}`}
                  onClick={() => {
                    setSelectedRide("moto");
                    setDeliveryType(3);
                  }}
                >
                  <TwoWheelerIcon />
                  <p>오토바이</p>
                  <p className={styles.feeText}>3,000원</p>
                  <span>예상 배달 시간 {formatTime(distance).motor}</span>
                </div>

                <div className={styles.ecoInfoContainer}>
                  <div className={styles.ecoTitle}>
                    <ParkIcon />
                    <h4>에코 딜리버리 선택</h4>
                  </div>
                  <div className={styles.ecoList}>
                    <div className={styles.ecoItem}>
                      <span>이동 거리:</span>
                      <span>{distance.toFixed(2)}km</span>
                    </div>
                    <div className={styles.ecoItem}>
                      <span>탄소 절감:</span>
                      <span>{finalCarbon}g</span>
                    </div>
                    <div className={styles.ecoItem}>
                      <span>적립 예정:</span>
                      <span>{finalCarbon} 포인트</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={styles.payButton}
                onClick={() => {
                  setSuperTotalPrice(realTotal);
                  setDeliveryPrice(num);
                  setFinalCarbon(finalCarbon);
                  navigate("/paymentPage");
                }}
              >
                결제하기
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

// MenuList 컴포넌트
const MenuList = ({
  cartList,
  changeTotal,
  increaseQuantity,
  decreaseQuantity,
}) => {
  const totalPrice = cartList.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  useEffect(() => {
    changeTotal(totalPrice);
  }, [totalPrice, changeTotal]);

  return cartList.map(
    (
      cart,
      index, // key값 index 추가로 중복 방지
    ) => (
      <CartItem
        key={`${cart.menuId}-${index}`}
        cart={cart}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
      />
    ),
  );
};

// CartItem 컴포넌트
const CartItem = ({ cart, increaseQuantity, decreaseQuantity }) => {
  const unitPrice = cart.unitPrice;
  const totalPrice = unitPrice * cart.quantity;
  const options = cart.options;
  const backHost = import.meta.env.VITE_BACKSERVER;
  const [fetchedImage, setFetchedImage] = useState("");

  useEffect(() => {
    if (cart.menuId) {
      axios
        .get(`${backHost}/stores/orders/itemImg/${cart.menuId}`)
        .then((res) => {
          if (res.data) {
            setFetchedImage(`${backHost}${res.data}`);
          }
        })
        .catch((err) => console.log("이미지 로드 에러:", err));
    }
  }, [cart.menuId, backHost]);

  return (
    <div className={styles.menuList}>
      <div className={styles.menuItem}>
        <div className={styles.menuInfo}>
          <p className={styles.menuNameTitle}>메뉴 : {cart.name}</p>
          <p>가격 : {unitPrice.toLocaleString()}원</p>
          <div className={styles.options}>
            옵션 :
            {options && options.length > 0
              ? options.map((option, index) => (
                  <span key={index}>
                    &nbsp;{option.optionName}
                    {index < options.length - 1 ? "," : ""}&nbsp;
                  </span>
                ))
              : " 없음"}
          </div>
          <div className={styles.quantityBox}>
            <button onClick={() => decreaseQuantity(cart.menuId, cart.options)}>
              -
            </button>
            <span>{cart.quantity}</span>
            <button onClick={() => increaseQuantity(cart.menuId, cart.options)}>
              +
            </button>
          </div>
          <p className={styles.itemTotal}>
            소계 : {totalPrice.toLocaleString()}원
          </p>
        </div>

        <div className={styles.menuImageWrapper}>
          <img
            src={cart.menuImage || fetchedImage} // Zustand에 이미지 없으면 서버에서 가져온 거 사용
            alt={cart.name}
            className={styles.menuImage}
            style={{ objectFit: "cover" }}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150?text=No+Image";
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
