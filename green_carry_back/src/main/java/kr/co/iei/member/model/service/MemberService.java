package kr.co.iei.member.model.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import kr.co.iei.member.model.dao.MemberDao;
import kr.co.iei.member.model.vo.Member;
import kr.co.iei.member.model.vo.PointHistory;
import kr.co.iei.member.model.vo.Review;
import kr.co.iei.store.model.dao.StoreDao;
import kr.co.iei.utils.EmailSender;

@Service
public class MemberService {

	@Autowired
	private Cloudinary cloudinary;
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	@Autowired
	private MemberDao memberDao;

	@Autowired
	private EmailSender emailSender;

	@Autowired
	private StoreDao storeDao;

	public Member loginMember(Member member) {
		// 1. 아이디 + 등급으로 DB 조회
		Member dbMember = memberDao.loginMember(member);

		if (dbMember != null) {
			// 2. 비밀번호 비교 (공백 제거 필수!)
			String dbPw = dbMember.getMemberPw().trim();

			if (passwordEncoder.matches(member.getMemberPw(), dbPw)) {
				// ✨ 로그인 성공 시: 비번은 보안상 비우고 객체 자체를 리턴
				dbMember.setMemberPw(null);
				return dbMember;
			} else {
				System.out.println("비밀번호 불일치");
			}
		} else {
			System.out.println("회원 정보 없음 (ID 또는 Grade 불일치)");
		}

		// ✨ 로그인 실패 시: null 리턴
		return null;
	}

	// 아이디 찾기 로직
	public String findId(Member member) {
		return memberDao.findId(member);
	}

	@Transactional
	public int resetPw(Member member) {

		// 1. DB에서 현재 회원의 정보(암호화된 기존 비밀번호)를 먼저 불러옵니다.
		// 🚨 주의: 아이디로 회원 1명을 조회하는 메서드명(예: selectOneMember)을
		// 본인 DAO에 만들어져 있는 이름으로 맞춰주세요!
		Member existingMember = memberDao.selectOneMember(member.getMemberId());

		// 2. 기존 회원이 존재한다면, 새 비밀번호와 기존 비밀번호를 비교합니다.
		if (existingMember != null) {
			// member.getMemberPw() : 방금 입력한 새 비밀번호 (평문)
			// existingMember.getMemberPw() : DB에 있던 예전 비밀번호 (암호문)
			if (passwordEncoder.matches(member.getMemberPw(), existingMember.getMemberPw())) {
				return -1; //  똑같으면 업데이트를 멈추고 -1을 반환! (이게 컨트롤러로 갑니다)
			}
		}

		// 3. 기존 비밀번호와 다를 경우에만! 새 비밀번호를 암호화합니다.
		String encodedPassword = passwordEncoder.encode(member.getMemberPw());
		member.setMemberPw(encodedPassword);

		// 4. 암호화된 비밀번호로 DB 업데이트 진행
		return memberDao.resetPassword(member);
	}

	public int checkMember(Member member) {
		int result = memberDao.checkMember(member);
		return result;
	}

	// 이메일 인증번호 저장을 위한 간단한 맵 (실무에선 Redis 추천)
	private Map<String, String> authCodeMap = new HashMap<>();

	public String sendAuthCode(String email) {
		// 1. 6자리 랜덤 인증번호 생성
		Random r = new Random();
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < 6; i++) {
			sb.append(r.nextInt(10));
		}
		String authCode = sb.toString();
		authCodeMap.put(email, authCode);

		// 2. 이메일 내용 작성
		String title = "[GreenCarry] 계정 확인을 위한 인증번호입니다.";
		String content = "<h1>안녕하세요, GreenCarry입니다.</h1>" + "<p>요청하신 인증번호는 <b>" + authCode + "</b> 입니다.</p>"
				+ "<p>인증번호를 입력창에 정확히 기입해주세요.</p>";

		// 3. 메일 발송
		emailSender.sendMail(title, email, content);

