import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import styles from "./ManagerMenuList.module.css";

// MUI Icons
import SearchIcon from "@mui/icons-material/Search";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/commons/Pagination";

const ManagerMenuList = () => {
  const navigate = useNavigate();
  const backHost = import.meta.env.VITE_BACKSERVER;

  const [menus, setMenus] = useState([]); // 전체 메뉴 원본 데이터
  const [searchKeyword, setSearchKeyword] = useState("");
  const [storeId, setStoreId] = useState("");

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. 가게 정보 가져오기
  useEffect(() => {
    const memberId = localStorage.getItem("memberId");
    if (!memberId) return;

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/member/${memberId}`)
      .then((res) => {
        if (res.data && res.data.storeId) {
          setStoreId(res.data.storeId);
        }
      })
      .catch((err) => console.error("가게 정보 조회 실패:", err));
  }, []);

  // 2. 메뉴 정보 전체 가져오기
  useEffect(() => {
    if (!storeId) return;

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/${storeId}/menus`)
      .then((res) => {
        console.log("🚀 ~ ManagerMenuList ~ res:", res);
        setMenus(res.data); // 전체 데이터를 한 번에 저장
      })
      .catch((err) => console.error("메뉴 로딩 실패:", err));
  }, [storeId]);

  // 📌 3. 데이터 가공 파이프라인 (검색어 필터링)
  const filteredMenus = useMemo(() => {
    let result = menus;
    if (searchKeyword) {
      result = result.filter((menu) =>
        menu.menuName.toLowerCase().includes(searchKeyword.toLowerCase()),
      );
    }
    return result;
  }, [menus, searchKeyword]);

  // 📌 4. 페이지네이션 계산 로직
  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // 현재 페이지에 보여줄 6개만 추출
  const currentMenus = filteredMenus.slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 이동 핸들러
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // 검색어 입력 시 페이지 리셋
  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      {/* 상단 헤더 및 검색바 */}
      <div className={styles.header}>
        <h2 className={styles.title}>상점 메뉴 리스트</h2>
        <div className={styles.header_right}>
          <div className={styles.search_wrap}>
            <input
              type="search"
              className={styles.search_input}
              placeholder="메뉴 이름 검색"
              value={searchKeyword}
              onChange={handleSearchChange}
            />
            <SearchIcon className={styles.search_icon} />
          </div>
          <button
            className={styles.addButton}
            onClick={() => {
              navigate(`/mypage/manager/menus/menuEdit/${storeId}`);
            }}
          >
            메뉴 추가
          </button>
        </div>
      </div>

      {/* 메뉴 리스트 (Grid) */}
      <div className={styles.grid_container}>
        {currentMenus.length > 0 ? (
          currentMenus.map((menu) => (
            <div
              key={menu.menuId}
              className={styles.menu_card}
              onClick={() => {
                navigate(
                  `/mypage/manager/menus/menuEdit/${storeId}/${menu.menuId}`,
                  { state: { menuData: menu } },
                );
              }}
            >
              <div className={styles.image_placeholder}>
                {/*  1. 이미지가 있으면 img 태그를, 없으면 기본 아이콘을 출력합니다. */}
                {menu.menuImage ? (
                  <img
                    src={menu.menuImage}
                    alt={menu.menuName}
                    className={styles.menu_img} // CSS에서 크기 조절 필요
                    onError={(e) => {
                      // 이미지 로드 실패 시 대체 이미지나 아이콘 처리
                      e.target.src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                ) : (
                  <ImageOutlinedIcon sx={{ fontSize: 60, color: "#bdbdbd" }} />
                )}
              </div>
              <div className={styles.menu_info}>
                <p className={styles.menu_name}>{menu.menuName}</p>
                <p className={styles.menu_price}>
                  {menu.menuPrice?.toLocaleString()}원
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.no_result}>검색 결과가 없습니다.</div>
        )}
      </div>

      {/* 페이지네이션 영역 (관리자 페이지와 동일한 스타일 적용) */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ManagerMenuList;
