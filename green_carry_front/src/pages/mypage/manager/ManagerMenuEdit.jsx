import { useEffect, useState } from "react";
import styles from "./ManagerMenuEdit.module.css";
import {
  SearchIcon,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  Plus,
  Minus,
  Camera,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const ManagerMenuEdit = () => {
  const navigate = useNavigate();
  const { storeId, menuId } = useParams();

  // --- [State] 기본 정보 ---
  const [menu, setMenu] = useState({
    menuName: "",
    menuInfo: "",
    menuImage: null,
    menuPrice: "",
    menuCategory: "메인",
    menuStatus: 1,
  });

  // 사진 미리보기용 URL
  const [previewUrl, setPreviewUrl] = useState("");

  // --- [State] 용기 설정 ---
  const [containerMaster, setContainerMaster] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState([]);

  // --- [State] 옵션 설정 ---
  const [allOptions, setAllOptions] = useState([]);
  const [existingOptions, setExistingOptions] = useState([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [newOptions, setNewOptions] = useState([]);

  // 옵션 추가 시 상태
  const [tempSize, setTempSize] = useState({ name: "", price: "", carbon: "" });
  const [tempGeneral, setTempGeneral] = useState({
    name: "",
    price: "",
    carbon: "",
  });

  const [openSections, setOpenSections] = useState({
    size: true,
    general: false,
    eco: false,
  });

  // 총 탄소 배출량 계산 로직
  const totalCarbonEmission = selectedContainers.reduce((acc, cur) => {
    return acc + (cur.emissions || 0) * cur.count;
  }, 0);

  // --- [Effect] 데이터 로드 ---
  useEffect(() => {
    if (
      storeId === null ||
      storeId === "" ||
      menuId === null ||
      storeId === ""
    ) {
      navigate("/mypage/manager/menus");
    }

    console.log(storeId, menuId);

    const backHost = import.meta.env.VITE_BACKSERVER;

    // 1. 용기 마스터 목록 로드
    axios
      .get(`${backHost}/menus/containers`)
      .then((res) => {
        setContainerMaster(res.data);
      })
      .catch((err) => console.error("용기 데이터 로드 실패", err));

    // 3. 수정 모드 데이터 로드
    if (menuId) {
      axios.get(`${backHost}/menus/${menuId}`).then((res) => {
        const imagePath =
          res.data.menuImagePath ||
          res.data.menuImage ||
          res.data.menu_image ||
          "";

        setMenu({
          menuName: res.data.menuName,
          menuInfo: res.data.menuInfo,
          menuImage: imagePath, // 찾은 경로를 넣어줌
          menuPrice: res.data.menuPrice,
          menuCategory: res.data.menuCategory,
          menuStatus: res.data.menuStatus,
        });

        //  기존 이미지가 있다면 서버 주소를 붙여서 미리보기 세팅
        if (imagePath) {
          setPreviewUrl(imagePath);
        } else {
          // 혹시라도 경로가 안 왔을 경우를 위해 콘솔에 찍어보기
          console.warn(
            "⚠️ 서버에서 사진 경로를 보내주지 않았습니다!",
            res.data,
          );
        }
      });

      axios.get(`${backHost}/menus/${menuId}/options`).then((res) => {
        setExistingOptions(res.data);
        setSelectedOptionIds(res.data.map((opt) => opt.optionNo));
      });

      axios.get(`${backHost}/menus/${menuId}/containers`).then((res) => {
        setSelectedContainers(
          res.data.map((item) => ({
            productId: item.productId,
            name: item.productMaterial,
            count: item.containerCount,
            emissions: item.productEmissions,
          })),
        );
      });
    }
  }, [menuId]);

  // --- [Handlers] 기본 입력 및 파일 ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "menuPrice")
      setMenu({ ...menu, [name]: value.replace(/[^0-9]/g, "") });
    else setMenu({ ...menu, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMenu({ ...menu, menuImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addContainer = (target) => {
    if (selectedContainers.find((c) => c.productId === target.productId))
      return Swal.fire({
        icon: "warning",
        text: "이미 추가된 용기입니다.",
      });

    setSelectedContainers([
      ...selectedContainers,
      {
        productId: target.productId,
        name: target.productMaterial,
        count: 1,
        emissions: target.productEmissions || 0,
      },
    ]);
    setSearchTerm("");
    setIsListOpen(false);
  };

  //  [수정된 부분] 저장 로직: 빈 값 방어 코드 추가
  const handleSave = () => {
    // 필수값 검사 (가격, 이름 등)
    if (!menu.menuName || !menu.menuPrice) {
      Swal.fire({
        icon: "warning",
        text: "메뉴이름과 가격은 필수 항목 입니다.",
      });
      return;
    }

    const formData = new FormData();
    const backHost = import.meta.env.VITE_BACKSERVER;

    // 빈칸 방어: 값이 없으면 기본값으로 세팅해서 에러 방지
    formData.append("menuName", menu.menuName || "");
    formData.append("menuInfo", menu.menuInfo || "");
    formData.append("menuPrice", menu.menuPrice ? Number(menu.menuPrice) : 0);
    formData.append("menuCategory", menu.menuCategory || "메인");
    formData.append(
      "menuStatus",
      menu.menuStatus !== undefined ? menu.menuStatus : 1,
    );
    formData.append("storeId", storeId || 1);
    formData.append(
      "menuCarbon",
      totalCarbonEmission ? Number(totalCarbonEmission) : 0,
    );

    // 배열 데이터 안전하게 전송
    formData.append("optionIds", JSON.stringify(selectedOptionIds || []));
    formData.append("newOptions", JSON.stringify(newOptions || []));
    formData.append(
      "containerMap",
      JSON.stringify(
        selectedContainers.map((c) => ({
          productId: c.productId,
          count: c.count,
        })) || [],
      ),
    );

    // 파일 전송
    if (menu.menuImage instanceof File) {
      formData.append("menuImage", menu.menuImage);
    }

    const method = "post";
    const url = menuId ? `/menus/${storeId}/${menuId}` : `/menus/${storeId}`;

    axios({
      method,
      url: `${backHost}${url}`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(() => {
        Swal.fire({
          icon: "success",
          text: "저장되었습니다.",
        });
        navigate(-1);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          icon: "warning",
          text: "저장 중 오류가 발생했습니다. 자바 콘솔 창을 확인해주세요!",
        });
      });
  };

  const handleStatusToggle = () => {
    const nextStatus = menu.menuStatus === 1 ? 0 : 1;
    axios
      .patch(`${import.meta.env.VITE_BACKSERVER}/menus/${menuId}/status`, {
        menuStatus: nextStatus,
      })
      .then(() => {
        setMenu((prev) => ({ ...prev, menuStatus: nextStatus }));
        Swal.fire({
          icon: "success",
          text:
            nextStatus === 1
              ? "판매중으로 변경되었습니다."
              : "판매중지로 변경되었습니다.",
        });
      })
      .catch(() => {
        Swal.fire({
          icon: "warning",
          text: "상태 변경에 실패했습니다.",
        });
      });
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      icon: "warning", // 느낌표 아이콘
      title: "정말 삭제하시겠습니까?",
      text: "이 작업은 되돌릴 수 없습니다.",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    });

    if (!result.isConfirmed) return;
    axios
      .delete(`${import.meta.env.VITE_BACKSERVER}/menus/${menuId}`)
      .then(() => {
        Swal.fire({
          icon: "success",
          text: "메뉴가 삭제되었습니다.",
        });
        navigate(-1);
      })
      .catch(() => {
        Swal.fire({
          icon: "warning",
          text: "삭제에 실패했습니다.",
        });
      });
  };

  const generalList = allOptions.filter((o) => o.optionType === 2);
  const ecoList = allOptions.filter((o) => o.optionType === 3);

  return (
    <div className={styles.page_container}>
      <div className={styles.edit_box}>
        <h2 className={styles.main_title}>
          {menuId ? "메뉴 수정하기" : "새 메뉴 등록"}
        </h2>

        <div className={styles.top_content}>
          <div className={styles.form_section}>
            <div className={styles.input_row}>
              <label>메뉴이름</label>
              <input
                name="menuName"
                className={styles.input_field}
                value={menu.menuName}
                onChange={handleInputChange}
                maxLength={100}
                placeholder="메뉴명을 입력하세요"
              />
            </div>
            <div className={styles.input_row}>
              <label>메뉴설명</label>
              <textarea
                name="menuInfo"
                className={styles.textarea_field}
                value={menu.menuInfo}
                onChange={handleInputChange}
                maxLength={1000}
                placeholder="메뉴 설명을 상세히 적어주세요"
              />
            </div>

            <div className={styles.input_row}>
              <label
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>용기 설정</span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#10b981",
                    fontWeight: "bold",
                  }}
                >
                  예상 총 탄소 배출량: {totalCarbonEmission.toFixed(2)} kg
                </span>
              </label>
              <div className={styles.search_container}>
                <div className={styles.search_bar}>
                  <input
                    type="text"
                    placeholder="용기 재질 검색 (PP, 종이 등)"
                    value={searchTerm}
                    onFocus={() => setIsListOpen(true)}
                    onBlur={() => setTimeout(() => setIsListOpen(false), 200)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <SearchIcon size={18} className={styles.search_icon} />
                  {isListOpen && searchTerm && (
                    <ul className={styles.dropdown}>
                      {Array.isArray(containerMaster) &&
                        containerMaster
                          .filter((c) =>
                            c.productMaterial
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()),
                          )
                          .map((c) => (
                            <li
                              key={c.productId}
                              onMouseDown={() => addContainer(c)}
                            >
                              {c.productMaterial}
                              <span className={styles.carbon_val}>
                                (탄소: {c.productEmissions}kg)
                              </span>
                            </li>
                          ))}
                    </ul>
                  )}
                </div>
                <div className={styles.selected_container_list}>
                  {selectedContainers.map((c) => (
                    <div key={c.productId} className={styles.container_item}>
                      <span className={styles.c_name}>{c.name}</span>
                      <div className={styles.c_controls}>
                        <button
                          onClick={() =>
                            setSelectedContainers((prev) =>
                              prev.map((item) =>
                                item.productId === c.productId
                                  ? {
                                      ...item,
                                      count: Math.max(1, item.count - 1),
                                    }
                                  : item,
                              ),
                            )
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <span>{c.count}개</span>
                        <button
                          onClick={() =>
                            setSelectedContainers((prev) =>
                              prev.map((item) =>
                                item.productId === c.productId
                                  ? { ...item, count: item.count + 1 }
                                  : item,
                              ),
                            )
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <X
                        size={16}
                        className={styles.c_remove}
                        onClick={() =>
                          setSelectedContainers((prev) =>
                            prev.filter(
                              (item) => item.productId !== c.productId,
                            ),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.input_row_group}>
              <div className={styles.input_row}>
                <label>카테고리</label>
                <select
                  name="menuCategory"
                  className={styles.select_field}
                  value={menu.menuCategory}
                  onChange={handleInputChange}
                >
                  <option value="메인">메인</option>
                  <option value="사이드">사이드</option>
                  <option value="음료">음료</option>
                </select>
              </div>
              <div className={styles.input_row}>
                <label>가격</label>
                <input
                  name="menuPrice"
                  className={styles.input_field}
                  value={menu.menuPrice}
                  onChange={handleInputChange}
                  placeholder="판매가 입력"
                />
              </div>
            </div>
          </div>

          <div className={styles.image_section}>
            <div className={styles.upload_card}>
              <p className={styles.up_text}>메뉴 사진</p>

              <div className={styles.preview_box}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className={styles.image_preview}
                  />
                ) : (
                  <div className={styles.no_image}>
                    <Camera size={40} color="#ccc" />
                    <span>이미지 없음</span>
                  </div>
                )}
              </div>

              <label htmlFor="menu-file" className={styles.browse_button}>
                {previewUrl ? <RefreshCw size={16} /> : <Upload size={16} />}
                {previewUrl ? " 사진 변경하기" : " 사진 올리기"}
              </label>
              <input
                id="menu-file"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        <h3 className={styles.sub_title}>옵션 설정</h3>

        {[
          { t: "사이즈 옵션", k: "size", l: [] },
          { t: "일반 옵션", k: "general", l: generalList },
          { t: "에코포인트 옵션", k: "eco", l: ecoList },
        ].map((sec, idx) => (
          <div className={styles.accordion_group} key={sec.k}>
            <div
              className={styles.group_header}
              onClick={() =>
                setOpenSections({
                  ...openSections,
                  [sec.k]: !openSections[sec.k],
                })
              }
            >
              <span>{sec.t}</span>{" "}
              {openSections[sec.k] ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            {openSections[sec.k] && (
              <div className={styles.group_body}>
                {sec.k !== "eco" && (
                  <div className={styles.add_form}>
                    <input
                      placeholder="이름"
                      maxLength={30}
                      value={
                        sec.k === "size" ? tempSize.name : tempGeneral.name
                      }
                      onChange={(e) =>
                        sec.k === "size"
                          ? setTempSize({ ...tempSize, name: e.target.value })
                          : setTempGeneral({
                              ...tempGeneral,
                              name: e.target.value,
                            })
                      }
                    />
                    <input
                      placeholder="가격"
                      value={
                        sec.k === "size" ? tempSize.price : tempGeneral.price
                      }
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        sec.k === "size"
                          ? setTempSize({ ...tempSize, price: val })
                          : setTempGeneral({ ...tempGeneral, price: val });
                      }}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="탄소량"
                      style={{ width: "80px" }}
                      value={
                        sec.k === "size" ? tempSize.carbon : tempGeneral.carbon
                      }
                      // 1. 키보드에서 마이너스, e, 플러스 키 입력 자체를 차단
                      onKeyDown={(e) => {
                        if (["-", "e", "+", "E"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      // 2. 마우스 우클릭 -> 붙여넣기(Paste) 물리적 차단 (핵심!)
                      onPaste={(e) => {
                        e.preventDefault();
                      }}
                      // 3. 텍스트를 마우스로 끌어다 놓는(Drop) 행위 차단
                      onDrop={(e) => {
                        e.preventDefault();
                      }}
                      onChange={(e) => {
                        const val = e.target.value;

                        sec.k === "size"
                          ? setTempSize({ ...tempSize, carbon: val })
                          : setTempGeneral({ ...tempGeneral, carbon: val });
                      }}
                    />
                    <button
                      onClick={() => {
                        const cur = sec.k === "size" ? tempSize : tempGeneral;
                        if (!cur.name || !cur.price || cur.carbon === "")
                          return Swal.fire({
                            icon: "warning",
                            text: "이름, 가격, 탄소량을 모두 입력하세요.",
                          });

                        setNewOptions([
                          ...newOptions,
                          {
                            optionName: cur.name,
                            optionPrice: Number(cur.price),
                            optionCarbon: Number(cur.carbon),
                            optionType: idx + 1,
                            isNew: true,
                          },
                        ]);
                        sec.k === "size"
                          ? setTempSize({ name: "", price: "", carbon: "" })
                          : setTempGeneral({ name: "", price: "", carbon: "" });
                      }}
                    >
                      추가
                    </button>
                  </div>
                )}
                {sec.k === "eco" && (
                  <div className={styles.eco_fixed_box}>
                    <label className={styles.check_item}>
                      <input
                        type="checkbox"
                        checked={selectedOptionIds.includes(5)}
                        onChange={() =>
                          setSelectedOptionIds((prev) =>
                            prev.includes(5)
                              ? prev.filter((i) => i !== 5)
                              : [...prev, 5],
                          )
                        }
                      />{" "}
                      <strong>기본 반찬 안 받기</strong>
                    </label>
                    <label className={styles.check_item}>
                      <input
                        type="checkbox"
                        checked={selectedOptionIds.includes(6)}
                        onChange={() =>
                          setSelectedOptionIds((prev) =>
                            prev.includes(6)
                              ? prev.filter((i) => i !== 6)
                              : [...prev, 6],
                          )
                        }
                      />{" "}
                      <strong>일회용품 안 받기</strong>
                    </label>
                  </div>
                )}
                <div
                  className={
                    sec.k === "size" ? styles.badge_wrap : styles.checkbox_grid
                  }
                >
                  {sec.k === "size" ? (
                    <>
                      {existingOptions
                        .filter((o) => o.optionType === 1)
                        .map((o) => (
                          <span
                            key={`ex-size-${o.optionNo}`}
                            className={styles.opt_badge}
                          >
                            {o.optionName} (+{o.optionPrice}원 / 🌿{" "}
                            {o.optionCarbon || 0}){" "}
                            <X
                              size={12}
                              onClick={() => {
                                setExistingOptions((prev) =>
                                  prev.filter(
                                    (item) => item.optionNo !== o.optionNo,
                                  ),
                                );
                                setSelectedOptionIds((prev) =>
                                  prev.filter((id) => id !== o.optionNo),
                                );
                              }}
                            />
                          </span>
                        ))}

                      {newOptions
                        .filter((o) => o.optionType === 1)
                        .map((o, i) => (
                          <span
                            key={`new-size-${i}`}
                            className={styles.opt_badge}
                          >
                            {o.optionName} (+{o.optionPrice}원 / 🌿{" "}
                            {o.optionCarbon}){" "}
                            <X
                              size={12}
                              onClick={() =>
                                setNewOptions(
                                  newOptions.filter((item) => item !== o),
                                )
                              }
                            />
                          </span>
                        ))}
                    </>
                  ) : (
                    sec.l
                      .filter((o) => o.optionNo !== 5 && o.optionNo !== 6)
                      .map((o) => (
                        <label key={o.optionNo} className={styles.check_item}>
                          <input
                            type="checkbox"
                            checked={selectedOptionIds.includes(o.optionNo)}
                            onChange={() =>
                              setSelectedOptionIds((prev) =>
                                prev.includes(o.optionNo)
                                  ? prev.filter((i) => i !== o.optionNo)
                                  : [...prev, o.optionNo],
                              )
                            }
                          />{" "}
                          {o.optionName}{" "}
                          {o.optionPrice > 0 ? `(+${o.optionPrice})` : ""}
                        </label>
                      ))
                  )}
                </div>

                {sec.k === "general" && (
                  <div
                    className={styles.badge_wrap}
                    style={{ marginTop: "12px" }}
                  >
                    {existingOptions
                      .filter(
                        (o) =>
                          o.optionType === 2 &&
                          !generalList.some((g) => g.optionNo === o.optionNo),
                      )
                      .map((o) => (
                        <span
                          key={`ex-gen-${o.optionNo}`}
                          className={styles.opt_badge}
                        >
                          {o.optionName} (+{o.optionPrice}원 / 🌿{" "}
                          {o.optionCarbon || 0}){" "}
                          <X
                            size={12}
                            onClick={() => {
                              setExistingOptions((prev) =>
                                prev.filter(
                                  (item) => item.optionNo !== o.optionNo,
                                ),
                              );
                              setSelectedOptionIds((prev) =>
                                prev.filter((id) => id !== o.optionNo),
                              );
                            }}
                          />
                        </span>
                      ))}

                    {newOptions
                      .filter((o) => o.optionType === 2)
                      .map((o, i) => (
                        <span key={`new-gen-${i}`} className={styles.opt_badge}>
                          {o.optionName} (+{o.optionPrice}원 / 🌿{" "}
                          {o.optionCarbon}){" "}
                          <X
                            size={12}
                            onClick={() =>
                              setNewOptions(
                                newOptions.filter((item) => item !== o),
                              )
                            }
                          />
                        </span>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* 판매 상태 표시 */}
        {menuId && (
          <div className={styles.status_area}>
            <span
              className={
                menu.menuStatus === 1 ? styles.status_on : styles.status_off
              }
            >
              {menu.menuStatus === 1 ? "● 판매중" : "● 판매중지"}
            </span>
            <button className={styles.status_btn} onClick={handleStatusToggle}>
              {menu.menuStatus === 1 ? "판매중지로 변경" : "판매중으로 변경"}
            </button>
          </div>
        )}

        <div className={styles.btn_area}>
          <button className={styles.green_btn} onClick={handleSave}>
            저장하기
          </button>
          <button className={styles.cancel_btn} onClick={() => navigate(-1)}>
            취소
          </button>
          {menuId && (
            <button className={styles.delete_btn} onClick={handleDelete}>
              메뉴 삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerMenuEdit;
