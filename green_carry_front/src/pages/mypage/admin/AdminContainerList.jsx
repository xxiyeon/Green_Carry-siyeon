import React, { useEffect, useState } from "react";
import styles from "./AdminContainerList.module.css";
import SearchIcon from "@mui/icons-material/Search";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/accessToken";
import Pagination from "../../../components/commons/Pagination";
import { withButtonLoading } from "../../../utils/buttonLoading";

export default function AdminContainerList() {
  const navigate = useNavigate();
  const backHost = import.meta.env.VITE_BACKSERVER;

  // Cloudinary 절대 URL과 기존 상대 경로를 함께 처리
  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return "/image/default_container.png";
    if (/^https?:\/\//i.test(imagePath)) {
      return imagePath;
    }
    return `${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [carbonList, setCarbonList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    axios
      .get(`${backHost}/carbon-list`)
      .then((res) => {
        setCarbonList(res.data);
      })
      .catch((err) => console.log("데이터 불러오기 실패:", err));
  }, [backHost]);

  const handleDelete = withButtonLoading(async (_event, productId) => {
    return Swal.fire({
      title: "정말 삭제하시겠습니까?",
      text: "삭제하면 데이터를 복구할 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        api
          .delete(`${backHost}/carbon-list/${productId}`)
          .then((res) => {
            if (res.data === "SUCCESS") {
              Swal.fire("삭제 완료", "용기가 삭제되었습니다.", "success");
              setCarbonList((prev) =>
                prev.filter((carbon) => carbon.productId !== productId),
              );
            }
          })
          .catch((err) => {
            console.error("삭제 실패:", err);
            Swal.fire("오류", "삭제 중 문제가 발생했습니다.", "error");
          });
      }
    });
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedCarbonList = () => {
    const items = carbonList.filter((carbon) => {
      if (!carbon.productMaterial) return false;
      return carbon.productMaterial
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });

    items.sort((a, b) => {
      const getPoint = (name) => {
        if (name.includes("(대)")) return 1;
        if (name.includes("(중)")) return 2;
        if (name.includes("(소)")) return 3;
        return 9;
      };

      if (sortConfig.key === "productMaterial" || sortConfig.key === null) {
        const pointA = getPoint(a.productMaterial);
        const pointB = getPoint(b.productMaterial);

        if (pointA !== pointB) {
          return sortConfig.direction === "asc"
            ? pointA - pointB
            : pointB - pointA;
        }
        return sortConfig.direction === "asc"
          ? a.productMaterial.localeCompare(b.productMaterial)
          : b.productMaterial.localeCompare(a.productMaterial);
      }

      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return items;
  };

  const sortedCarbonList = getSortedCarbonList();
  const totalPages = Math.ceil(sortedCarbonList.length / itemsPerPage) || 1;
  const currentItems = sortedCarbonList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.header}>
        <h2 className={styles.title}>용기 리스트</h2>
        <div className={styles.header_right}>
          <div className={styles.search_wrap}>
            <input
              type="search"
              className={styles.search_input}
              placeholder="용기 이름 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className={styles.search_icon} />
          </div>
          <div
            onClick={() => navigate(`/mypage/admin/containers/detail/new`)}
            className={styles.addPage}
          >
            <span className={styles.AddIconText}>
              <AddIcon />
              추가
            </span>
          </div>
        </div>
      </div>

      <div className={styles.table_wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                className={styles.col_name}
                onClick={() => handleSort("productMaterial")}
              >
                용기 이름 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
              <th
                className={styles.col_desc}
                onClick={() => handleSort("productDesc")}
              >
                용기 설명 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
              <th
                className={styles.col_emissions}
                onClick={() => handleSort("productEmissions")}
              >
                1개당 탄소 배출량(g)
                <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
              <th className={styles.col_action}>수정</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((carbon) => (
              <tr key={carbon.productId} className={styles.table_row}>
                <td className={`${styles.col_left} ${styles.col_name}`}>
                  <div className={styles.store_info}>
                    <div className={styles.store_image_placeholder}>
                      <img
                        src={resolveImageUrl(carbon.productImg)}
                        alt="용기 이미지"
                      />
                    </div>
                    <div className={styles.store_text}>
                      <p className={styles.store_name}>
                        {carbon.productMaterial}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={styles.col_desc}>
                  {carbon.productDesc && carbon.productDesc.trim() !== "" ? (
                    <span className={styles.badge}>{carbon.productDesc}</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className={styles.col_emissions}>
                  {carbon.productEmissions} g
                </td>
                <td className={styles.col_action}>
                  <button
                    className={styles.edit_btn}
                    onClick={() =>
                      navigate(
                        `/mypage/admin/containers/detail/${carbon.productId}`,
                        { state: { carbonData: carbon } },
                      )
                    }
                  >
                    <EditIcon className={styles.edit_icon} />
                  </button>
                  <button
                    className={styles.delete_btn}
                    onClick={(e) => handleDelete(e, carbon.productId)}
                  >
                    <ClearIcon className={styles.delete_icon} />
                  </button>
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
