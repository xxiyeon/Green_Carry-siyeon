import styles from "./ManagerCS.module.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import Swal from "sweetalert2";
//icon
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import axios from "axios";
import StarsIcon from "@mui/icons-material/Stars";
import { withButtonLoading } from "../../../utils/buttonLoading";

const ManagerCS = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("faq"); // 기본: faq활성화

  const [searchKeyword, setSearchKeyword] = useState("");
  return (
    <section className={styles.cs_container}>
      <div className={styles.top_section}>
        <div className={styles.title_wrap}>
          <h3 className={styles.title}>고객센터</h3>
          <p className={styles.title_sub}>
            <span className={styles.user_name}>{user?.memberName}</span> 님,
            무엇을 도와드릴까요?
          </p>
        </div>
        {/*검색바 */}
        <div className={styles.search_bar}>
          <input
            type="text"
            className={styles.search_input}
            placeholder="자주 묻는 질문을 검색해보세요."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
            }}
          />
          <span className={styles.search_icon}>
            <SearchIcon />
          </span>
        </div>
        {/*탭 버튼 영역 */}
        <div className={styles.tabs_nav}>
          <div className={styles.tabs_nav_faq}>
            <button
              className={`${styles.tab_item} ${
                activeTab === "faq" ? styles.active : ""
              }`}
              onClick={() => {
                setActiveTab("faq");
              }}
            >
              자주 묻는 질문
            </button>
          </div>
          <div className={styles.tabs_nav_qna}>
            <button
              className={`${styles.tab_item} ${
                activeTab === "qna" ? styles.active : ""
              }`}
              onClick={() => {
                setActiveTab("qna");
              }}
            >
              1 : 1 문의하기
            </button>
          </div>
          <div className={styles.tabs_nav_answer}>
            <button
              className={`${styles.tab_item} ${
                activeTab === "answer" ? styles.active : ""
              }`}
              onClick={() => {
                setActiveTab("answer");
              }}
            >
              1 : 1 문의내역
            </button>
          </div>
        </div>
      </div>
      {/*컨텐츠 랜더링영역 */}
      <div className={styles.content_area}>
        {activeTab === "faq" ? (
          <FAQSection
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
          />
        ) : activeTab === "qna" ? (
          <QnASection
            setSearchKeyword={setSearchKeyword}
            user={user}
            setActiveTab={setActiveTab}
          />
        ) : (
          <AnswerSection user={user} setSearchKeyword={setSearchKeyword} />
        )}
      </div>
    </section>
  );
};

