/* global naver */
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import styles from "./StoreInfoEdit.module.css";
import { useDaumPostcodePopup } from "react-daum-postcode";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import "react-datepicker/dist/react-datepicker.css";
import { AuthContext } from "../../../../context/AuthContext";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Swal from "sweetalert2";
import { withSubmitButtonLoading } from "../../../../utils/buttonLoading";

export default function StoreInfoEdit() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImg, setPreviewImg] = useState("");
  const backHost = import.meta.env.VITE_BACKSERVER;
  const { user } = useContext(AuthContext) || {};
  const storeId = user?.storeId || null;

  const [formData, setFormData] = useState({
    storeName: "",
    storeIntro: "",
    storePhone: "",
    storeAddress: "",
    latitude: null,
    longitude: null,
    businessNumber: "",
    openDate: null,
    storeOriginInfo: "",
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [activeCategory, setActiveCategory] = useState("한식");
  const [hoursType, setHoursType] = useState("same");
  const [is24h, setIs24h] = useState(false);

  const [sameTime, setSameTime] = useState({
    startH: "09",
    startM: "00",
    endH: "22",
    endM: "00",
  });

  const [diffTimes, setDiffTimes] = useState([
    {
      day: "mon",
      label: "월",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
    {
      day: "tue",
      label: "화",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
    {
      day: "wed",
      label: "수",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
    {
      day: "thu",
      label: "목",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
    {
      day: "fri",
      label: "금",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
    {
      day: "sat",
      label: "토",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
    {
      day: "sun",
      label: "일",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
  ]);

  const [restDays, setRestDays] = useState([]);

  const showAlert = (text, icon = "warning") =>
    Swal.fire({
      text,
      icon,
      confirmButtonText: "확인",
    });

  const categories = [
    { value: "한식", label: "한식" },
    { value: "분식", label: "분식" },
    { value: "중식", label: "중식" },
    { value: "일식", label: "일식" },
    { value: "양식", label: "양식" },
    { value: "치킨", label: "치킨" },
    { value: "패스트푸드", label: "패스트푸드" },
    { value: "커피/디저트", label: "커피/디저트" },
  ];

  const restWeekMonthOpts = [
    { value: "week1", label: "매월 첫번째" },
    { value: "week2", label: "매월 두번째" },
    { value: "week3", label: "매월 세번째" },
    { value: "week4", label: "매월 네번째" },
  ];

  const reverseWeekMonthMapping = {
    0: "week",
    1: "week1",
    2: "week2",
    3: "week3",
    4: "week4",
  };

  const restDayOpts = [
    { value: "mon", label: "월요일" },
    { value: "tue", label: "화요일" },
    { value: "wed", label: "수요일" },
    { value: "thu", label: "목요일" },
    { value: "fri", label: "금요일" },
    { value: "sat", label: "토요일" },
    { value: "sun", label: "일요일" },
  ];

  const openPostcode = useDaumPostcodePopup(
    "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js",
  );
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert("파일 크기는 5MB 이하만 가능합니다.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCompletePostcode = (data) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") extraAddress += data.bname;
      if (data.buildingName !== "")
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    const combinedAddress = `(${data.zonecode}) ${fullAddress} `;

    naver.maps.Service.geocode({ query: fullAddress }, (status, response) => {
      if (
        status === naver.maps.Service.Status.OK &&
        response.v2.addresses.length > 0
      ) {
        const result = response.v2.addresses[0];
        setFormData((prev) => ({
          ...prev,
          storeAddress: combinedAddress,
          latitude: parseFloat(result.y),
          longitude: parseFloat(result.x),
        }));
      } else {
        setFormData((prev) => ({ ...prev, storeAddress: combinedAddress }));
        showAlert("주소에 해당하는 위치(위/경도)를 찾을 수 없습니다.");
      }
    });
  };

  const handleSearchAddress = () => {
    openPostcode({ onComplete: handleCompletePostcode });
  };

  const renderTimeOptions = (max, step = 1) => {
    const options = [];
    for (let i = 0; i <= max; i += step) {
      const value = i < 10 ? `0${i}` : `${i}`;
      options.push(
        <option key={value} value={value}>
          {value}
        </option>,
      );
    }
    return options;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "storePhone") {
      const nums = value.replace(/\D/g, "");
      if (nums.startsWith("02")) {
        if (nums.length <= 2) formattedValue = nums;
        else if (nums.length <= 5)
          formattedValue = `${nums.slice(0, 2)}-${nums.slice(2)}`;
        else if (nums.length <= 9)
          formattedValue = `${nums.slice(0, 2)}-${nums.slice(
            2,
            5,
          )}-${nums.slice(5)}`;
        else
          formattedValue = `${nums.slice(0, 2)}-${nums.slice(
            2,
            6,
          )}-${nums.slice(6, 10)}`;
      } else {
        if (nums.length <= 3) formattedValue = nums;
        else if (nums.length <= 6)
          formattedValue = `${nums.slice(0, 3)}-${nums.slice(3)}`;
        else if (nums.length <= 10)
          formattedValue = `${nums.slice(0, 3)}-${nums.slice(
            3,
            6,
          )}-${nums.slice(6)}`;
        else
          formattedValue = `${nums.slice(0, 3)}-${nums.slice(
            3,
            7,
          )}-${nums.slice(7, 11)}`;
      }
    } else if (name === "businessNumber") {
      const nums = value.replace(/\D/g, "").slice(0, 10);
      if (nums.length <= 3) formattedValue = nums;
      else if (nums.length <= 5)
        formattedValue = `${nums.slice(0, 3)}-${nums.slice(3)}`;
      else
        formattedValue = `${nums.slice(0, 3)}-${nums.slice(3, 5)}-${nums.slice(
          5,
        )}`;
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    setFormData((prev) => ({
      ...prev,
      openDate: dateString,
    }));
    setShowCalendar(false);
  };

  const handleDiffTimeChange = (index, field, value) => {
    const newDiff = [...diffTimes];
    newDiff[index][field] = value;
    setDiffTimes(newDiff);
  };

  const handleAddRestDay = () => {
    setRestDays([
      ...restDays,
      { id: Date.now(), weekMonth: "week1", day: "mon" },
    ]);
  };

  const handleRemoveRestDay = (id) => {
    setRestDays(restDays.filter((rd) => rd.id !== id));
  };

  const handleRestDayChange = (id, field, value) => {
    setRestDays(
      restDays.map((rd) => (rd.id === id ? { ...rd, [field]: value } : rd)),
    );
  };

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await axios.get(`${backHost}/stores/info/${storeId}`);
        if (response.status === 200 && response.data) {
          const data = response.data;
          if (data.storeThumb) {
            setPreviewImg(data.storeThumb);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchStoreData();
  }, [storeId]);

  useEffect(() => {
    if (!storeId) return;

    const fetchStoreData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/stores/info/${storeId}`,
        );

        if (response.status === 200 && response.data) {
          const data = response.data;
          console.log("?? ~ fetchStoreData ~ data:", data);

          const addrMatch = (data.storeAddress || "").match(
            /^\((.*?)\)\s+(.*)$/,
          );
          const parsedZip = addrMatch ? addrMatch[1] : "";
          const parsedAddr = addrMatch ? addrMatch[2] : data.storeAddress || "";

          setFormData({
            storeName: data.storeName || "",
            storeIntro: data.storeIntro || "",
            storePhone: data.storePhone || "",
            storeAddress: data.storeAddress || "",
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            businessNumber: data.storeOwnerNo || "",
            openDate: data.openingDate || null,
            storeOriginInfo: data.storeOriginInfo || "",
            storeAddrCode: parsedZip,
            storeAddr: parsedAddr,
            storeAddrDetail: "",
          });

          if (data.storeCategory) setActiveCategory(data.storeCategory);

          if (data.operatingHours && data.operatingHours.length > 0) {
            const fetchedRestDays = [];
            let fetchedDiffTimes = [
              {
                day: "mon",
                label: "월",
                isOpen: true,
                startH: "09",
                startM: "00",
                endH: "22",
                endM: "00",
              },
              {
                day: "tue",
                label: "화",
                isOpen: true,
                startH: "09",
                startM: "00",
                endH: "22",
                endM: "00",
              },
              {
                day: "wed",
                label: "수",
                isOpen: true,
                startH: "09",
                startM: "00",
                endH: "22",
                endM: "00",
              },
              {
                day: "thu",
                label: "목",
                isOpen: true,
                startH: "09",
                startM: "00",
                endH: "22",
                endM: "00",
              },
              {
                day: "fri",
                label: "금",
                isOpen: true,
                startH: "09",
                startM: "00",
                endH: "22",
                endM: "00",
              },
              {
                day: "sat",
                label: "토",
                isOpen: true,
                startH: "09",
                startM: "00",
                endH: "22",
                endM: "00",
              },
              {
                day: "sun",
                label: "일",
                isOpen: true,
                startH: "09",
                startM: "00",
                endH: "22",
                endM: "00",
              },
            ];

            const normalHours = data.operatingHours.filter(
              (h) => h.weekOfMonth === 0,
            );
            const restHours = data.operatingHours.filter(
              (h) => h.isDayOff === "Y" && h.weekOfMonth > 0,
            );

            restHours.forEach((timeInfo) => {
              fetchedRestDays.push({
                id: Date.now() + Math.random(),
                weekMonth:
                  reverseWeekMonthMapping[timeInfo.weekOfMonth] || "week",
                day: timeInfo.dayOfWeek?.toLowerCase(),
              });
            });

            normalHours.forEach((timeInfo) => {
              const dayKey = timeInfo.dayOfWeek?.toLowerCase();
              const diffIndex = fetchedDiffTimes.findIndex(
                (d) => d.day === dayKey,
              );

              if (diffIndex !== -1) {
                const isOpen = timeInfo.isDayOff === "N";
                let stH = "09",
                  stM = "00",
                  edH = "22",
                  edM = "00";

                if (isOpen && timeInfo.openTime && timeInfo.closeTime) {
                  const [rawStH, rawStM] = timeInfo.openTime.split(":");
                  const [rawEdH, rawEdM] = timeInfo.closeTime.split(":");

                  stH = rawStH?.padStart(2, "0") || "09";
                  stM = rawStM?.padStart(2, "0") || "00";
                  edH = rawEdH?.padStart(2, "0") || "22";
                  edM = rawEdM?.padStart(2, "0") || "00";
                }

                fetchedDiffTimes[diffIndex] = {
                  ...fetchedDiffTimes[diffIndex],
                  isOpen,
                  startH: stH,
                  startM: stM,
                  endH: edH,
                  endM: edM,
                };
              }
            });

            setDiffTimes(fetchedDiffTimes);
            setRestDays(fetchedRestDays);

            const openHours = normalHours.filter((h) => h.isDayOff === "N");
            const allSame =
              normalHours.length === 7 &&
              openHours.length === 7 &&
              openHours.every(
                (h) =>
                  h.openTime === openHours[0].openTime &&
                  h.closeTime === openHours[0].closeTime,
              );

            if (allSame) {
              setHoursType("same");
              const firstOpen = openHours[0].openTime;
              const firstClose = openHours[0].closeTime;

              if (
                firstOpen === "00:00" &&
                (firstClose === "23:59" || firstClose === "24:00")
              ) {
                setIs24h(true);
              } else {
                const [sH, sM] = firstOpen.split(":");
                const [eH, eM] = firstClose.split(":");

                setSameTime({
                  startH: sH.padStart(2, "0"),
                  startM: sM.padStart(2, "0"),
                  endH: eH.padStart(2, "0"),
                  endM: eM.padStart(2, "0"),
                });
              }
            } else {
              setHoursType("diff");
            }
          }
        }
      } catch (error) {
        console.error(
          "媛寃??뺣낫瑜?遺덈윭?ㅻ뒗 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.",
          error,
        );
      }
    };

    fetchStoreData();
  }, [storeId]);

  const handleSubmit = withSubmitButtonLoading(async (e) => {
    e.preventDefault();

    if (!formData.storeName.trim()) return showAlert("가게명을 입력해주세요.");
    if (!formData.storeIntro.trim())
      return showAlert("가게 소개를 입력해주세요.");
    if (formData.storePhone.length < 9)
      return showAlert("올바른 가게 번호(9자리 이상)를 입력해주세요.");
    if (!formData.storeAddress.trim())
      return showAlert("가게 주소를 입력해주세요.");
    if (!formData.latitude || !formData.longitude)
      return showAlert("주소 검색을 통해 정확한 위치를 설정해주세요.");
    if (formData.businessNumber.length !== 12)
      return showAlert("사업자 번호(10자리)를 올바르게 입력해주세요.");
    if (!formData.openDate) return showAlert("개업일자를 선택해주세요.");
    if (!formData.storeOriginInfo.trim())
      return showAlert("원산지 정보를 입력해주세요.");

    try {
      const closedDays = diffTimes
        .filter((item) => !item.isOpen)
        .map((item) => item.day);
      const filteredRestDays = restDays.filter(
        (rd) => !closedDays.includes(rd.day),
      );

      const payload = {
        storeId: storeId,
        storeName: formData.storeName,
        storeAddress: formData.storeAddress,
        storePhone: formData.storePhone,
        storeIntro: formData.storeIntro,
        storeOriginInfo: formData.storeOriginInfo,
        storeOwnerNo: formData.businessNumber,
        storeCategory: activeCategory,
        latitude: formData.latitude,
        longitude: formData.longitude,
        openingDate: formData.openDate,
        hoursInfo: {
          hoursType: hoursType,
          is24h: is24h,
          sameTime: sameTime,
          diffTimes: diffTimes,
          restDays: filteredRestDays,
        },
      };

      const sendData = new FormData();

      sendData.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );

      if (selectedFile) {
        sendData.append("file", selectedFile);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/stores/update`,
        sendData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200 || response.data === "SUCCESS") {
        await showAlert("정보 변경이 완료되었습니다.", "success");
        window.location.reload();
      }
    } catch (error) {
      console.error("????ㅽ뙣", error);
      showAlert("서버 오류가 발생했습니다. 다시 시도해주세요.", "error");
    }
  });

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.infoForm}>
        {/* 媛寃뚮챸 */}
        <div className={styles.formRow}>
          <label className={styles.label}>가게명</label>
          <div className={styles.inputWrap}>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              className={styles.inputBase}
              maxLength={100}
              placeholder="가게 이름을 입력하세요"
            />
          </div>
        </div>

        {/* 媛寃??뚭컻 */}
        <div className={styles.formRow}>
          <label className={styles.label}>가게 소개</label>
          <div className={styles.inputWrap}>
            <textarea
              name="storeIntro"
              value={formData.storeIntro}
              onChange={handleInputChange}
              className={styles.textareaBase}
              placeholder="가게 소개를 입력해주세요. (1000자 이내)"
              maxLength={1000}
            />
          </div>
        </div>

        {/* 媛寃??꾪솕踰덊샇 */}
        <div className={styles.formRow}>
          <label className={styles.label}>가게 전화번호</label>
          <div className={styles.inputWrap}>
            <input
              type="text"
              name="storePhone"
              value={formData.storePhone}
              onChange={handleInputChange}
              className={styles.inputBase}
              placeholder="02-000-0000 또는 010-0000-0000"
              maxLength={13}
            />
          </div>
        </div>

        {/* 媛寃?二쇱냼 */}
        <div className={styles.formRow}>
          <label className={styles.label}>가게 주소</label>
          <div className={styles.inputWrap}>
            <div className={styles.addressTopRow}>
              <input
                type="text"
                name="storeAddress"
                value={formData.storeAddress}
                onChange={handleInputChange}
                placeholder="(우편번호) 주소를 검색하고 상세주소를 입력하세요"
                className={styles.inputBase}
              />
              <button
                type="button"
                className={styles.addressSearchBtn}
                onClick={handleSearchAddress}
              >
                주소 찾기
              </button>
            </div>
          </div>
        </div>

        {/* ?ъ뾽??踰덊샇 */}
        <div className={styles.formRow}>
          <label className={styles.label}>사업자 번호</label>
          <div className={styles.inputWrap}>
            <input
              type="text"
              name="businessNumber"
              value={formData.businessNumber}
              onChange={handleInputChange}
              placeholder="000-00-00000"
              className={styles.inputBase}
              maxLength={12}
            />
          </div>
        </div>

        {/* ?뙚 媛쒖뾽?쇱옄 */}
        <div className={styles.formRow}>
          <label className={styles.label}>개업일자</label>
          <div className={styles.inputWrap}>
            <div className={styles.dateFieldWrap}>
              <input
                type="text"
                name="openDate"
                value={formData.openDate || ""}
                className={`${styles.inputBase} ${styles.dateInput}`}
                placeholder="YYYY-MM-DD"
                readOnly
                onClick={() => setShowCalendar(!showCalendar)}
              />
              <CalendarMonthIcon
                onClick={() => setShowCalendar(!showCalendar)}
                className={styles.calendarIcon}
              />

              {/* ?щ젰 ?앹뾽 */}
              {showCalendar && (
                <div className={styles.calendarPopup}>
                  <Calendar
                    onChange={handleDateChange}
                    calendarType="gregory"
                    maxDate={new Date()}
                    value={
                      formData.openDate
                        ? new Date(formData.openDate)
                        : new Date()
                    }
                    formatDay={(locale, date) =>
                      date.toLocaleString("en", { day: "numeric" })
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 移댄뀒怨좊━ */}
        <div className={styles.formRow}>
          <label className={styles.label}>카테고리</label>
          <div className={styles.inputWrap}>
            <div className={styles.categoryGroup}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setActiveCategory(cat.value)}
                  className={`${styles.categoryBtn} ${
                    activeCategory === cat.value ? styles.categoryBtnActive : ""
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ?먯궛吏 ?뺣낫 */}
        <div className={styles.formRow}>
          <label className={styles.label}>원산지 정보</label>
          <div className={styles.inputWrap}>
            <textarea
              name="storeOriginInfo"
              value={formData.storeOriginInfo}
              onChange={handleInputChange}
              className={styles.textareaBase}
              placeholder="원산지 정보를 입력해주세요. (1000자 이내)"
              maxLength={1000}
            />
          </div>
        </div>

        {/* ?대?吏 ?낅줈???곸뿭 */}
        <div className={styles.formRow}>
          <div className={styles.forminfo}>
            <label className={styles.label}>가게 대표 이미지</label>
            <label htmlFor="storeThumb" className={styles.browseBtn}>
              {previewImg ? "이미지 변경" : "Browse Files"}
            </label>
          </div>
          <div className={styles.inputWrap}>
            <div className={styles.imageUploadBox}>
              {previewImg ? (
                <img
                  src={previewImg} // 로직을 단순화했습니다.
                  alt="가게 미리보기"
                  className={styles.previewImageTag}
                />
              ) : (
                <div className={styles.noImage}>이미지 없음</div> // 대신 보여줄 텍스트나 빈 박스
              )}

              <input
                type="file"
                id="storeThumb"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />

              <div
                className={`${styles.uploadContent} ${previewImg ? styles.hasPreview : ""}`}
              >
                {!previewImg && (
                  <PhotoCameraIcon style={{ fontSize: 40, color: "#ccc" }} />
                )}
                <p className={styles.uploadText}>
                  {previewImg ? "" : "가게 대표 이미지"}
                </p>
                {!previewImg && (
                  <p className={styles.uploadHint}>PNG, JPG up to 10MB</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sectionDivider}>운영시간 및 휴무일 설정</div>

        <div className={styles.formRow}>
          <label className={styles.label}>운영시간</label>
          <div className={styles.inputWrap}>
            <div className={styles.hoursToggleGroup}>
              <button
                type="button"
                className={`${styles.hoursToggleBtn} ${
                  hoursType === "same" ? styles.hoursToggleBtnActive : ""
                }`}
                onClick={() => setHoursType("same")}
              >
                매일 같은 시간으로 운영해요{" "}
                {hoursType === "same" && (
                  <span className={styles.checkIcon}>✓</span>
                )}
              </button>
              <button
                type="button"
                className={`${styles.hoursToggleBtn} ${
                  hoursType === "diff" ? styles.hoursToggleBtnActive : ""
                }`}
                onClick={() => setHoursType("diff")}
              >
                요일별로 다르게 운영해요{" "}
                {hoursType === "diff" && (
                  <span className={styles.checkIcon}>✓</span>
                )}
              </button>
            </div>

            <div className={styles.hoursContentBox}>
              {hoursType === "same" ? (
                <>
                  <div className={styles.hoursHeaderRow}>
                    <div className={styles.checkboxWrap}>
                      <input
                        type="checkbox"
                        id="is24h"
                        checked={is24h}
                        onChange={(e) => setIs24h(e.target.checked)}
                      />
                      <label htmlFor="is24h">24시간 운영</label>
                    </div>
                  </div>
                  <div className={styles.timeInputRow}>
                    <span className={styles.timeLabel}>시작</span>
                    <select
                      className={styles.timeSelect}
                      value={sameTime.startH}
                      onChange={(e) =>
                        setSameTime({ ...sameTime, startH: e.target.value })
                      }
                      disabled={is24h}
                    >
                      {renderTimeOptions(23)}
                    </select>
                    시
                    <select
                      className={styles.timeSelect}
                      value={sameTime.startM}
                      onChange={(e) =>
                        setSameTime({ ...sameTime, startM: e.target.value })
                      }
                      disabled={is24h}
                    >
                      {renderTimeOptions(50, 10)}
                    </select>
                    분
                  </div>
                  <div className={styles.timeInputRow}>
                    <span className={styles.timeLabel}>종료</span>
                    <select
                      className={styles.timeSelect}
                      value={sameTime.endH}
                      onChange={(e) =>
                        setSameTime({ ...sameTime, endH: e.target.value })
                      }
                      disabled={is24h}
                    >
                      {renderTimeOptions(23)}
                    </select>{" "}
                    시
                    <select
                      className={styles.timeSelect}
                      value={sameTime.endM}
                      onChange={(e) =>
                        setSameTime({ ...sameTime, endM: e.target.value })
                      }
                      disabled={is24h}
                    >
                      {renderTimeOptions(50, 10)}
                    </select>{" "}
                    분
                  </div>
                </>
              ) : (
                <div className={styles.diffHoursList}>
                  {diffTimes.map((item, idx) => (
                    <div key={idx} className={styles.dayRow}>
                      <div className={styles.checkboxWrap}>
                        <input
                          type="checkbox"
                          id={`day_${idx}`}
                          checked={item.isOpen}
                          onChange={(e) =>
                            handleDiffTimeChange(
                              idx,
                              "isOpen",
                              e.target.checked,
                            )
                          }
                        />
                        <label htmlFor={`day_${idx}`}>{item.label}요일</label>
                      </div>
                      <div className={styles.dayTimeGroup}>
                        <select
                          className={styles.timeSelect}
                          value={item.startH}
                          onChange={(e) =>
                            handleDiffTimeChange(idx, "startH", e.target.value)
                          }
                          disabled={!item.isOpen}
                        >
                          {renderTimeOptions(23)}
                        </select>{" "}
                        :
                        <select
                          className={styles.timeSelect}
                          value={item.startM}
                          onChange={(e) =>
                            handleDiffTimeChange(idx, "startM", e.target.value)
                          }
                          disabled={!item.isOpen}
                        >
                          {renderTimeOptions(50, 10)}
                        </select>
                        <span className={styles.tilde}>~</span>
                        <select
                          className={styles.timeSelect}
                          value={item.endH}
                          onChange={(e) =>
                            handleDiffTimeChange(idx, "endH", e.target.value)
                          }
                          disabled={!item.isOpen}
                        >
                          {renderTimeOptions(23)}
                        </select>{" "}
                        :
                        <select
                          className={styles.timeSelect}
                          value={item.endM}
                          onChange={(e) =>
                            handleDiffTimeChange(idx, "endM", e.target.value)
                          }
                          disabled={!item.isOpen}
                        >
                          {renderTimeOptions(50, 10)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>휴무일</label>
          <div className={styles.inputWrap}>
            <div className={styles.restDayBox}>
              {restDays.length === 0 ? (
                <p className={styles.noRestDayMsg}>
                  등록된 정기 휴무일이 없습니다. (연중무휴)
                </p>
              ) : (
                restDays.map((rd) => (
                  <div key={rd.id} className={styles.restDayItem}>
                    <div className={styles.restDaySelects}>
                      <select
                        className={styles.inputBaseSelect}
                        value={rd.weekMonth}
                        onChange={(e) =>
                          handleRestDayChange(
                            rd.id,
                            "weekMonth",
                            e.target.value,
                          )
                        }
                      >
                        {restWeekMonthOpts.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <select
                        className={styles.inputBaseSelect}
                        value={rd.day}
                        onChange={(e) =>
                          handleRestDayChange(rd.id, "day", e.target.value)
                        }
                      >
                        {restDayOpts.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRestDay(rd.id)}
                      className={styles.deleteTextBtn}
                    >
                      삭제
                    </button>
                  </div>
                ))
              )}
              <button
                type="button"
                onClick={handleAddRestDay}
                className={styles.addTextBtn}
              >
                + 정기 휴무일 추가
              </button>
            </div>
          </div>
        </div>

        <div className={styles.submitWrap}>
          <button type="submit" className={styles.submitBtn}>
            정보 변경하기
          </button>
        </div>
      </form>
    </div>
  );
}
