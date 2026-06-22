import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Home.module.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

// 이스터에그 컴포넌트
import EcoLightSwitch from "../../components/Easter Egg/EcoLightSwitch";
import EcoRider from "../../components/Easter Egg/EcoRider";
import EcoClean from "../../components/Easter Egg/EcoClean";
import EcoDrone from "../../components/Easter Egg/EcoDrone";
import EcoRecycle from "../../components/Easter Egg/EcoRecycle";
import EcoEarth from "../../components/Easter Egg/EcoEarth";
import EcoFlood from "../../components/Easter Egg/EcoFlood";
import { AuthContext } from "../../context/AuthContext";
import EcoNight from "../../components/Easter Egg/EcoNight";

const API_BASE_URL = import.meta.env.VITE_BACKSERVER?.trim() || "";
const isBrowser = typeof window !== "undefined";

const banners = [
  {
    title: "같이 효율적으로 소비하는 플랫폼",
    img: "/image/banner/banner1.png",
  },
  {
    title: "오늘도 그린하게, 지구를 구하는 한 끼",
    img: "/image/banner/banner2.png",
  },
  {
    title: "우리의 오늘이 지구의 내일이 됩니다",
    img: "/image/banner/banner3.png",
  },
  {
    title: "달콤한 하루를 위해 오늘도 그린하게",
    img: "/image/banner/banner4.png"
  },
  {
    title: "건강하게, 싱그럽게",
    img: "/image/banner/banner5.png"
  },
  { img: "/image/banner/banner6.png" },
  { img: "/image/banner/banner7.png" },
];

const categories = [
  { name: "인기맛집", img: "/image/category/bestFood.png" },
  { name: "한식", img: "/image/category/Kfood.png" },
  { name: "양식", img: "/image/category/wsFood.png" },
  { name: "중식", img: "/image/category/chFood.png" },
  { name: "일식", img: "/image/category/susi.png" },
  { name: "피자", img: "/image/category/pizza.png" },
  { name: "치킨", img: "/image/category/chicken.png" },
  { name: "샐러드", img: "/image/category/salad.png" },
  { name: "커피/디저트", img: "/image/category/dessert.png" },
];

