import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import Swal from "sweetalert2";
import styles from "./StoreView.module.css";
import MenuModal from "../../components/layout/MenuModal";
import CartBar from "../../components/layout/ui/CartBar";
import useCartStore from "../../store/useCartStore";
import { AuthContext } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_BACKSERVER?.trim() || "";

export default function StoreView() {
  //  매장/메뉴 로딩과 검색 필터를 배포 환경에서 안전하게 처리합니다.
  const { id } = useParams();
  const navigate = useNavigate();
  const storeId = Number(id);

  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [storeInfo, setStoreInfo] = useState({
    storeId: "",
    storeIntro: "",
    storeName: "",
    storeThumb: "",
    storeRating: 0,
  });
  const [menuList, setMenuList] = useState([]);
  const [categories, setCategories] = useState(["전체"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");

  const { isLogin } = useContext(AuthContext);
  const setGlobalStoreName = useCartStore((state) => state.setStoreName);

  useEffect(() => {
    if (!Number.isInteger(storeId) || storeId <= 0) {
      navigate("/");
      return;
    }

    if (!API_BASE_URL) {
      setLoadError("서버 주소가 설정되지 않아 매장 정보를 불러올 수 없습니다.");
      setIsLoading(false);
      console.error("VITE_BACKSERVER is not configured for StoreView.");
      return;
    }

    let isMounted = true;
    window.scrollTo(0, 0);
    setIsLoading(true);
    setLoadError("");

    Promise.allSettled([
      axios.get(`${API_BASE_URL}/stores/${storeId}/menus`),
      axios.get(`${API_BASE_URL}/stores/${storeId}`),
      axios.get(`${API_BASE_URL}/stores/reviews/${storeId}`),
    ]).then(([menuResult, storeResult, reviewResult]) => {
      if (!isMounted) {
        return;
      }

      if (menuResult.status === "fulfilled") {
        const rawMenus = Array.isArray(menuResult.value.data)
          ? menuResult.value.data
          : [];
        const activeMenus = rawMenus.filter((item) => item?.menuStatus === 1);
        setMenuList(activeMenus);
        setCategories([
          "전체",
          ...new Set(
            activeMenus
              .map((item) => item?.menuCategory)
              .filter((category) => Boolean(category)),
          ),
        ]);
      } else {
        console.error("메뉴 로딩 실패:", menuResult.reason);
        setMenuList([]);
        setCategories(["전체"]);
      }

      if (storeResult.status === "fulfilled") {
        const nextStoreInfo = {
          storeId: storeResult.value.data?.storeId ?? "",
          storeIntro: storeResult.value.data?.storeIntro ?? "",
          storeName: storeResult.value.data?.storeName ?? "",
          storeThumb: storeResult.value.data?.storeThumb ?? "",
          storeRating: Number(storeResult.value.data?.storeRating ?? 0),
        };

        setStoreInfo(nextStoreInfo);
        setGlobalStoreName(nextStoreInfo.storeName);
      } else {
        console.error("가게 로딩 실패:", storeResult.reason);
        setLoadError("매장 정보를 불러오지 못했습니다.");
      }

      if (reviewResult.status === "fulfilled") {
        const reviewList = Array.isArray(reviewResult.value.data)
          ? reviewResult.value.data
          : [];
        setReviewCount(reviewList.length);
      } else {
        console.error("리뷰 로딩 실패:", reviewResult.reason);
        setReviewCount(0);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [navigate, setGlobalStoreName, storeId]);

  const filteredMenu = menuList.filter((item) => {
    const isCategoryMatch =
      selectedCategory === "전체" || item.menuCategory === selectedCategory;
    const isSearchMatch = String(item?.menuName ?? "")
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());

    return isCategoryMatch && isSearchMatch;
  });

  const handleMenuClick = (menu) => {
    if (isLogin) {
      setSelectedMenu(menu);
      setIsModalOpen(true);
      return;
    }

    Swal.fire({
      title: "로그인 후 이용 가능합니다",
      icon: "warning",
    });
    navigate("/login");
  };

  return (
    <div className={styles.page_container}>
      <div className={styles.store_info_section}>
        <div className={styles.store_image_wrap}>
          {storeInfo.storeThumb ? (
            <img
              src={storeInfo.storeThumb}
              alt={storeInfo.storeName || "매장 이미지"}
              className={styles.store_main_img}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className={styles.image_placeholder}>
              <span style={{ color: "#999" }}> 사진 준비 중 </span>
            </div>
          )}
        </div>

        <div className={styles.store_text_wrap}>
          <div className={styles.title_row}>
            <h2 className={styles.store_name}>
              {storeInfo.storeName ||
                (isLoading ? "로딩 중..." : "매장 정보 없음")}
            </h2>

            <div className={styles.store_rating_box}>
              <StarIcon className={styles.star_icon} />
              <span className={styles.rating_num}>
                {Number(storeInfo.storeRating ?? 0).toFixed(1)}
              </span>
              <span className={styles.review_count_text}>
                ({reviewCount.toLocaleString()})
              </span>
              <Link
                to={`/storeReviews/${storeId}`}
                className={styles.review_count_link}
              >
                리뷰 보기 {">"}
              </Link>
            </div>
          </div>

          <Link
            to={`/storeDetail/${storeId}`}
            state={{ storeId }}
            className={styles.store_link}
          >
            가게 정보, 원산지 정보 {">"}
          </Link>
          <p className={styles.store_desc}>
            {storeInfo.storeIntro || loadError || "매장 소개가 없습니다."}
          </p>
        </div>
      </div>

      <div className={styles.menu_section}>
        <div className={styles.menu_controls}>
          <div className={styles.search_wrap}>
            <input
              type="search"
              placeholder="메뉴 이름 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className={styles.search_icon} />
          </div>

          <div className={styles.filter_wrap}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.filter_btn} ${
                  selectedCategory === category ? styles.active : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.menu_grid}>
          {filteredMenu.map((menu) => (
            <div
              key={menu.menuId}
              className={styles.menu_card}
              onClick={() => handleMenuClick(menu)}
            >
              <div className={styles.menu_image}>
                {menu.menuImage ? (
                  <img
                    src={menu.menuImage}
                    alt={menu.menuName || "메뉴 이미지"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/image/no-image.png";
                    }}
                  />
                ) : (
                  <div className={styles.no_image_box}></div>
                )}
              </div>
              <div className={styles.menu_info}>
                <span className={styles.menu_title}>
                  {menu.menuName || "메뉴 이름 없음"}
                </span>
                <p className={styles.menu_price}>
                  {Number(menu.menuPrice ?? 0).toLocaleString()}원
                </p>
                {menu.menuInfo && (
                  <p className={styles.menu_desc}>{menu.menuInfo}</p>
                )}
              </div>
            </div>
          ))}

          {!isLoading && filteredMenu.length === 0 && (
            <div className={styles.empty_menu}>
              현재 주문 가능한 메뉴가 없습니다.
            </div>
          )}
        </div>
      </div>

      <MenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuData={selectedMenu}
        currentStoreId={storeId}
        currentStoreName={storeInfo.storeName}
      />
      <CartBar />
    </div>
  );
}
