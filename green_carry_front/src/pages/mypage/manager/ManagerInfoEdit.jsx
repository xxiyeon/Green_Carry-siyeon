import { AuthContext } from "../../../context/AuthContext";

import styles from "./ManagerInfoEdit.module.css";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { useState, useRef, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../utils/accessToken";

// MUI Icons
import AccountCircleSharpIcon from "@mui/icons-material/AccountCircleSharp";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Collapse from "@mui/material/Collapse";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { withButtonLoading } from "../../../utils/buttonLoading";

export default function ManagerInfoEdit() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const backHost = import.meta.env.VITE_BACKSERVER;

  const [managerInfo, setManagerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  //  프로필 수정용 상태 추가
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    memberName: "",
    memberPhone: "",
    memberGrade: 1,
  });
  const [profileImg, setProfileImg] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const fileInputRef = useRef(null);

  const [openPwSet, setopenPwSet] = useState(false);
  const togglePwSet = () => setopenPwSet(!openPwSet);

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [pwData, setPwData] = useState({
    currentPw: "",
    newPw: "",
    confirmPw: "",
  });

  //  관리자(사용자) 정보 불러오기
  useEffect(() => {
    if (user && user.memberId) {
      api
        .get(`/member/getMemberInfo`, { params: { memberId: user.memberId } })
        .then((res) => {
          setManagerInfo(res.data);
          setProfileData({
            memberName: res.data.memberName || "",
            memberPhone: res.data.memberPhone || "",
            memberGrade: res.data.memberGrade || 1,
          });
          if (res.data.memberThumb) setPreviewImg(res.data.memberThumb);
          setLoading(false);
        })
        .catch((err) => {
          console.error("데이터 로드 실패:", err);
          setLoading(false);
        });
    }
  }, [user]);

  //  프로필 정보 변경 핸들러
  const handleProfileDataChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImg(file);
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = withButtonLoading(async () => {
    if (!profileData.memberName || !profileData.memberPhone) {
      return Swal.fire(
        "알림",
        "이름과 전화번호를 모두 입력해주세요.",
        "warning",
      );
    }

    const formData = new FormData();
    formData.append("memberId", user.memberId);
    formData.append("memberName", profileData.memberName);
    formData.append("memberPhone", profileData.memberPhone);
    formData.append("memberGrade", profileData.memberGrade);
    if (profileImg) {
      formData.append("uploadFile", profileImg);
    }

    try {
      const response = await api.post("/member/updateProfile", formData);

      if (response.data !== "UPDATE_FAIL") {
        Swal.fire("성공", "기본 정보가 수정되었습니다.", "success");

        const serverPath = response.data;
        const finalPath =
          serverPath === "SUCCESS_NO_IMAGE" ? previewImg : serverPath;

        //  1. 개별 로컬 스토리지 아이템 덮어쓰기
        localStorage.setItem("memberThumb", finalPath);
        localStorage.setItem("memberName", profileData.memberName);
        localStorage.setItem("memberPhone", profileData.memberPhone);

        //  2. member 객체가 통째로 저장되어 있을 경우를 대비한 업데이트
        const storedMember = JSON.parse(localStorage.getItem("member"));
        if (storedMember) {
          storedMember.memberThumb = finalPath;
          storedMember.memberName = profileData.memberName;
          storedMember.memberPhone = profileData.memberPhone;
          localStorage.setItem("member", JSON.stringify(storedMember));
        }

        //  3. 전역 상태(Context) user 업데이트
        setUser({
          ...user,
          memberThumb: finalPath,
          memberName: profileData.memberName,
          memberPhone: profileData.memberPhone,
        });

        //  4. 현재 페이지의 컴포넌트 상태 업데이트
        setPreviewImg(finalPath);
        setManagerInfo((prev) => ({
          ...prev,
          memberName: profileData.memberName,
          memberPhone: profileData.memberPhone,
        }));

        setIsEditingProfile(false);
      }
    } catch (err) {
      Swal.fire("에러", "수정 중 오류 발생", "error");
    }
  });

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwData({ ...pwData, [name]: value });
  };

  const handleDeleteClick = () => {
    navigate("/mypage/manager/deleteMember");
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className={styles.right}>
      {/*  수정된 프로필 편집 섹션 */}
      <section
        className={`${styles.right_main} ${
          isEditingProfile
            ? styles.right_main_editing
            : styles.right_main_default
        }`}
      >
        <div
          className={`${styles.icon_content} ${
            isEditingProfile
              ? styles.icon_content_editing
              : styles.icon_content_default
          }`}
        >
          {/* 이미지 래퍼 */}
          <div
            className={`${styles.icon_wrapper} ${
              isEditingProfile ? styles.icon_wrapper_editable : ""
            }`}
            onClick={() => isEditingProfile && fileInputRef.current.click()}
          >
            {previewImg ? (
              <img
                src={previewImg.startsWith("blob:") ? previewImg : previewImg}
                alt="profile"
                className={styles.profile_image}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <AccountCircleSharpIcon
                className={styles.icon_inside}
                style={{ fontSize: "60px" }}
              />
            )}

            {isEditingProfile && (
              <div className={styles.camera_overlay}>
                <PhotoCameraIcon fontSize="small" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className={styles.hidden_input}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <div className={styles.dashboard}>
            <p className={styles.dashboard_email}>{managerInfo?.memberEmail}</p>

            {isEditingProfile ? (
              <div className={styles.edit_form_container}>
                <input
                  type="text"
                  name="memberName"
                  value={profileData.memberName}
                  onChange={handleProfileDataChange}
                  className={styles.edit_input}
                  placeholder="이름"
                />
                <input
                  type="text"
                  name="memberPhone"
                  value={profileData.memberPhone}
                  onChange={handleProfileDataChange}
                  className={styles.edit_input}
                  placeholder="전화번호"
                />
                <div className={styles.edit_btn_group}>
                  <button
                    onClick={handleProfileSubmit}
                    className={styles.save_btn}
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setPreviewImg(managerInfo?.memberThumb);
                      setProfileData({
                        memberName: managerInfo?.memberName || "",
                        memberPhone: managerInfo?.memberPhone || "",
                      });
                    }}
                    className={styles.cancel_btn}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className={styles.dashboard_name}>
                  {managerInfo?.memberName} 님
                </p>
                <p className={styles.dashboard_phoneNumber}>
                  {managerInfo?.memberPhone}
                </p>
              </div>
            )}
          </div>
        </div>

        {!isEditingProfile && (
          <div
            className={styles.set_icon}
            onClick={() => setIsEditingProfile(true)}
            style={{ cursor: "pointer" }}
          >
            <BorderColorIcon />
          </div>
        )}
      </section>

      <section className={styles.mini_box}>
        {/* 비밀번호 변경 칸 (기존 유지) */}
        <div className={styles.Wrapper}>
          <div className={styles.pwSet} onClick={togglePwSet}>
            <p>비밀번호 변경</p>
            <div className={styles.pw_icon}>
              {openPwSet ? <KeyboardArrowDownIcon /> : <ArrowForwardIosIcon />}
            </div>
          </div>
          <Collapse in={openPwSet} timeout="auto" unmountOnExit>
            <div className={styles.pw_content_box}>
              <div className={styles.pw_form_container}>
                {/* 현재 비밀번호 */}
                <div className={styles.pw_input_row}>
                  <label>현재 비밀번호</label>
                  <div className={styles.input_wrapper}>
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      name="currentPw"
                      value={pwData.currentPw}
                      onChange={handlePwChange}
                      placeholder="현재 비밀번호 입력"
                    />
                    <div
                      className={styles.eye_icon}
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                    >
                      {showCurrentPw ? <Visibility /> : <VisibilityOff />}
                    </div>
                  </div>
                </div>
                {/* 새 비밀번호 */}
                <div className={styles.pw_input_row}>
                  <label>새 비밀번호</label>
                  <div className={styles.input_wrapper}>
                    <input
                      type={showNewPw ? "text" : "password"}
                      name="newPw"
                      value={pwData.newPw}
                      onChange={handlePwChange}
                      placeholder="새 비밀번호 입력"
                    />
                    <div
                      className={styles.eye_icon}
                      onClick={() => setShowNewPw(!showNewPw)}
                    >
                      {showNewPw ? <Visibility /> : <VisibilityOff />}
                    </div>
                  </div>
                </div>
                {/* 새 비밀번호 확인 */}
                <div className={styles.pw_input_row}>
                  <label>새 비밀번호 확인</label>
                  <div className={styles.input_wrapper}>
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      name="confirmPw"
                      value={pwData.confirmPw}
                      onChange={handlePwChange}
                      placeholder="새 비밀번호 재입력"
                    />
                    <div
                      className={styles.eye_icon}
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                    >
                      {showConfirmPw ? <Visibility /> : <VisibilityOff />}
                    </div>
                  </div>
                </div>
                <div className={styles.pw_input_row}>
                  <label></label>
                  <button className={styles.submit_btn}>변경하기</button>
                </div>
              </div>
            </div>
          </Collapse>
        </div>
      </section>

      <div className={styles.deleteSet}>
        <div className={styles.delete_btn} onClick={handleDeleteClick}>
          <span className={styles.text_hover}>정말 탈퇴하시겠어요? 😢</span>
          <span className={styles.text_default}>회원 탈퇴</span>
        </div>
      </div>
    </div>
  );
}