const getCoordinateValue = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function Home() {
  const navigate = useNavigate();
  const { user, isLogin } = useContext(AuthContext);

  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("인기맛집");
  const [searchTerm, setSearchTerm] = useState("");
  const [storeList, setStoreList] = useState([]);

  // 숫자 거리 계산 함수 (철저한 방어 로직 추가)
  const getNumericDistance = (storeLat, storeLng) => {
    const fallbackLat = isBrowser ? localStorage.getItem("LATITUDE") : null;
    const fallbackLng = isBrowser ? localStorage.getItem("LONGITUDE") : null;
    const myLat = getCoordinateValue(user?.LATITUDE ?? fallbackLat);
    const myLng = getCoordinateValue(user?.LONGITUDE ?? fallbackLng);

    // 매장 좌표도 숫자인지 확인
    const sLat = getCoordinateValue(storeLat);
    const sLng = getCoordinateValue(storeLng);

    // 하나라도 숫자가 아니면 계산 불가(null) 반환
    if (myLat === null || myLng === null || sLat === null || sLng === null) {
      return null;
    }

    const R = 6371; // 지구 반지름 (km)
    const dLat = ((sLat - myLat) * Math.PI) / 180;
    const dLng = ((sLng - myLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((myLat * Math.PI) / 180) *
      Math.cos((sLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatTime = (distance) => {
    if (distance === null) return "계산 불가";
    const estimatedTime = 15 + distance * 6;
    const roundedTime = Math.round(estimatedTime / 5) * 5;
    return `${roundedTime}분`;
  };

  const formatDistance = (distance) => {
    if (distance === null) return "거리 정보 없음";
    return distance < 1
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
  };

  // 서버 데이터 로드
  useEffect(() => {
    if (!API_BASE_URL) {
      setLoadError("서버 주소가 설정되지 않아 매장 목록을 불러올 수 없습니다.");
      setStoreList([]);
      setLoading(false);
      console.error("VITE_BACKSERVER is not configured for the home page.");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setLoadError("");

    axios
      .get(`${API_BASE_URL}/stores`)
      .then((res) => {
        if (!isMounted) {
          return;
        }

        setStoreList(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        console.error("데이터 로딩 에러:", err);
        setStoreList([]);
        setLoadError(
          "매장 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 검색, 카테고리, 그리고 거리(5km) 필터링
  const filteredStores = storeList.filter((store) => {
    const storeName = String(store?.storeName ?? "");
    const isCategoryMatch =
      selectedCategory === "인기맛집" ||
      store.storeCategory === selectedCategory;

    const isSearchMatch = storeName
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());

    // 머지 시 바뀔 수 있는 대/소문자 필드명 대응
    const sLat = store.LATITUDE || store.latitude;
    const sLng = store.LONGITUDE || store.longitude;
    const distance = getNumericDistance(sLat, sLng);

    // 좌표 정보가 있을 때 5km 초과 매장은 제외 (위치 정보 없으면 일단 보여줌)
    if (distance !== null && distance > 5) {
      return false;
    }

    return isCategoryMatch && isSearchMatch;
  });

  const renderStars = (rating) => {
    const stars = [];
    const score = rating || 0;
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(score)) {
        stars.push(
          <StarIcon key={i} sx={{ color: "#ffb300", fontSize: "1.2rem" }} />,
        );
      } else if (i === Math.ceil(score) && score % 1 !== 0) {
        stars.push(
          <StarHalfIcon
            key={i}
            sx={{ color: "#ffb300", fontSize: "1.2rem" }}
          />,
        );
      } else {
        stars.push(
          <StarOutlineIcon
            key={i}
            sx={{ color: "#ccc", fontSize: "1.2rem" }}
          />,
        );
      }
    }
    return stars;
  };

  return (
    <div className={styles.page_container}>
      <EcoLightSwitch />
      <EcoClean />
      <EcoRider />
      <EcoDrone />
      <EcoRecycle />
      <EcoEarth />
      <EcoFlood />
      <EcoNight />

      <div className={styles.banner_wrap}>
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{ delay: 10000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination, Navigation]}
          className={styles.mySwiper}
        >
          {banners.map((item, idx) => (
            <SwiperSlide key={idx}>
              <div
                className={styles.banner_slide}
                style={{ backgroundImage: `url(${item.img})` }}
              >
                <div className={styles.banner_text_box}>
                  <h3 className={styles.banner_title}>{item.title}</h3>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className={styles.content_wrap}>
        <div className={styles.category_wrap}>
          {categories.map((item) => (
            <div
              key={item.name}
              className={`${styles.category_item} ${selectedCategory === item.name ? styles.active : ""}`}
              onClick={() => setSelectedCategory(item.name)}
            >
              <div className={styles.category_img_circle}>
                <img
                  src={item.img}
                  alt={item.name}
                  className={styles.category_icon}
                />
              </div>
              <p>{item.name}</p>
            </div>
          ))}
        </div>

        <div className={styles.search_container}>
          <div className={styles.search_wrap}>
            <input
              type="search"
              placeholder="매장 이름을 입력하세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className={styles.search_icon} />
          </div>
        </div>

        <div className={styles.card_wrap}>
          {isLoading ? (
            [1, 2, 3].map((n) => (
              <div
                key={n}
                className={`${styles.card_item} ${styles.skeleton_card}`}
              >
                <div
                  className={`${styles.image_wrap} ${styles.skeleton_img}`}
                ></div>
                <div className={styles.card_info}>
                  <div className={styles.skeleton_title}></div>
                  <div className={styles.skeleton_tags}></div>
                  <div className={styles.skeleton_rating}></div>
                </div>
              </div>
            ))
          ) : filteredStores.length > 0 ? (
            filteredStores.map((store) => {
              // 렌더링 시에도 대/소문자 필드명 모두 대응
              const sLat = store.LATITUDE || store.latitude;
              const sLng = store.LONGITUDE || store.longitude;
              const numericDist = getNumericDistance(sLat, sLng);
              const storeName = String(store?.storeName ?? "매장 이름 없음");
              const storeCategory = String(
                store?.storeCategory ?? "카테고리 없음",
              );
              const storeRating = Number(store?.storeRating ?? 0);
              const reviewCount = Number(store?.reviewCount ?? 0);
              const storeThumb =
                typeof store?.storeThumb === "string" && store.storeThumb.trim()
                  ? store.storeThumb
                  : "/image/default_store.png";

              return (
                <div
                  key={store.storeId}
                  className={styles.card_item}
                  onClick={() => navigate(`/storeView/${store.storeId}`)}
                >
                  <div className={styles.image_wrap}>
                    <img
                      src={storeThumb}
                      alt={storeName}
                      style={{ objectFit: "cover" }}
                    />
                    {isLogin && user?.memberGrade === 1 && (
                      <div className={styles.card_badge}>
                        {formatTime(numericDist)}
                      </div>
                    )}
                  </div>
                  <div className={styles.card_info}>
                    <h3 className={styles.store_name}>{storeName}</h3>
                    <div className={styles.store_tags}>
                      <span>{storeCategory}</span>
                      <span className={styles.dist_text}>
                        {formatDistance(numericDist)}
                      </span>
                    </div>
                    <div className={styles.store_rating_wrap}>
                      <div className={styles.stars_box}>
                        {renderStars(storeRating)}
                      </div>
                      <span className={styles.rating_number}>
                        {storeRating.toFixed(1)}
                      </span>
                      <span className={styles.review_count}>
                        ({reviewCount.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : loadError ? (
            <div className={styles.empty_msg_box}>
              <p className={styles.empty_msg}>{loadError}</p>
            </div>
          ) : (
            <div className={styles.empty_msg_box}>
              <p className={styles.empty_msg}>
                반경 5km 이내에 매장이 없습니다. 🌱
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
