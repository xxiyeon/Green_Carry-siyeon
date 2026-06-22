import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdminStoreManagementDetail.module.css";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import axios from "axios";
import { useParams } from "react-router-dom";
import Pagination from "../../../components/commons/Pagination";

//  관리자 주문 상세 화면에서 배송비와 최종 결제 금액을 함께 표시하도록 정리함.
const AdminStoreManagementDetail = () => {
  const { storeId } = useParams();
  const backHost = import.meta.env.VITE_BACKSERVER;

  const [searchKeyword, setSearchKeyword] = useState("");
  const [orderList, setOrderList] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailMenus, setDetailMenus] = useState([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const statusMap = {
    0: "결제대기",
    1: "접수대기",
    2: "주문접수",
    3: "조리중",
    4: "배달중",
    5: "배달완료",
    9: "주문취소",
  };

  useEffect(() => {
    axios
      .get(`${backHost}/admin/${storeId}`)
      .then((res) => {
        setOrderList(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [backHost, storeId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const filteredAndSortedOrders = useMemo(() => {
    const normalizedSearchKeyword = searchKeyword.trim().toLowerCase();
    const filteredOrders = orderList.filter((item) =>
      (item.storeName || "").toLowerCase().includes(normalizedSearchKeyword),
    );

    if (!sortConfig.key) {
      return filteredOrders;
    }

    return [...filteredOrders].sort((a, b) => {
      const aValue = a?.[sortConfig.key] ?? "";
      const bValue = b?.[sortConfig.key] ?? "";

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      return sortConfig.direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [orderList, searchKeyword, sortConfig]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedOrders.length / itemsPerPage),
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredAndSortedOrders.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "결제대기":
        return { color: "#6b7280", backgroundColor: "#f3f4f6" };
      case "접수대기":
        return { color: "#6366f1", backgroundColor: "#eef2ff" };
      case "주문접수":
        return { color: "#3b82f6", backgroundColor: "#eff6ff" };
      case "조리중":
        return { color: "#06b6d4", backgroundColor: "#ecfeff" };
      case "배달중":
        return { color: "#f59e0b", backgroundColor: "#fff7e8" };
      case "배달완료":
        return { color: "#22c55e", backgroundColor: "#ecfdf3" };
      case "주문취소":
        return { color: "#ef4444", backgroundColor: "#fef2f2" };
      default:
        return {};
    }
  };

  const handleRowClick = async (order) => {
    setSelectedOrder(order);
    setOpenDetailModal(true);
    setIsLoadingDetail(true);

    try {
      const res = await axios.get(
        `${backHost}/admin/order-detail/${order.orderId}`,
      );
      setDetailMenus(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("주문 상세 메뉴를 불러오지 못했습니다.", err);
      setDetailMenus([]);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setOpenDetailModal(false);
    setSelectedOrder(null);
    setDetailMenus([]);
  };

  const detailMenuSubtotal = detailMenus.reduce((sum, menu) => {
    return sum + (menu.price || 0) * (menu.quantity || 0);
  }, 0);
  const detailDeliveryFee =
    detailMenus[0]?.deliveryFee ??
    Math.max((selectedOrder?.totalPrice || 0) - detailMenuSubtotal, 0);
  const detailTotalPrice =
    selectedOrder?.totalPrice ?? detailMenuSubtotal + detailDeliveryFee;

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 450,
    maxHeight: "80vh",
    overflowY: "auto",
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
    outline: "none",
  };

  return (
    <div className={styles.content}>
      <Paper className={styles.card} elevation={0}>
        <Box className={styles.header}>
          <h2 className={styles.title}>주문 내역</h2>
        </Box>

        <TableContainer>
          <Table>
            <TableHead className={styles.table_head}>
              <TableRow className={styles.headRow}>
                <TableCell>
                  <div
                    className={styles.headerCell}
                    onClick={() => handleSort("orderId")}
                  >
                    주문 번호 <UnfoldMoreIcon className={styles.sort_icon} />
                  </div>
                </TableCell>
                <TableCell>주문자</TableCell>
                <TableCell>상품</TableCell>
                <TableCell>
                  <div
                    className={styles.headerCell}
                    onClick={() => handleSort("totalPrice")}
                  >
                    금액 <UnfoldMoreIcon className={styles.sort_icon} />
                  </div>
                </TableCell>
                <TableCell>매장</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {currentOrders.map((item) => (
                <TableRow
                  key={item.orderId}
                  hover
                  onClick={() => handleRowClick(item)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell className={styles.orderId}>
                    {item.orderId}
                  </TableCell>

                  <TableCell>
                    <Box className={styles.infoBox}>
                      <Avatar src={item.memberThumb} />
                      <Box>
                        <p className={styles.mainText}>
                          {item.memberId || item.memberEmail}
                        </p>
                        <span className={styles.subText}>
                          {item.memberEmail}
                        </span>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box className={styles.infoBox}>
                      <img
                        src={
                          item.menuList?.[0]?.menuImage ||
                          "/image/default_menu.png"
                        }
                        className={styles.productImage}
                        alt={item.menuList?.[0]?.menuName || "주문 상품"}
                      />
                      <Box>
                        <p className={styles.mainText}>
                          {item.menuList?.length > 0
                            ? `${item.menuList[0].menuName}${
                                item.menuList.length > 1
                                  ? ` 외 ${item.menuList.length - 1}개`
                                  : ""
                              }`
                            : "상품 정보 없음"}
                        </p>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    {(item.totalPrice || 0).toLocaleString()}원
                  </TableCell>

                  <TableCell>{item.storeName}</TableCell>

                  <TableCell>
                    <Chip
                      label={statusMap[item.orderStatus] || "알 수 없음"}
                      size="small"
                      sx={{
                        ...getStatusStyle(statusMap[item.orderStatus]),
                        fontWeight: 700,
                        borderRadius: "999px",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Paper>

      <Modal open={openDetailModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight="bold">
              주문 상세 내역 (No.{selectedOrder?.orderId})
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
              {detailMenus.map((menu, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={menu.menuImage || "/image/default_menu.png"}
                    variant="rounded"
                    sx={{ width: 60, height: 60 }}
                  />
                  <Box flex={1}>
                    <Typography fontWeight="bold">{menu.menuName}</Typography>
                    {menu.options && (
                      <Typography variant="body2" color="text.secondary">
                        {menu.options}
                      </Typography>
                    )}
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2">{menu.quantity}개</Typography>
                    <Typography fontWeight="bold">
                      {(
                        (menu.price || 0) * (menu.quantity || 0)
                      ).toLocaleString()}
                      원
                    </Typography>
                  </Box>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" flexDirection="column" gap={1}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    메뉴 금액
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detailMenuSubtotal.toLocaleString()}원
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    배달비
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detailDeliveryFee.toLocaleString()}원
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    최종 결제 금액
                  </Typography>
                  <Typography
                    variant="h6"
                    color="var(--color-brand)"
                    fontWeight="bold"
                  >
                    {detailTotalPrice.toLocaleString()}원
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

export default AdminStoreManagementDetail;
