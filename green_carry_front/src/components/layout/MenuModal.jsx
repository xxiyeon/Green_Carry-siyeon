import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./MenuModal.module.css";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import useCartStore from "../../store/useCartStore";
import Swal from "sweetalert2";
import { withButtonLoading } from "../../utils/buttonLoading";

export default function MenuModal({
  isOpen,
  onClose,
  menuData,
  currentStoreId,
  currentStoreName,
}) {
  const backHost = import.meta.env.VITE_BACKSERVER;

  const {
    cart,
    storeId: cartStoreId,
    addToCart,
    clearCart,
    setStoreId,
    setStoreName,
  } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [optionList, setOptionList] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [reusable, setReusable] = useState(false);

  // 옵션 분류
  const sizeOptions = optionList.filter((o) => o.optionType === 1);
  const addOnOptions = optionList.filter((o) => o.optionType === 2);
  const ecoOptions = optionList.filter((o) => o.optionType === 3);

  // 선택된 옵션 탄소 비율 총합
  const optionCarbonRateSum = selectedOptions.reduce(
    (sum, item) => sum + Number(item.optionCarbon || 0),
    0,
  );

  // 선택된 eco 옵션 개수
  const selectedEcoCount = selectedOptions.filter(
    (o) => o.optionType === 3,
  ).length;

  // 옵션 가격 합계
  const optionsPriceSum = selectedOptions.reduce(
    (sum, opt) => sum + Number(opt.optionPrice || 0),
    0,
  );

  // 가격 계산
  const unitPrice = Number(menuData?.menuPrice || 0) + optionsPriceSum;
  const totalPrice = unitPrice * quantity;

  // 탄소 계산
  const menuCarbon = Number(menuData?.menuCarbon || 0) * 1000;
  const baseCarbon = menuCarbon + menuCarbon * optionCarbonRateSum;
  const reusableAppliedCarbon = reusable ? baseCarbon * 0.3 : 0;
  const totalCarbon =
    (baseCarbon - reusableAppliedCarbon) * quantity - selectedEcoCount * 20;
  const optionCarbon = Number(selectedEcoCount * 20);
  const totalCarbonReduction = baseCarbon * quantity - totalCarbon;

  // 모달 열릴 때 초기화 및 옵션 조회
  useEffect(() => {
    if (isOpen && menuData?.menuId) {
      setQuantity(1);
      setSelectedOptions([]);
      setReusable(false);

      axios
        .get(`${backHost}/stores/${menuData.menuId}/options`)
        .then((res) => {
          console.log("옵션 데이터 원본:", res.data);
          setOptionList(res.data);

          const defaultSize = res.data.find((o) => o.optionType === 1);
          if (defaultSize) {
            setSelectedOptions([defaultSize]);
          }
        })
        .catch((err) => console.error("옵션 로딩 실패:", err));
    }
  }, [isOpen, menuData, backHost]);

  // 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !menuData) return null;

  // 옵션 토글
  const handleOptionToggle = (option) => {
    setSelectedOptions((prev) => {
      if (option.optionType === 1) {
        const filtered = prev.filter((o) => o.optionType !== 1);
        return [...filtered, option];
      } else {
        const isExist = prev.find((o) => o.optionNo === option.optionNo);

        if (isExist) {
          return prev.filter((o) => o.optionNo !== option.optionNo);
        } else {
          return [...prev, option];
        }
      }
    });
  };

  // 장바구니 담기
  const handleAddToCart = withButtonLoading(async () => {
    const currentId = Number(currentStoreId);
    const savedId = Number(cartStoreId);

    // 장바구니가 비어있지 않고, 저장된 매장 ID가 현재 매장 ID와 다를 때만 경고창
    if (cart.length > 0 && savedId !== 0 && savedId !== currentId) {
      return Swal.fire({
        title: "장바구니에는 한 곳의 매장만 담을 수 있습니다.",
        text: "현재 담긴 메뉴를 삭제하고 이 매장의 메뉴를 담으시겠습니까?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#22c55e",
        cancelButtonColor: "#ccc",
        confirmButtonText: "담기",
        cancelButtonText: "취소",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          clearCart();
          executeAdd();
        } else if (result.isDismissed) {
          console.log("취소 버튼 클릭");
          return;
        }
        // 취소(result.isDismissed) 시에는 아무 일도 일어나지 않음
      });
    } else {
      // 장바구니가 비어있거나 같은 매장일 때
      executeAdd();
    }
  });

  // 2. 실제 장바구니에 데이터를 넣는 함수
  const executeAdd = () => {
    const cartItem = {
      id: Date.now(),
      menuId: menuData.menuId,
      name: menuData.menuName,
      quantity,
      totalPrice: unitPrice,
      unitPrice,
      reusableAppliedCarbon,
      optionCarbon,
      options: selectedOptions,
      menuImage: menuData.menuImage,
    };

    addToCart(cartItem); // 메뉴 추가

    // 🔥 중요: 매장 정보 업데이트를 반드시 "담기"가 확정된 이 순간에만 수행합니다.
    setStoreId(Number(currentStoreId));
    setStoreName(currentStoreName);

    onClose();

    Swal.fire({
      title: "장바구니에 담겼습니다!",
      icon: "success",
      timer: 800,
      showConfirmButton: false,
    });
  };

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div
        className={styles.modal_content}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>메뉴 상세</h2>
          <CloseIcon className={styles.close_btn} onClick={onClose} />
        </div>

        <div className={styles.body}>
          <div className={styles.image_placeholder}>
            {menuData?.menuImage ? (
              <img
                src={menuData.menuImage}
                alt={menuData.menuName}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/150?text=No+Image";
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#f0f0f0",
                }}
              ></div>
            )}
          </div>

          <div className={styles.menu_info}>
            <h3>{menuData.menuName}</h3>
            <p className={styles.desc}>{menuData.menuInfo}</p>
            <p className={styles.price}>
              {Number(menuData.menuPrice || 0).toLocaleString()}원
            </p>
          </div>

          <hr className={styles.divider} />

          <div className={styles.scroll_area}>
            {sizeOptions.length > 0 && (
              <div className={styles.option_section}>
                <h4>사이즈 선택</h4>
                {sizeOptions.map((opt) => (
                  <label
                    key={opt.optionNo}
                    className={`${styles.option_row} ${
                      selectedOptions.find((o) => o.optionNo === opt.optionNo)
                        ? styles.selected
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="size"
                      checked={
                        !!selectedOptions.find(
                          (o) => o.optionNo === opt.optionNo,
                        )
                      }
                      onChange={() => handleOptionToggle(opt)}
                    />
                    <span>{opt.optionName}</span>
                    <span className={styles.price_diff}>
                      {opt.optionPrice > 0
                        ? `+${opt.optionPrice.toLocaleString()}원`
                        : opt.optionPrice < 0
                          ? `${opt.optionPrice.toLocaleString()}원`
                          : "기본"}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {addOnOptions.length > 0 && (
              <div className={styles.option_section}>
                <h4>추가 선택</h4>
                {addOnOptions.map((opt) => (
                  <label
                    key={opt.optionNo}
                    className={`${styles.option_row} ${
                      selectedOptions.find((o) => o.optionNo === opt.optionNo)
                        ? styles.selected
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={
                        !!selectedOptions.find(
                          (o) => o.optionNo === opt.optionNo,
                        )
                      }
                      onChange={() => handleOptionToggle(opt)}
                    />
                    <span>{opt.optionName}</span>
                    <span className={styles.price_diff}>
                      +{opt.optionPrice.toLocaleString()}원
                    </span>
                  </label>
                ))}
              </div>
            )}

            {ecoOptions.length > 0 && (
              <div className={styles.option_section}>
                <h4>오늘도 그린하게 🌱</h4>
                {ecoOptions.map((opt) => (
                  <label
                    key={opt.optionNo}
                    className={`${styles.option_row} ${
                      selectedOptions.find((o) => o.optionNo === opt.optionNo)
                        ? styles.selected
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={
                        !!selectedOptions.find(
                          (o) => o.optionNo === opt.optionNo,
                        )
                      }
                      onChange={() => handleOptionToggle(opt)}
                    />
                    <span>{opt.optionName}</span>
                    <span
                      className={
                        opt.optionName.includes("다회용")
                          ? styles.price_diff
                          : styles.eco_point
                      }
                    >
                      {opt.optionPrice > 0
                        ? `+${opt.optionPrice.toLocaleString()}원`
                        : "+20P"}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className={`${styles.reusable_card} ${
            reusable ? styles.reusable_active : ""
          }`}
        >
          <div className={styles.reusable_info}>
            <div className={styles.reusable_title}>
              <span>🍃 다회용 용기 사용</span>
              <span className={styles.badge}>+에코 포인트</span>
            </div>
            <p>용기 탄소 배출량 30% 감소</p>
          </div>
          <label className={styles.toggle_switch}>
            <input
              type="checkbox"
              checked={reusable}
              onChange={() => setReusable(!reusable)}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.footer}>
          <div className={styles.summary_rows}>
            <span className={styles.summary_label}>수량</span>
            <div className={styles.quantity_control}>
              <RemoveIcon
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className={styles.q_btn}
              />
              <span>{quantity}</span>
              <AddIcon
                onClick={() => setQuantity(quantity + 1)}
                className={styles.q_btn}
              />
            </div>
          </div>

          <div className={styles.summary_row}>
            <div className={styles.summary_con}>
              <span className={styles.summary_label}>총 예상 탄소 배출량</span>
              <span className={styles.carbon_total_red}>
                {totalCarbon.toFixed(1)}g CO2e
              </span>
            </div>
            <div className={styles.summary_con}>
              <span className={styles.summary_label}>총 예상 탄소 절감량</span>
              <span className={styles.carbon_total}>
                {totalCarbonReduction.toFixed(1)}g CO2e
              </span>
            </div>
          </div>

          <button className={styles.submit_btn} onClick={handleAddToCart}>
            {totalPrice.toLocaleString()}원 담기
          </button>
        </div>
      </div>
    </div>
  );
}
