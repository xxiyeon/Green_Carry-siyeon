import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdminStoreManagement.module.css";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/commons/Pagination";

//  정의되지 않은 searchKeyword 참조를 제거하고 검색, 정렬, 페이지네이션 흐름을 하나로 정리함.
export default function AdminStoreManagement() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const backHost = import.meta.env.VITE_BACKSERVER;
  const itemsPerPage = 6;

  useEffect(() => {
    axios
      .get(`${backHost}/stores`)
      .then((res) => {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

        const dataWithSales = (Array.isArray(res.data) ? res.data : []).map(
          (item) => {
            const salesList = item?.SaleMonth || [];
            const currentData = salesList.find(
              (sale) => sale.saleMonth === currentMonth,
            );
            const prevData = salesList.find(
              (sale) => sale.saleMonth === prevMonth,
            );

            return {
              ...item,
              currentSales: currentData?.totalSales || 0,
              prevSales: prevData?.totalSales || 0,
            };
          },
        );

        setStores(dataWithSales);
      })
      .catch((err) => console.log(err));
  }, [backHost]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const filteredAndSortedStores = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const filteredStores = stores.filter((store) =>
      (store.storeName || "").toLowerCase().includes(normalizedSearchTerm),
    );

    if (!sortConfig.key) {
      return filteredStores;
    }

    return [...filteredStores].sort((a, b) => {
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
  }, [searchTerm, sortConfig, stores]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedStores.length / itemsPerPage),
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedStores = filteredAndSortedStores.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const renderStars = (rating = 0) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<StarIcon key={i} style={{ color: "#ffb300" }} />);
      } else if (rating >= i - 0.5) {
        stars.push(<StarHalfIcon key={i} style={{ color: "#ffb300" }} />);
      } else {
        stars.push(<StarOutlineIcon key={i} style={{ color: "#ccc" }} />);
      }
    }

    return stars;
  };

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.header}>
        <h2 className={styles.title}>상점 리스트</h2>
        <div className={styles.search_wrap}>
          <input
            type="search"
            className={styles.search_input}
            placeholder="매장이름 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className={styles.search_icon} />
        </div>
      </div>

      <div className={styles.table_wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                className={styles.col_left}
                onClick={() => handleSort("storeName")}
              >
                상점이름 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
              <th>전화번호</th>
              <th>카테고리</th>
              <th onClick={() => handleSort("currentSales")}>
                당월 매출 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
              <th onClick={() => handleSort("totalSale")}>
                총 매출 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
              <th onClick={() => handleSort("storeRating")}>
                상점 평점 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedStores.map((store) => (
              <tr
                key={store.storeId}
                className={styles.table_row}
                onClick={() => {
                  navigate(`detail/${store.storeId}`);
                }}
              >
                <td className={styles.col_left}>
                  <div className={styles.store_info}>
                    <div className={styles.store_image_placeholder}>
                      <img
                        src={store.storeThumb || "/image/default_store.png"}
                        alt={store.storeName || "매장 이미지"}
                      />
                    </div>
                    <div className={styles.store_text}>
                      <p className={styles.store_name}>{store.storeName}</p>
                      <span className={styles.store_sub}>
                        {store.storeAddress}
                      </span>
                    </div>
                  </div>
                </td>
                <td>{store.storePhone}</td>
                <td>
                  <span className={styles.badge}>{store.storeCategory}</span>
                </td>
                <td>{(store.currentSales || 0).toLocaleString()}원</td>
                <td>{(store.totalSale || 0).toLocaleString()}원</td>
                <td>
                  <div className={styles.rating_wrap}>
                    <div className={styles.stars}>
                      {renderStars(store.storeRating)}
                    </div>
                    <span className={styles.rating_score}>
                      {(store.storeRating || 0).toFixed(1)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
