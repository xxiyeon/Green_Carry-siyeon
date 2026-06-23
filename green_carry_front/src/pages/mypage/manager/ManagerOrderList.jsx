import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ManagerOrderList.module.css";
import Swal from "sweetalert2";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Modal,
  Box,
  Typography,
  Divider,
  IconButton,
  CircularProgress,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Pagination from "../../../components/commons/Pagination";
import { withButtonLoading } from "../../../utils/buttonLoading";

const ManagerOrderList = () => {
  const [orderList, setOrderList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 모달 상태 관리
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailMenus, setDetailMenus] = useState([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const storeId = localStorage.getItem("storeId");
  const backHost = import.meta.env.VITE_BACKSERVER;

  const fetchStoreOrders = () => {
    if (!storeId) return;
    setIsLoading(true);

    axios
      .get(`${backHost}/stores/orders/owner/${storeId}`)
      .then((res) => {
        console.log(res.data);
        setOrderList(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("주문 내역 불러오기 실패:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchStoreOrders();
  }, [storeId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // 전화번호 마스킹 (010-****-1234)
  const maskPhoneNumber = (phone) => {
    if (!phone) return "연락처 없음";
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-****-$3");
    }
    return phone;
  };

  // 공통 API 호출 함수
  const requestStatusUpdate = async (
    orderId,
    nextStatus,
    expectedTime = null,
  ) => {
    return axios
      .patch(`${backHost}/stores/order/${orderId}/status`, {
        status: nextStatus,
        expectedTime: expectedTime,
      })
      .then(() => {
        Swal.fire("성공", "주문 상태가 변경되었습니다.", "success");
        fetchStoreOrders();
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("오류", "상태 변경에 실패했습니다.", "error");
      });
  };

  // 모달 열기 및 상세 데이터 로드
  const handleOpenDetailModal = async (order) => {
    setSelectedOrder(order);
    setOpenDetailModal(true);
    setIsLoadingDetail(true);

    try {
      const res = await axios.get(`${backHost}/stores/order/${order.orderId}`);
      setDetailMenus(res.data.items || []);
    } catch (err) {
      console.error("상세 메뉴 불러오기 실패:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setOpenDetailModal(false);
    setSelectedOrder(null);
    setDetailMenus([]);
  };

  // 주문 상태 업데이트 로직
  const updateOrderStatus = withButtonLoading(
    async (_event, orderId, currentStatus, deliveryType) => {
      const nextStatus = currentStatus + 1;
      const isPickup = deliveryType === 1;

      if (currentStatus === 1) {
        Swal.fire({
          title: isPickup ? "예상 픽업 소요 시간" : "예상 배달 소요 시간",
          html: `
          <div style="margin: 20px 0;">
            <b id="range-value" style="font-size: 2.5rem; color: #2f8f46;">15</b>
            <span style="font-size: 1.2rem; font-weight: bold;">분</span>
          </div>
        `,
          input: "range",
          inputAttributes: { min: "5", max: "120", step: "1" },
          inputValue: 15,
          showCancelButton: true,
          confirmButtonText: "주문 수락",
          cancelButtonText: "취소",
          confirmButtonColor: "#2f8f46",
          didOpen: () => {
            const input = Swal.getInput();
            const output =
              Swal.getHtmlContainer().querySelector("#range-value");
            input.addEventListener("input", () => {
              output.innerText = input.value;
            });
          },
        }).then(async (result) => {
          if (result.isConfirmed) {
            await requestStatusUpdate(orderId, nextStatus, result.value);
          }
        });
      } else {
        let confirmMsg = "";
        if (currentStatus === 2) confirmMsg = "조리를 시작하시겠습니까?";
        else if (currentStatus === 3) {
          confirmMsg = isPickup
            ? "픽업 준비가 완료되었습니까?"
            : "배달을 출발시키겠습니까?";
        } else if (currentStatus === 4) {
          confirmMsg = isPickup
            ? "픽업이 완료되었습니까?"
            : "배달이 완료되었습니까?";
        }

        Swal.fire({
          title: "상태 변경",
          text: confirmMsg,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "확인",
          cancelButtonText: "취소",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await requestStatusUpdate(orderId, nextStatus);
          }
        });
      }
    },
  );

  const cancelOrder = withButtonLoading(async (_event, orderId) => {
    Swal.fire({
      title: "주문 취소",
      text: "정말 이 주문을 취소(거절)하시겠습니까?",
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
            Swal.fire("취소 완료", "주문이 취소되었습니다.", "success");
            fetchStoreOrders();
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("오류", "주문 취소에 실패했습니다.", "error");
          });
      }
    });
  });

  const sortedOrders = [...orderList].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
  );

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const maskAddress = (address) => {
    if (!address) return "주소 정보 없음";

    const parts = address.split(" ");

    // 주소가 3단어 이하일 때 (예: "서울 강남구 역삼동") -> 뒤에 *** 추가
    if (parts.length <= 3) {
      return `${address} ***`;
    }

    // 주소가 4단어 이상일 때 (예: "서울 종로구 종로 6 상세주소...")
    // 앞의 3덩어리(시/구/도로명)만 보여주고 나머지는 마스킹
    return `${parts[0]} ${parts[1]} ${parts[2]} ***`;
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "min(480px, calc(100vw - 24px))",
    maxHeight: "85vh",
    overflowY: "auto",
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: 24,
    p: { xs: 2, sm: 4 },
    outline: "none",
  };

  const strikeThroughStyle = {
    color: "text.disabled",
    textDecoration: "line-through",
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerArea}>
        <h2 className={styles.pageTitle}>매장 주문 관리</h2>
        <button
          className={styles.refreshBtn}
          onClick={() => {
            fetchStoreOrders();
            setCurrentPage(1);
          }}
        >
          새로고침 <RefreshIcon />
        </button>
      </div>

      <div className={styles.orderListWrap}>
        {isLoading ? (
          <p className={styles.loadingText}>주문을 불러오는 중입니다...</p>
        ) : currentOrders.length > 0 ? (
          currentOrders.map((order) => {
            const isCanceled = order.orderStatus === 9;
            const isNewOrder = order.orderStatus === 1;
            const isCompleted = order.orderStatus === 5;

            return (
              <div
                key={`store-order-${order.orderId}`}
                className={`${styles.orderCard} ${isNewOrder ? styles.newOrder : ""} ${isCanceled ? styles.canceledCard : ""}`}
              >
                {isCanceled && (
                  <div className={styles.canceledWatermark}>취소된 주문</div>
                )}

                <div className={styles.orderHeader}>
                  <div className={styles.headerLeft}>
                    <span
                      className={`${styles.orderNo} ${isCanceled ? styles.strikeThrough : ""}`}
                    >
                      주문번호 #{order.orderId}
                    </span>
                    {isNewOrder && !isCanceled && (
                      <span className={styles.newBadge}>NEW</span>
                    )}
                  </div>
                  <span className={styles.orderDate}>{order.orderDate}</span>
                </div>

                <div className={styles.orderBody}>
                  <div className={styles.menuInfo}>
                    <h3
                      className={`${styles.menuName} ${isCanceled ? styles.strikeThrough : ""}`}
                    >
                      {order.menuName}{" "}
                      {order.extraCount > 0 && `외 ${order.extraCount}건`}
                    </h3>
                    <button
                      className={styles.detailToggleBtn}
                      onClick={() => handleOpenDetailModal(order)}
                    >
                      상세메뉴 보기
                    </button>
                    <p className={styles.price} style={{ marginTop: "12px" }}>
                      결제금액:{" "}
                      <strong
                        className={isCanceled ? styles.strikeThrough : ""}
                      >
                        {isCanceled
                          ? "0"
                          : (
                              order.totalPrice + (order.deliveryPrice || 0)
                            ).toLocaleString()}
                        원
                      </strong>
                    </p>
                  </div>

                  <div className={styles.deliveryInfo}>
                    <p>
                      <strong>방식:</strong>{" "}
                      {order.deliveryType === 1
                        ? "픽업"
                        : order.deliveryType === 2
                          ? "도보/자전거"
                          : "오토바이"}
                    </p>
                    {/* ✨ SQL에서 추가한 memberPhone 데이터 사용 */}
                    <p>
                      <strong>연락처:</strong>{" "}
                      {maskPhoneNumber(order.memberPhone)}
                    </p>
                    <p className={styles.address}>
                      <strong>주소:</strong>{" "}
                      {maskAddress(order.deliveryAddress)}
                    </p>
                  </div>
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.statusDisplay}>
                    상태:{" "}
                    <span
                      className={`${styles.statusBadge} ${isCanceled ? styles.canceledBadge : styles[`status_${order.orderStatus}`]}`}
                    >
                      {getOrderStatusText(
                        order.orderStatus,
                        order.deliveryType,
                      )}
                    </span>
                    {isCompleted && (
                      <span
                        className={
                          order.reviewStatus === 1
                            ? styles.reviewDone
                            : styles.reviewPending
                        }
                      >
                        {order.reviewStatus === 1
                          ? "● 리뷰 작성됨"
                          : "○ 리뷰 미작성"}
                      </span>
                    )}
                  </div>

                  <div className={styles.actionButtons}>
                    {order.orderStatus >= 1 && order.orderStatus < 5 && (
                      <button
                        className={styles.nextStepBtn}
                        onClick={(e) =>
                          updateOrderStatus(
                            e,
                            order.orderId,
                            order.orderStatus,
                            order.deliveryType,
                          )
                        }
                      >
                        {getActionText(order.orderStatus, order.deliveryType)}
                      </button>
                    )}
                    {order.orderStatus === 1 && (
                      <button
                        className={styles.cancelBtn}
                        onClick={(e) => cancelOrder(e, order.orderId)}
                      >
                        주문 거절
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyMsg}>현재 들어온 주문이 없습니다.</div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal open={openDetailModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight="bold">
              주문 상세 (No.{selectedOrder?.orderId})
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {isLoadingDetail ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {detailMenus.map((item, idx) => (
                <Box
                  key={idx}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  p={1}
                  sx={{
                    backgroundColor:
                      selectedOrder?.orderStatus === 9 ? "#f9f9f9" : "#fff",
                    borderRadius: "8px",
                    border: "1px solid #eee",
                  }}
                >
                  <Avatar
                    src={item.menuImage}
                    variant="rounded"
                    sx={{
                      width: 60,
                      height: 60,
                      filter:
                        selectedOrder?.orderStatus === 9
                          ? "grayscale(100%) opacity(60%)"
                          : "none",
                    }}
                  />
                  <Box flex={1}>
                    <Typography
                      fontWeight="bold"
                      sx={
                        selectedOrder?.orderStatus === 9
                          ? strikeThroughStyle
                          : {}
                      }
                    >
                      {item.menuName}
                    </Typography>
                    {item.optionString && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={
                          selectedOrder?.orderStatus === 9
                            ? strikeThroughStyle
                            : {}
                        }
                      >
                        옵션: {item.optionString}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-end"
                    minWidth="80px"
                  >
                    <Typography fontSize="13px">{item.quantity}개</Typography>
                    <Typography
                      variant="subtitle2"
                      fontSize="16px"
                      fontWeight="bold"
                    >
                      {(item.price || 0).toLocaleString()}원
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box px={1}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    주문 금액
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder?.totalPrice?.toLocaleString()}원
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    배달비
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    + {(selectedOrder?.deliveryPrice || 0).toLocaleString()}원
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    총 결제 금액
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      color:
                        selectedOrder?.orderStatus === 9
                          ? "text.disabled"
                          : "var(--color-brand)",
                      textDecoration:
                        selectedOrder?.orderStatus === 9
                          ? "line-through"
                          : "none",
                    }}
                  >
                    {selectedOrder?.orderStatus === 9
                      ? "0"
                      : (
                          Number(selectedOrder?.totalPrice || 0) +
                          Number(selectedOrder?.deliveryPrice || 0)
                        ).toLocaleString()}
                    원
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default ManagerOrderList;

const getOrderStatusText = (status, deliveryType) => {
  const isPickup = deliveryType === 1;
  const map = {
    0: "결제대기",
    1: "접수대기",
    2: "주문접수",
    3: "조리중",
    4: isPickup ? "픽업대기" : "배달중",
    5: isPickup ? "픽업완료" : "배달완료",
    9: "주문취소",
  };
  return map[status] || "확인중";
};

const getActionText = (status, deliveryType) => {
  const isPickup = deliveryType === 1;
  const map = {
    1: "주문 수락하기",
    2: "조리 시작하기",
    3: isPickup ? "픽업 준비 완료하기" : "배달 출발하기",
    4: isPickup ? "픽업 완료처리" : "배달 완료처리",
  };
  return map[status] || "";
};
