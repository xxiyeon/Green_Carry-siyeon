import { create } from "zustand";

const useAccountStore = create((set) => ({
  // 1.  상태 (State) 모음
  activeTab: "findId",
  isCodeSent: false,
  isVerified: false,
  inputCode: "",
  timeLeft: 180,
  isTimerActive: false,
  formData: { memberName: "", memberEmail: "", memberId: "" },
  newPassword: "",
  confirmPassword: "",
  pwError: "",
  matchError: "",

  // 2.  상태를 변경하는 기본 함수들 (Setter)
  setIsCodeSent: (status) => set({ isCodeSent: status }),
  setIsVerified: (status) => set({ isVerified: status }),
  setInputCode: (code) => set({ inputCode: code }),
  setTimeLeft: (timeUpdater) =>
    set((state) => ({
      timeLeft:
        typeof timeUpdater === "function"
          ? timeUpdater(state.timeLeft)
          : timeUpdater,
    })),
  setIsTimerActive: (status) => set({ isTimerActive: status }),

  // 3.  복잡한 비즈니스 로직 함수들
  // 입력칸 글자 변경 로직
  handleInputChange: (e) =>
    set((state) => ({
      formData: { ...state.formData, [e.target.name]: e.target.value },
    })),

  // 탭 변경 시 모든 상태 초기화 로직
  handleTabChange: (tab) =>
    set({
      activeTab: tab,
      isCodeSent: false,
      isVerified: false,
      isTimerActive: false,
      timeLeft: 180,
      inputCode: "",
      newPassword: "",
      confirmPassword: "",
      pwError: "",
      matchError: "",
      formData: { memberName: "", memberEmail: "", memberId: "" },
    }),

  // 새 비밀번호 유효성 검사 로직
  handlePwChange: (val) =>
    set((state) => {
      const pwRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
      const pwError =
        val && !pwRegex.test(val)
          ? "대/소문자, 숫자, 특수문자 포함 10자 이상이어야 합니다."
          : "";
      const matchError =
        state.confirmPassword && val !== state.confirmPassword
          ? "비밀번호가 일치하지 않습니다."
          : "";
      return { newPassword: val, pwError, matchError };
    }),

  // 새 비밀번호 확인 로직
  handleConfirmPwChange: (val) =>
    set((state) => {
      const matchError =
        state.newPassword !== val ? "비밀번호가 일치하지 않습니다." : "";
      return { confirmPassword: val, matchError };
    }),
}));

export default useAccountStore;