const FAQSection = ({ searchKeyword, setSearchKeyword }) => {
  //0:전체조회, 1:결제, 2:배달, 3:에코포인트, 4:서비스이용
  const categories = [
    { id: 0, label: "전체" },
    { id: 1, label: "주문 및 취소" },
    { id: 2, label: "배달" },
    { id: 3, label: "에코 포인트" },
    { id: 4, label: "서비스 이용" },
  ];
  const [status, setStatus] = useState(0); // 0:전체조회, 1:주문 및 취소, 2:배달, 3:에코포인트, 4:서비스이용
  const [faqList, setFaqList] = useState([]); // 받아올 리스트
  const [openIndex, setOpenIndex] = useState(null); //아코디언 상태 (null : 모두 닫힘)

  const indexToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  //자주묻는질문
  useEffect(() => {
    setOpenIndex(null);
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/cs/inquiries/faq/manager`, {
        params: {
          faqCategory: status,
          searchKeyword: searchKeyword,
        },
      })
      .then((res) => {
        setFaqList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [status, searchKeyword]);
  return (
    <div className={styles.faq_wrap}>
      <div className={styles.category_group}>
        {categories.map((cat) => {
          return (
            <button
              key={`key:${cat.id}`}
              className={`${styles.cat_btn} ${
                status === cat.id ? styles.cat_active : ""
              }`}
              onClick={() => {
                setStatus(cat.id);
                //setSearchKeyword("");
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className={styles.faq_list}>
        {/* 반복될 질문 아이템 (실제로는 데이터를 map 돌리면 됩니다) */}
        {faqList.length > 0 ? (
          faqList.map((item, i) => (
            <details
              key={item.faqNo} // 출력시 키값 pk사용
              className={styles.faq_item}
              open={openIndex === i}
            >
              <summary
                className={styles.faq_header}
                onClick={(e) => {
                  e.preventDefault();
                  indexToggle(i);
                }}
              >
                <span className={styles.q_no}>{<StarsIcon />}</span>
                <span className={styles.q_text}>{item.faqTitle}</span>
                <span className={styles.arrow}>
                  <KeyboardArrowDownIcon />
                </span>
              </summary>
              <div className={styles.faq_answer}>{item.faqContent}</div>
            </details>
          ))
        ) : (
          <div className={styles.no_result}>
            <p>
              🔍 현재 카테고리에 '{searchKeyword}'에 대한 검색 결과가 없습니다.
            </p>
            <span>다른 검색어를 입력하시거나 카테고리를 변경해 보세요.</span>
          </div>
        )}
      </div>
    </div>
  );
};
//1:1문의하기
const QnASection = ({ setSearchKeyword, user, setActiveTab }) => {
  useEffect(() => {
    setSearchKeyword("");
  }, [setSearchKeyword]);

  //입력: 제목, 내용 ( 답변상태: 0 ))
  const [inquiry, setInquiry] = useState({
    memberId: user.memberId,
    qnaTitle: "",
    qnaContent: "",
  });

  const handleChange = (e) => {
    const maxLength = {
      qnaTitle: 20,
      qnaContent: 300,
    };

    const { name, value } = e.target;
    if (value.length > maxLength[name]) {
      Swal.fire({
        icon: "warning",
        title: "글자 수 초과",
        text: `${name === "qnaTitle" ? "제목" : "내용"}은 최대 ${maxLength[name]}자까지 입력 가능합니다.`,
        confirmButtonColor: "var(--color-brand)",
        confirmButtonText: "확인",
      });

      setInquiry({ ...inquiry, [name]: value.slice(0, maxLength[name]) });
      return;
    }
    setInquiry({ ...inquiry, [name]: value });
  };
  //1:1문의하기 > 등록
  const insertQna = withButtonLoading(async () => {
    if (!ValidateInquiry(inquiry.qnaTitle, inquiry.qnaContent)) {
      return;
    }
    return axios
      .post(`${import.meta.env.VITE_BACKSERVER}/cs/inquiries/submit`, inquiry)
      .then((res) => {
        console.log(res);
        console.log(inquiry);
        Swal.fire({
          icon: "success",
          title: "등록 완료",
          text: "문의가 정상적으로 등록되었습니다.",
          confirmButtonColor: "var(--color-brand)",
          confirmButtonText: "확인",
          timer: 1500, // 2000ms = 2초 후 자동으로 닫힘
          timerProgressBar: true,
        });

        setActiveTab("answer");
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          title: "등록 실패",
          text: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          confirmButtonColor: "var(--color-brand)",
          confirmButtonText: "확인",
        });
      });
  });
  return (
    <div className={styles.qna_wrap}>
      <div className={styles.qna_guide}>
        <h4 className={styles.qna_title}>1 : 1 문의하기</h4>
        <p className={styles.qna_desc}>
          "GreenCarry 서비스 이용 중 불편한 점이 있으신가요?
          <br /> 고객님의 소중한 의견을 1:1 문의로 남겨주시면 빠르게
          도와드릴게요."
        </p>
      </div>
      <div className={styles.qna_form}>
        <div className={styles.input_group}>
          <label>문의 제목</label>
          <input
            type="text"
            name="qnaTitle"
            className={styles.form_input}
            placeholder="제목을 입력해주세요."
            value={inquiry.qnaTitle}
            onChange={handleChange}
          />
        </div>
        <div className={styles.input_group}>
          <label>문의 내용</label>
          <textarea
            type="textarea"
            name="qnaContent"
            className={styles.form_textarea}
            placeholder="내용을 입력해주세요."
            value={inquiry.qnaContent}
            onChange={handleChange}
            maxLength={300}
          ></textarea>

          <div className={styles.char_count_wrapper}>
            <span
              className={`${styles.char_count} ${inquiry.qnaContent.length >= 300 ? styles.limit_reached : ""}`}
            >
              {inquiry.qnaContent.length} / 300자
            </span>
          </div>
        </div>
        <button type="button" className={styles.submit_btn} onClick={insertQna}>
          문의 등록
        </button>
      </div>
    </div>
  );
};
//1:1문의내역
const AnswerSection = ({ user, setSearchKeyword }) => {
  useEffect(() => {
    setSearchKeyword("");
  }, [setSearchKeyword]);

  const [inquiryList, setInquiryList] = useState([]);
  const [openIndex, setOpenIndex] = useState(null); //아코디언 상태 (null : 모두 닫힘)
  const indexToggle = (index) => {
    if (editingNo !== null) {
      Swal.fire({
        icon: "warning",
        text: "수정 중인 내용을 먼저 저장하거나 취소해주세요.",
        confirmButtonColor: "var(--color-brand)",
        confirmButtonText: "확인",
      });
      return;
    }
    setOpenIndex(openIndex === index ? null : index);
  };
  //글자수제한
  const handleChange = (e) => {
    const maxLength = {
      qnaTitle: 20,
      qnaContent: 300,
    };

    const { name, value } = e.target;
    if (value.length >= maxLength[name]) {
      if (value.length === maxLength[name]) {
        Swal.fire({
          icon: "warning",
          title: "글자 수 초과",
          text: `${name === "qnaTitle" ? "제목" : "내용"}은 최대 ${maxLength[name]}자까지 입력 가능합니다.`,
          confirmButtonColor: "var(--color-brand)",
          confirmButtonText: "확인",
        });
      }
      setUpdateData({ ...updateData, [name]: value.slice(0, maxLength[name]) });
      return;
    }
    setUpdateData({ ...updateData, [name]: value });
  };
  const [answerStatus, setAnswerStatus] = useState(0); // 0: 답변대기중, 1:답변완료

  //현재 수정중인 qnaNo 저장용
  const [editingNo, setEditingNo] = useState(null);

  //수정내용 임시저장용
  const [updateData, setUpdateData] = useState({
    qnaTitle: "",
    qnaContent: "",
  });

  //수정취소
  const cancelEdit = () => {
    setEditingNo(null);
    setUpdateData({
      qnaTitle: "",
      qnaContent: "",
    });
  };

  //1:1문의내역 > 삭제
  const deleteInquiry = withButtonLoading(async (_event, qnaNo) => {
    return Swal.fire({
      title: "정말 삭제하시겠습니까?",
      text: "삭제된 문의는 복구할 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#aaa",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        if (answerStatus === 0) {
          axios
            .delete(`${import.meta.env.VITE_BACKSERVER}/cs/inquiries/delete`, {
              params: { qnaNo: qnaNo },
            })
            .then((res) => {
              console.log(res);
              Swal.fire({
                icon: "success",
                title: "삭제 완료",
                text: "문의가 정상적으로 삭제되었습니다.",
                confirmButtonColor: "var(--color-brand)",
                confirmButtonText: "확인",
              });
              setOpenIndex(null);
              fetchInquiryList();
            })
            .catch((err) => {
              console.log(err);
              Swal.fire({
                icon: "error",
                title: "등록 실패",
                text: "삭제 중 오류가 발생했습니다. 고객센터에 문의 하세요.",
                confirmButtonColor: "var(--color-brand)",
                confirmButtonText: "확인",
              });
            });
        }
      }
    });
  });

  ////1:1문의내역 > 수정
  const updateInquiry = withButtonLoading(async (_event, item, index) => {
    if (answerStatus === 0) {
      if (!ValidateInquiry(updateData.qnaTitle, updateData.qnaContent)) {
        return;
      }
      if (
        updateData.qnaTitle === item.qnaTitle &&
        updateData.qnaContent === item.qnaContent
      ) {
        Swal.fire({
          icon: "info",
          text: "수정된 내용이 없습니다.",
          confirmButtonColor: "var(--color-brand)",
          confirmButtonText: "확인",
        });
        return;
      } else {
        const dataSend = {
          qnaNo: item.qnaNo,
          qnaTitle: updateData.qnaTitle || item.qnaTitle,
          qnaContent: updateData.qnaContent || item.qnaContent,
        };
        return axios
          .put(
            `${import.meta.env.VITE_BACKSERVER}/cs/inquiries/update`,
            dataSend,
          )
          .then((res) => {
            console.log(res);
            Swal.fire({
              icon: "success",
              title: "수정 완료",
              text: "문의가 정상적으로 수정되었습니다.",
              confirmButtonColor: "var(--color-brand)",
              confirmButtonText: "확인",
              timer: 1500, // 2000ms = 2초 후 자동으로 닫힘
              timerProgressBar: true,
            });
            setEditingNo(null); //수정중인 문의번호 삭제 > 인풋이 다시 텍스트로바뀌게
            setOpenIndex(index);
            fetchInquiryList();
          })
          .catch((err) => {
            console.log(err);
            Swal.fire({
              icon: "error",
              title: "수정 실패",
              text: "수정 중 오류가 발생했습니다. 고객센터에 문의 하세요.",
              confirmButtonColor: "var(--color-brand)",
              confirmButtonText: "확인",
            });
          });
      }
    }
  });

  //수정 및 삭제 후 리스트 출력 분리
  const fetchInquiryList = () => {
    if (!user || !user.memberId) return;
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/cs/inquiries/list`, {
        params: { memberId: user.memberId },
      })
      .then((res) => {
        setInquiryList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchInquiryList();
  }, [user?.memberId]);

  return (
    <div className={styles.answer_wrap}>
      <h4 className={styles.answer_title}>1 : 1 문의내역</h4>
      <p className={styles.answer_desc}>
        * 최근 3개월 이내의 문의내역만 확인 가능합니다.
      </p>
      <div className={styles.inquiry_list}>
        {inquiryList.length > 0 ? (
          inquiryList.map((item, i) => (
            <details
              key={item.qnaNo}
              className={styles.inquiry_item_details}
              open={openIndex === i}
            >
              <summary
                className={`${styles.faq_header} ${
                  editingNo !== null && editingNo !== item.qnaNo
                    ? styles.disabled
                    : ""
                }`}
                onClick={(e) => {
                  e.preventDefault(); // 브라우저 기본 토글 동작 중지

                  // 1. 현재 이 항목(item)이 '수정 중'인 상태라면?
                  if (editingNo === item.qnaNo) {
                    // 닫히지 않도록 그냥 리턴 (이미 열려있는 상태 유지)
                    return;
                  }

                  // 2. 내가 아닌 '다른 항목'이 수정 중인데, 이 항목을 클릭했다면?
                  if (editingNo !== null) {
                    Swal.fire({
                      icon: "warning",
                      text: "수정 중인 내용을 먼저 저장하거나 취소해주세요.",
                      confirmButtonColor: "var(--color-brand)",
                      confirmButtonText: "확인",
                    });

                    return; // indexToggle(i)가 실행되지 않도록 여기서 끊어줌
                  }

                  // 3. 아무것도 수정 중이 아닐 때만 정상적으로 토글 실행
                  indexToggle(i);
                }}
              >
                <div className={styles.inquiry_info}>
                  {editingNo === item.qnaNo ? (
                    <input
                      type="text"
                      name="qnaTitle"
                      className={styles.edit_update_title}
                      value={updateData.qnaTitle}
                      onChange={handleChange}
                    />
                  ) : (
                    <>
                      {/*답변상태 뱃지 */}
                      <div className={styles.badge_wrap}>
                        {item.qnaAnswer ? (
                          <span
                            className={`${styles.badge} ${styles.status_complete}`}
                          >
                            답변완료
                          </span>
                        ) : (
                          <span
                            className={`${styles.badge} ${styles.status_waiting}`}
                          >
                            답변대기
                          </span>
                        )}
                      </div>
                      <p className={styles.inquiry_subject}>{item.qnaTitle}</p>
                    </>
                  )}

                  <p className={styles.inquiry_preview_one_line}>
                    {item.qnaContent}
                  </p>
                </div>
                <div className={styles.inquiry_meta}>
                  <span className={styles.inquiry_date}>{item.qnaDate}</span>
                  <span className={styles.arrow}>
                    <KeyboardArrowDownIcon />
                  </span>
                </div>
              </summary>

              <div className={styles.faq_answer}>
                {/*답변이 없을때만 수정 및 삭제 버튼 표시 */}
                {!item.qnaAnswer && (
                  <div className={styles.action_buttons}>
                    {editingNo === item.qnaNo ? (
                      <>
                        <button
                          className={styles.edit_btn}
                          onClick={(e) => {
                            updateInquiry(e, item, i);
                          }}
                        >
                          저장
                        </button>
                        <button
                          className={styles.delete_btn}
                          onClick={() => {
                            cancelEdit();
                          }}
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={styles.edit_btn}
                          onClick={() => {
                            setEditingNo(item.qnaNo);
                            setUpdateData({
                              qnaTitle: item.qnaTitle,
                              qnaContent: item.qnaContent,
                            });
                          }}
                        >
                          수정
                        </button>
                        <button
                          className={styles.delete_btn}
                          onClick={(e) => {
                            deleteInquiry(e, item.qnaNo);
                          }}
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className={styles.qna_content_box}>
                  <p className={styles.answer_label}>[문의 내용]</p>

                  {editingNo === item.qnaNo ? (
                    <>
                      <textarea
                        type="text"
                        className={styles.edit_update_textarea}
                        name="qnaContent"
                        value={updateData.qnaContent}
                        onChange={handleChange}
                      />
                      <div className={styles.char_count_wrapper}>
                        <span
                          className={`${styles.char_count} ${updateData.qnaContent.length >= 300 ? styles.limit_reached : ""}`}
                        >
                          {updateData.qnaContent.length} / 300자
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className={styles.content_text}>{item.qnaContent}</div>
                  )}
                </div>

                {/* 2. 구분선 (HR 태그 또는 CSS 처리) */}
                <hr className={styles.qna_divider} />

                {/* 3. 문의 답변 영역 */}
                <div className={styles.qna_answer_box}>
                  <p className={styles.answer_label}>[문의 답변]</p>
                  {item.qnaAnswer ? (
                    <div className={styles.answer_text}>{item.qnaAnswer}</div>
                  ) : (
                    <div className={styles.waiting_text}>
                      관리자의 답변을 기다리고 있습니다.
                    </div>
                  )}
                </div>
              </div>
            </details>
          ))
        ) : (
          <div className={styles.empty_list}>
            3개월 이내에 문의하신 내역이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

//문의 제목, 내용 유효성검사 (등록 및 수정 시 사용)
const ValidateInquiry = (title, content) => {
  if (!title?.trim() || !content?.trim()) {
    Swal.fire({
      icon: "error",
      title: "입력 오류",
      text: "제목과 내용을 모두 입력해주세요.",
      confirmButtonColor: "var(--color-brand)",
      confirmButtonText: "확인",
    });
    return false;
  }
  if (title.length > 20) {
    Swal.fire({
      icon: "error",
      title: "입력 오류",
      text: "제목이 20자를 초과했습니다. 내용을 줄여주세요.",
      confirmButtonColor: "var(--color-brand)",
      confirmButtonText: "확인",
    });
    return false;
  }
  if (content.length > 300) {
    Swal.fire({
      icon: "error",
      title: "입력 오류",
      text: "내용이 300자를 초과했습니다. 내용을 줄여주세요.",
      confirmButtonColor: "var(--color-brand)",
      confirmButtonText: "확인",
    });
    return false;
  }
  return true;
};
export default ManagerCS;