		System.out.println("인증번호 : " + authCode);
		return authCode; // 테스트를 위해 리턴하거나 메모리에 저장
	}

	//  [추가] 컨트롤러에서 호출하는 검증 메서드 구현
	public boolean checkAuthCode(String email, String inputCode) {
		// 1. 해당 이메일로 발송된 번호가 있는지 확인
		String savedCode = authCodeMap.get(email);
		System.out.println("메모리에 저장된 코드: " + savedCode);

		// 2. 저장된 번호가 있고, 사용자가 입력한 번호와 일치하면 true 반환
		if (savedCode != null && savedCode.equals(inputCode)) {
			// 인증 성공 시 보안을 위해 맵에서 삭제 (1회용)
			authCodeMap.remove(email);
			return true;
		}

		return false;
	}

	public Member selectOneMember(String memberId) {
		Member member = memberDao.selectOneMember(memberId);
		return member;
	}

	@Transactional
	public boolean updatePassword(String memberId, String currentPw, String newPw) {
		// 1. DB에서 현재 암호화된 비밀번호 조회 (기존에 만들어둔 selectOneMember 활용)
		Member member = memberDao.selectOneMember(memberId);

		// 2. 현재 비밀번호 일치 확인 (BCryptPasswordEncoder 사용)
		if (!passwordEncoder.matches(currentPw, member.getMemberPw())) {
			throw new IllegalArgumentException("CURRENT_PASSWORD_MISMATCH");
		}

		// 3. 새 비밀번호 암호화
		String encodedNewPw = passwordEncoder.encode(newPw);

		// 4. DAO를 통해 업데이트 실행
		int result = memberDao.updatePassword(memberId, encodedNewPw);

		return result > 0;
	}

	public List<Member> getMembers() {
		return memberDao.selectAllMember();
	}

	// 개인정보 수정
	@Transactional
	public int updateProfile(Member member) {
		int result = memberDao.updateProfile(member);

		if (member.getMemberGrade() == 2) {
			result = memberDao.updateStoreOwner(member);
		}
		return result;

	}

	@Transactional
	public int insertUser(Member member) {
		String rawPw = member.getMemberPw();

		String encPw = passwordEncoder.encode(rawPw);

		member.setMemberPw(encPw);

		int result = memberDao.insertUser(member);
		return result;
	}

	@Transactional
	public int insertManager(Map<String, Object> data) {
		// 1. 비밀번호 암호화 (Map에서 꺼내서 다시 덮어쓰기)
		String memberPw = (String) data.get("memberPw");
		String encPw = passwordEncoder.encode(memberPw);
		data.put("memberPw", encPw); // 암호화된 비번으로 교체

		// 2. 회원 테이블(member_tbl) insert
		// 주의: mapper에서 #{memberId}, #{memberPw} 등 key값으로 매칭됩니다.
		int memberResult = memberDao.insertManager(data);

		// 3. 매장 테이블(store_tbl) insert
		// 리액트에서 보낸 storeName, storeOwner가 data에 들어있음!
		int storeResult = storeDao.insertStore(data);

		// 4. 둘 다 성공해야 가입 성공(1) 아니면 실패(0)
		// 한 곳이라도 에러 나면 @Transactional 덕분에 전체 롤백됩니다.
		return (memberResult > 0 && storeResult > 0) ? 1 : 0;
	}

	public Member storeDupCheck(String storeOwnerNo) {
		Member member = memberDao.storeDupCheck(storeOwnerNo);
		return member;
	}

	public Member emailDupCheck(String memberEmail) {
		Member member = memberDao.emailDupCheck(memberEmail);
		return member;
	}

	@Transactional

	public void deleteMember(String memberId, String rawPassword) {
		// DB에서 내 정보 찾기
		Member member = memberDao.selectOneMember(memberId);

		if (member == null) {
			throw new IllegalArgumentException("존재하지 않는 회원입니다.");
		}

		if (!passwordEncoder.matches(rawPassword, member.getMemberPw())) {
			throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
		}
		memberDao.deleteMember(memberId);
	}

	public Member getTotalCarbonPoint(String memberId) {
		return memberDao.getTotalCarbonPoint(memberId);
	}

	public Double getCommunityTotalCarbon() {
		return memberDao.getCommunityTotalCarbon();
	}

	public int updateAddress(Member member) {
		return memberDao.updateAddress(member);
	}

	@Transactional
	public void insertReview(Review review, MultipartFile uploadFile) {
		// 1. 보안 검증: 본인의 주문 내역인지 확인
		int isOwner = memberDao.checkOrderOwner(review.getOrderId(), review.getMemberId());
		if (isOwner == 0) {
			throw new RuntimeException("본인의 주문 내역에만 리뷰를 작성할 수 있습니다.");
		}

		// 2. 중복 검증: 이미 리뷰를 작성한 주문인지 확인
		int hasReview = memberDao.isAlreadyReviewed(review.getOrderId());
		if (hasReview > 0) {
			throw new RuntimeException("이미 리뷰를 작성한 주문입니다.");
		}

		//  3. Cloudinary 파일 업로드 처리
		if (uploadFile != null && !uploadFile.isEmpty()) {
			try {
				// Cloudinary 업로드 설정 (리뷰 폴더 경로 지정)
				Map uploadParams = ObjectUtils.asMap("folder", "projet/upload/web/review", "use_filename", true,
						"unique_filename", true);

				// Cloudinary로 업로드 실행
				Map uploadResult = cloudinary.uploader().upload(uploadFile.getBytes(), uploadParams);

				// 업로드된 결과에서 전체 보안 URL(https) 추출
				String reviewThumbUrl = (String) uploadResult.get("secure_url");

				// DB에 저장할 경로 세팅 (이제 전체 URL이 저장됩니다)
				review.setReviewThumb(reviewThumbUrl);

			} catch (IOException e) {
				e.printStackTrace();
				throw new RuntimeException("리뷰 사진 업로드 중 서버 오류가 발생했습니다.");
			}
		}

		// 4. 리뷰 DB 저장
		int result = memberDao.insertReview(review);

		if (result > 0) {
			// 리뷰 상태 업데이트 (이미 작성됨 처리)
			memberDao.updateReviewStatus(review.getOrderId());

			// (선택) 에코 포인트 지급 로직이 있다면 여기서 실행
			// memberDao.addEcoPoint(review.getMemberId(), 100);
		} else {
			throw new RuntimeException("리뷰 등록에 실패했습니다.");
		}
	}

	public List<Review> selectReviewList(String memberId) {
		List<Review> list = memberDao.selectReviewList(memberId);
		return list;
	}

	@Transactional
	public boolean deleteReview(int orderId) {
		// 1. 사장님 답글이 있다면 먼저 삭제 (외래키 제약조건 방지)
		// memberDao.deleteReviewComment(orderId);

		// 2. 리뷰 본문 삭제
		int result = memberDao.deleteReview(orderId);

		return result > 0;
	}

	public int checkActiveOrder(String memberId) {
		return memberDao.checkActiveOrder(memberId);
	}

	public List<PointHistory> selectPointHistory(String memberId) {
		return memberDao.selectPointHistory(memberId);
	}

	public String getEnrollDate(String memberId) {
		return memberDao.getEnrollDate(memberId);
	}

	public int getPointByMemberId(String memberId) {
		int currentPoint = memberDao.getPointByMemberId(memberId);
		return currentPoint;
	}
	
	@Transactional
	public int EasterEgg(String memberId, String eggName) {
	    // 1. 중복 체크 (DAO 호출)
	    int alreadyFound = memberDao.checkEasterEgg(memberId, eggName);
	    if (alreadyFound > 0) {
	        throw new IllegalStateException("이미 획득한 보상입니다.");
	    }

	    // 2. 이스터에그 보상 설정 ( 확장성 있게 switch 문으로 변경)
	    int reward = 0;
	    switch (eggName) {
	        case "NIGHT_COUPON":
	            reward = 2000; 
	            break;
	        case "DRONE_SUPPLY":
	            reward = 1000; 
	            break;
	        case "CLEAN_EARTH": 
	            reward = 2500;
	            break;
	        default:
	            throw new IllegalArgumentException("존재하지 않는 이벤트 코드입니다: " + eggName);
	    }

	    // 3. 포인트 증액 & 이력 저장 (DAO 호출)
	    memberDao.addMemberPoint(memberId, reward);
	    memberDao.insertEasterEgg(memberId, eggName, reward);

	    // 4. 최종 포인트 반환 (기존 getPointByMemberId 활용)
	    //  이 리턴값이 컨트롤러를 타고 프론트의 로컬스토리지까지 갱신할 겁니다.
	    return memberDao.getPointByMemberId(memberId);
	}

}
