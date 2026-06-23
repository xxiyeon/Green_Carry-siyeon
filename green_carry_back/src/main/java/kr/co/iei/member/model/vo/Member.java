
package kr.co.iei.member.model.vo; // 본인 프로젝트의 패키지 경로로 수정하세요!

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Alias(value = "member")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {
	private Boolean autoLogin;

	// 1. 기본 회원 정보
	private String memberId; // MEMBER_ID (VARCHAR2) : 회원 아이디
	private String memberPw; // MEMBER_PW (CHAR) : 비밀번호
	private String memberName; // MEMBER_NAME (VARCHAR2) : 회원 이름
	private String memberPhone; // MEMBER_PHONE (VARCHAR2) : 전화번호
	private String memberThumb; // MEMBER_THUMB (VARCHAR2) : 프로필 썸네일 이미지 경로
	private String memberEmail; // MEMBER_EMAIL (VARCHAR2) : 이메일

	// 2. 주소 정보
	private String memberAddrcode; // MEMBER_ADDRCODE (VARCHAR2) : 우편번호
	private String memberAddr; // MEMBER_ADDR (VARCHAR2) : 도로명/지번 주소
	private String memberDetailAddr; // MEMBER_DETAIL_ADDR (VARCHAR2) : 상세주소

	// 3. 회원 상태 및 등급 정보
	private Integer memberGrade; // MEMBER_GRADE (NUMBER) : 0:관리자, 1:일반회원, 2:사업자
	private Integer memberPoint; // MEMBER_POINT (NUMBER) : 보유 포인트
	private Integer memberStatus; // MEMBER_STATUS (NUMBER) : 1:활동중, 2:정지, 3:탈퇴
	private String enrollDate; // ENROLL_DATE (DATE) : 가입일 (화면 출력을 위해 String으로 받음)
	private Double totalCarbonReduce;
	// 4. 사업자 전용 정보 (MEMBER_GRADE가 2인 경우 사용)
	/*
	private String storeOwnerNo; // STORE_OWNER_NO (NUMBER) : 사업자 등록 번호 (10자리 숫자이므로 Long 사용)
	private String storeName; // STORE_NAME (VARCHAR2) : 가게 이름
	private String openingDate; // OPENING_DATE (DATE) : 개업일 (화면 출력을 위해 String으로 받음)
	*/
	private Integer storeId;
	// 위 경도 저장
	private Double latitude;
	private Double longitude;
}
