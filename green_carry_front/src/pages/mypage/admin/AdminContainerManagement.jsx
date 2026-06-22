import { useEffect, useRef, useState } from "react";
import styles from "./AdminContainerManagement.module.css";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../../utils/accessToken";
import Swal from "sweetalert2";
import { withButtonLoading } from "../../../utils/buttonLoading";

const AdminContainerManagement = () => {
  const location = useLocation();
  const passedData = location.state?.carbonData;
  const backHost = import.meta.env.VITE_BACKSERVER;

  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith("blob:")) {
      return imagePath;
    }
    return `${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const [productName, setProductName] = useState(
    passedData?.productMaterial || "",
  );
  const [kgValue, setKgValue] = useState(passedData?.productEmissions || "");
  const [description, setDescription] = useState(passedData?.productDesc || "");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [uploadFile, setUploadFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(
    resolveImageUrl(passedData?.productImg),
  );
  const [isDragging, setIsDragging] = useState(false);

  const navigate = useNavigate();
  const fileInput = useRef(null);
  const { productId } = useParams();
  const MAX_LENGTH = 240;

  const onUploadBtnClick = () => {
    fileInput.current?.click();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const onRemoveFile = (e) => {
    e.stopPropagation();
    if (previewImg && previewImg.startsWith("blob:")) {
      URL.revokeObjectURL(previewImg);
    }
    setFileName("");
    setFileSize(0);
    setUploadFile(null);
    setPreviewImg("");
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };

  useEffect(() => {
    if (!productId || productId === "new") {
      setProductName("");
      setKgValue("");
      setDescription("");
      setFileName("");
      setFileSize(0);
      setUploadFile(null);
      setPreviewImg("");
      return;
    }

    if (passedData) {
      setProductName(passedData.productMaterial || "");
      setKgValue(passedData.productEmissions || "");
      setDescription(passedData.productDesc || "");
      setFileName(passedData.productImg || "");
      setFileSize(0);
      setUploadFile(null);
      setPreviewImg(resolveImageUrl(passedData.productImg));
    }
  }, [productId, passedData]);

  const handleSaveFile = (file) => {
    if (!file) return;

    if (previewImg && previewImg.startsWith("blob:")) {
      URL.revokeObjectURL(previewImg);
    }

    setFileName(file.name);
    setFileSize(file.size);
    setUploadFile(file);
    setPreviewImg(URL.createObjectURL(file));
  };

  const handleDescriptionChange = (e) => {
    const inputText = e.target.value;
    if (inputText.length <= MAX_LENGTH) {
      setDescription(inputText);
    }
  };

  const handleFileChange = (e) => {
    handleSaveFile(e.target.files?.[0]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleSaveFile(e.dataTransfer.files?.[0]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const handleCo2Change = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    if (value.split(".").length > 2) return;
    setKgValue(value);
  };

  const handleSaveSubmit = withButtonLoading(async () => {
    if (!productName.trim()) {
      return Swal.fire("알림", "용기 이름을 입력해주세요.", "warning");
    }
    if (!kgValue) {
      return Swal.fire("알림", "용기 탄소 배출량을 입력해주세요.", "warning");
    }

    const formData = new FormData();

    if (productId && productId !== "new") {
      formData.append("productId", parseInt(productId, 10));
    }

    formData.append("productMaterial", productName.trim());
    formData.append("productEmissions", kgValue);
    formData.append("productDesc", description);

    if (uploadFile) {
      formData.append("uploadFile", uploadFile);
    } else if (productId !== "new" && passedData?.productImg) {
      formData.append("productImg", passedData.productImg);
    }

    try {
      const response = await api.post("/carbon-list/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data === "SUCCESS") {
        Swal.fire("성공", "용기 정보가 저장되었습니다.", "success").then(() => {
          navigate("/mypage/admin/containers");
        });
      } else {
        Swal.fire("실패", `서버 응답: ${response.data}`, "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("에러", "서버 통신 중 오류가 발생했습니다.", "error");
    }
  });

  return (
    <div>
      <div className={styles.main}>
        <span>용기 등록</span>
      </div>
      <div
        className={`${styles.upload_box} ${isDragging ? styles.dragging : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          ref={fileInput}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/gif"
          style={{ display: "none" }}
        />

        {fileName ? (
          <div className={styles.attached_container}>
            {previewImg && (
              <img
                src={previewImg}
                alt="용기 미리보기"
                className={styles.preview_img}
              />
            )}
            <div className={styles.attached_left}>
              <CheckIcon className={styles.check_icon} />
              <div className={styles.attached_text}>
                <span className={styles.attached_name}>첨부 완료</span>
                <span className={styles.attached_size}>
                  {fileName}
                  {fileSize > 0 ? ` | ${formatBytes(fileSize)}` : ""}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={styles.close_btn}
              onClick={onRemoveFile}
            >
              <CloseIcon />
            </button>
          </div>
        ) : (
          <div className={styles.upload_content}>
            <img
              src="/image/recycling.png"
              alt="업로드 아이콘"
              className={styles.upload_icon}
            />
            <p className={styles.upload_title}>
              용기 사진을 업로드하거나 드래그해서 올려주세요.
            </p>
            <p className={styles.upload_sub}>PNG, JPG, GIF (최대 5MB)</p>
            <button
              type="button"
              className={styles.upload_btn}
              onClick={onUploadBtnClick}
            >
              지금 찾아보기
            </button>
          </div>
        )}
      </div>
      <section className={styles.input_two}>
        <div className={styles.item_name_input}>
          <p>용기 이름</p>
          <input
            type="text"
            placeholder="ex) 종이컵 용기(대)"
            className={styles.item_name}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
        <div className={styles.co2_value_input}>
          <p>용기 탄소 배출량 (kg)</p>
          <div className={styles.input_wrapper}>
            <input
              type="text"
              placeholder="0"
              className={styles.co2_value}
              value={kgValue}
              onChange={handleCo2Change}
            />
            {kgValue && <span className={styles.unit}>kg</span>}
          </div>
        </div>
      </section>
      <section className={styles.desc_section}>
        <div className={styles.item_content}>
          <p>용기 설명 (선택 사항)</p>
          <div className={styles.textarea_wrapper}>
            <textarea
              className={styles.item_content_input}
              placeholder="용기에 대한 설명을 작성해주세요."
              value={description}
              onChange={handleDescriptionChange}
            />
            <span className={styles.char_count}>
              {description.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>
      </section>
      <div className={styles.btn}>
        <button
          type="button"
          className={styles.cancel_btn}
          onClick={() => navigate(-1)}
        >
          취소
        </button>
        <button
          type="button"
          className={styles.save_btn}
          onClick={handleSaveSubmit}
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default AdminContainerManagement;
