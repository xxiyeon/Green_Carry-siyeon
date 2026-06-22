import React, { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import styles from "./UserOrderList.module.css";
import ReviewModal from "../../../components/layout/ReviewModal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext"; //  AuthContext 경로 확인 필수!
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Pagination from "../../../components/commons/Pagination";
import { withButtonLoading } from "../../../utils/buttonLoading";

const UserOrderListPage = () => {
  const backHost = import.meta.env.VITE_BACKSERVER;
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext); //  전역 유저 상태 제어
  const [orderList, setOrderList] = useState([]);
  const memberId = localStorage.getItem("memberId");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const todayStr = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000,
  )
    .toISOString()
    .split("T")[0];

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const fetchOrders = () => {
    if (!memberId) return;
    axios
      .get(`${backHost}/stores/orders/${memberId}`)
      .then((res) => {
        setOrderList(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("주문 내역 불러오기 실패:", err);
        setOrderList([]);
      });
  };

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [memberId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  //  주문 취소 및 실시간 포인트 복구 로직
  const cancelOrder = withButtonLoading(async (_event, orderId) => {
    Swal.fire({
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
          .patch(`${backHost}/stores/order/${orderId}/status`, { status: 9 })
          .then(() => {
            // ✅ 취소 성공 후 서버에서 최신 포인트 정보 조회
            axios
              .get(`${backHost}/member/${memberId}`)
              .then((memberRes) => {
                const latestPoint = memberRes.data.memberPoint;

                // 1. 로컬스토리지 갱신 (새로고침 시 유지용)
                localStorage.setItem("memberPoint", latestPoint);

                // 2.  핵심: 전역 상태 업데이트 (Header 등 실시간 반영)
                if (user) {
                  setUser({ ...user, memberPoint: latestPoint });
                }

                // 3. 다른 탭을 위한 이벤트 발생
                window.dispatchEvent(new Event("storage"));

                Swal.fire(
                  "취소 완료",
                  "주문이 취소되었으며 포인트가 복구되었습니다.",
                  "success",
                );
                fetchOrders(); // 주문 목록 새로고침
              })
              .catch((err) => {
                console.error("포인트 동기화 실패:", err);
                fetchOrders();
              });
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("오류", "주문 취소에 실패했습니다.", "error");
          });
      }
    });
  });

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orderList];
    if (startDate) {
      filtered = filtered.filter(
        (order) => new Date(order.orderDate) >= new Date(startDate),
      );
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((order) => new Date(order.orderDate) <= end);
    }
    return filtered.sort(
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    );
  }, [orderList, startDate, endDate]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const currentOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalRecentCarbon = useMemo(() => {
    return filteredAndSortedOrders
      .slice(0, 5)
      .reduce((sum, order) => sum + Number(order.getPoint ?? 0), 0);
  }, [filteredAndSortedOrders]);

  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const resetFilter = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const goToCheckoutPage = (order) => {
    const tossStyleOrderId = `ORDER_${order.orderId}_${new Date().getTime()}`;
    const amount = order.totalPrice || 0;
    navigate(`/checkoutPage?orderId=${tossStyleOrderId}&amount=${amount}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topSummary}>
        <p className={styles.summaryLabel}>총 탄소 절감량</p>
        <h2 className={styles.summaryValue}>
          {totalRecentCarbon.toFixed(1)} g CO2
        </h2>
        <p className={styles.summaryDesc}>
          목록 상단 5건의 주문으로 절감한 탄소량 입니다 🌱
        </p>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.dateInputs}>
          <input
            type="date"
            className={styles.dateInput}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={todayStr}
          />
          <span className={styles.dateSeparator}>~</span>
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={todayStr}
          />
        </div>
        <button className={styles.resetBtn} onClick={resetFilter}>
          초기화
        </button>
      </div>

      <div className={styles.orderListWrap}>
        {currentOrders.length > 0 ? (
          currentOrders.map((order, index) => {
            const isCompleted = order.orderStatus === 5;
            const isCanceled = order.orderStatus === 9;
            const isNotReviewed = Number(order.reviewStatus) === 0;
            const isAlreadyReviewed = Number(order.reviewStatus) === 1;

            const orderDateObj = new Date(order.orderDate);
            const now = new Date();
            const diffDays =
              (now.getTime() - orderDateObj.getTime()) / (1000 * 60 * 60 * 24);
            const isWithin3Days = diffDays <= 3;

            return (
              <div
                key={order.orderId || index}
                className={`${styles.orderCard} ${isCanceled ? styles.canceledCard : ""}`}
                onClick={() => !isCanceled && goToCheckoutPage(order)}
                style={{ cursor: isCanceled ? "default" : "pointer" }}
              >
                {isCanceled && (
                  <div className={styles.canceledWatermark}>취소된 주문</div>
                )}

                <div className={styles.orderTop}>
                  <div className={styles.leftInfo}>
                    <img
                      src={
                        order.storeThumb
                          ? `${order.storeThumb}`
                          : "/image/no-image.png"
                      }
                      alt={order.menuName || "메뉴"}
                      className={`${styles.menuThumb} ${isCanceled ? styles.canceledImg : ""}`}
                    />
                    <div className={styles.mainInfo}>
                      <h3 className={styles.storeName}>{order.storeName}</h3>
                      <p className={styles.menuName}>{order.menuName}</p>
                      <p className={styles.orderNo}>
                        주문 번호 {order.orderId}
                      </p>
                    </div>
                  </div>

                  <div className={styles.rightInfo}>
                    <span
                      className={`${styles.statusBadge} ${isCanceled ? styles.canceledBadge : ""}`}
                    >
                      {getOrderStatusText(
                        order.orderStatus,
                        order.deliveryType,
                      )}
                    </span>

                    {(order.orderStatus === 0 || order.orderStatus === 1) && (
                      <button
                        className={styles.cancelBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelOrder(e, order.orderId);
                        }}
                      >
                        주문 취소
                      </button>
                    )}

                    {isCompleted &&
                      (isAlreadyReviewed ? (
                        <button className={styles.reviewBtnDisabled} disabled>
                          작성 완료
                        </button>
                      ) : isNotReviewed && isWithin3Days ? (
                        <button
                          className={styles.reviewBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            openReviewModal(order);
                          }}
                        >
                          리뷰 작성 (3일 이내)
                        </button>
                      ) : (
                        <button className={styles.reviewBtnDisabled} disabled>
                          기한 만료
                        </button>
                      ))}
                  </div>
                </div>

                <div className={styles.orderMiddle}>
                  <div className={styles.infoBlock}>
                    <p className={styles.infoTitle}>주문 정보</p>
                    <p className={isCanceled ? styles.strikeThrough : ""}>
                      {order.totalCount}개 |{" "}
                      {Number(
                        order.totalPrice + order.deliveryPrice ?? 0,
                      ).toLocaleString()}
                      원
                    </p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p className={styles.infoTitle}>주문 날짜</p>
                    <p>{formatDate(order.orderDate)}</p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p className={styles.infoTitle}>매장 위치</p>
                    <p className={styles.addressText}>
                      {order.storeAddress || "정보 없음"}
                    </p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p className={styles.infoTitle}>배달 위치</p>
                    <p className={styles.addressText}>
                      {order.deliveryAddress || "정보 없음"}
                    </p>
                  </div>
                </div>

                <div className={styles.carbonBox}>
                  <div className={styles.carbonText}>
                    <p className={styles.carbonLabel}>
                      이 주문으로 절감한 탄소량
                    </p>
                  </div>
                  <div className={styles.carbonValueWrap}>
                    <strong
                      className={`${styles.carbonValue} ${isCanceled ? styles.strikeThrough : ""}`}
                    >
                      {isCanceled
                        ? "0.0"
                        : Number(order.getPoint ?? 0).toFixed(1)}{" "}
                      g
                    </strong>
                    <span>CO2</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyMsg}>
            해당 기간에 주문 내역이 없습니다.
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {isModalOpen && selectedOrder && (
        <ReviewModal
          order={selectedOrder}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
};

export default UserOrderListPage;

const getOrderStatusText = (status, deliveryType) => {
  const isPickup = deliveryType === 1;
  const statusMap = {
    0: "결제대기",
    1: "접수대기",
    2: "주문접수",
    3: "조리중",
    4: isPickup ? "픽업대기" : "배달중",
    5: isPickup ? "픽업완료" : "배달완료",
    9: "주문취소",
  };
  return statusMap[status] || "확인중";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
