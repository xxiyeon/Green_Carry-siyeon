package kr.co.iei.member.controller;

import java.io.File;
import java.io.IOException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import kr.co.iei.member.model.vo.Member;
import kr.co.iei.member.model.vo.PointHistory;
import kr.co.iei.member.model.vo.Review;
import kr.co.iei.notification.model.service.NotificationService;
import kr.co.iei.store.model.dao.StoreDao;
import kr.co.iei.store.model.service.StoreService;
import kr.co.iei.store.model.vo.Store;
import kr.co.iei.utils.EmailSender;
import kr.co.iei.utils.JwtUtil;
import kr.co.iei.member.model.service.MemberService;

@RestController
@RequestMapping("/member")

@CrossOrigin(origins = "https://greencarry.vercel.app")

public class MemberController {

	@Autowired
	private Cloudinary cloudinary;

	private final EmailSender emailSender;

	private final BCryptPasswordEncoder passwordEncoder;

	@Autowired
	private MemberService memberService;

	@Autowired
	private StoreService storeService;

	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
	private StringRedisTemplate redisTemplate;

	@Autowired
	private StoreDao storeDao;

	@Autowired
	private NotificationService notificationService;

	MemberController(BCryptPasswordEncoder passwordEncoder, EmailSender emailSender) {
		this.passwordEncoder = passwordEncoder;
		this.emailSender = emailSender;
	}

	@GetMapping
	public ResponseEntity<?> getMembers() {
		List<Member> list = memberService.getMembers();
		return ResponseEntity.ok(list);
	}

	@PostMapping("/login")
	public ResponseEntity<?> loginMember(@RequestBody Member member) {
		System.out.println("로그인 요청 데이터: " + member);

		Member loginMember = memberService.loginMember(member);
		System.out.println("로그인 결과 데이터: " + loginMember);

		if (loginMember != null) {
			// 1. Access Token 생성
			String accessToken = jwtUtil.createToken(loginMember.getMemberId(), loginMember.getMemberGrade());

			//  2. [중복 로그인 방지 핵심] Redis에 최신 토큰 저장
			// Key: "AUTH:아이디", Value: "액세스 토큰", 만료시간: 2시간(토큰 수명과 맞춤)
			//redisTemplate.opsForValue().set("AUTH:" + loginMember.getMemberId(), accessToken, 2, TimeUnit.HOURS);

			Map<String, Object> response = new HashMap<>();
			response.put("member", loginMember);
			response.put("accessToken", accessToken);

			// 3. 자동 로그인 처리
			if (member.getAutoLogin()) {
				String refreshToken = jwtUtil.createRefreshToken(loginMember.getMemberId());

				// (선택사항) 리프레시 토큰도 보안을 위해 Redis에 저장하면 더 좋습니다.
				// redisTemplate.opsForValue().set("REFRESH:" + loginMember.getMemberId(),
				// refreshToken, 7, TimeUnit.DAYS);

				response.put("refreshToken", refreshToken);
				System.out.println("✅ 자동 로그인 활성화: Refresh Token 발급 완료");
			}

			return ResponseEntity.ok(response);
		} else {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
	}
	
	@PostMapping("/logout")
	public ResponseEntity<?> logout(@RequestBody Map<String, String> request) {
	    String memberId = request.get("memberId");
	    
	    if (memberId != null) {
	        //  Redis에서 해당 유저의 최신 토큰 정보를 삭제하여 중복 로그인 로직 초기화
	        redisTemplate.delete("AUTH:" + memberId);
	        System.out.println("✅ Redis 삭제 완료: " + memberId);
	    }
	    
	    return ResponseEntity.ok("LOGOUT_SUCCESS");
	}

	// 아이디 찾기 (이름 + 이메일)
	@PostMapping("/findId")
	public ResponseEntity<?> findId(@RequestBody Member member) {
		// DB에서 이름과 이메일이 일치하는 사용자의 ID를 가져옴
		String memberId = memberService.findId(member);

		if (memberId != null) {
			return ResponseEntity.ok(memberId);
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("일치하는 회원이 없습니다.");
		}
	}

	// 비밀번호 재설정 1차 인증
	@PostMapping("/checkMember")
	public ResponseEntity<?> checkMember(@RequestBody Member member) {
		// 아이디와 이메일이 일치하는 행이 있는지 COUNT 조회
		int result = memberService.checkMember(member);
		return ResponseEntity.ok(result);
	}

	// 비밀번호 재설정
	@PostMapping("/resetPw")
	public ResponseEntity<?> resetPw(@RequestBody Member member) {
		System.out.println("넘어온 아이디: " + member.getMemberId()); // 👈 이거 꼭 확인!
		System.out.println("넘어온 비번: " + member.getMemberPw());
		int result = memberService.resetPw(member);

		if (result == -1) {
			return ResponseEntity.ok(-1);
		} else if (result > 0) {
			return ResponseEntity.ok(result);
		} else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("변경 실패");
		}
	}

	@PostMapping("/sendAuthCode")
	public ResponseEntity<?> sendAuthCode(@RequestBody Member member) {
		String authCode = memberService.sendAuthCode(member.getMemberEmail());

		return ResponseEntity.ok(authCode);
	}

	@PostMapping("/verifyCode")
	public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> data) {
		String email = data.get("memberEmail");
		String inputCode = data.get("inputCode");
		System.out.println("프론트에서 온 이메일: " + email);
		System.out.println("프론트에서 온 입력코드: " + inputCode);

		boolean isMatch = memberService.checkAuthCode(email, inputCode);

		return ResponseEntity.ok(isMatch);
	}

	@GetMapping("/getMemberInfo")
	public ResponseEntity<?> getMemberInfo(@RequestParam String memberId) {
		System.out.println("현재 정보를 조회할 회원의 아이디 : " + memberId);
		Member member = memberService.selectOneMember(memberId);
		System.out.println(member);

		if (member != null) {
			return ResponseEntity.ok(member);
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("회원 정보 없음");
		}
	}

	@PostMapping("/updatePassword")
	public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> data) {
		String memberId = data.get("memberId");
		String currentPw = data.get("currentPw");
		String newPw = data.get("newPw");

		try {
			boolean result = memberService.updatePassword(memberId, currentPw, newPw);
			if (result) {
				return ResponseEntity.ok("SUCCESS");
			} else {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("비밀번호 변경 실패");
			}
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}

	// 유저 정보 업데이트
	@PostMapping("/updateProfile")
	public ResponseEntity<?> updateProfile(
			@RequestParam String memberId,
			@RequestParam String memberName,
			@RequestParam String memberPhone,
			@RequestParam(required = false)
			Integer memberGrade, // 400 에러 방지용
								// required=false
			@RequestParam(value = "uploadFile", required = false) MultipartFile uploadFile) {

		Member member = new Member();
		member.setMemberId(memberId);
		member.setMemberName(memberName);
		member.setMemberPhone(memberPhone);

		// NullPointerException(NPE) 방지: memberGrade가 null이면 기본값 1 세팅
		member.setMemberGrade(memberGrade == null ? 1 : memberGrade);

		if (uploadFile != null && !uploadFile.isEmpty()) {
			try {
				Map uploadParams = ObjectUtils.asMap("folder", "projet/upload/web/member", "use_filename", true,
						"unique_filename", true);

				// 주입받은 cloudinary 인스턴스 사용
				Map uploadResult = cloudinary.uploader().upload(uploadFile.getBytes(), uploadParams);
				String memberThumb = (String) uploadResult.get("secure_url");
				member.setMemberThumb(memberThumb);

			} catch (IOException e) {
				e.printStackTrace();
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("FILE_UPLOAD_ERROR");
			}
		}

		int result = memberService.updateProfile(member);

		if (result > 0) {
			return ResponseEntity.ok(member.getMemberThumb() != null ? member.getMemberThumb() : "SUCCESS_NO_IMAGE");
		} else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("UPDATE_FAIL");
		}
	}

	// user아이디 중복체크
	@GetMapping(value = "/exists")
	public ResponseEntity<?> handleIdCheck(@RequestParam String memberId) {
		Member member = memberService.selectOneMember(memberId);
		return ResponseEntity.ok(member == null);
	}

	// 메일전송요청
	@PostMapping(value = "/email-verification")
	public ResponseEntity<?> sendMail(@RequestBody Member member) {

		String authCode = memberService.sendAuthCode(member.getMemberEmail());

		System.out.println("인증번호 : " + authCode);
		return ResponseEntity.ok(authCode);
	}

	// user회원가입
	@PostMapping(value = "/userSignup")
	public ResponseEntity<?> userSignup(@RequestBody Member member) {
		int result = memberService.insertUser(member);
		return ResponseEntity.ok(result);
	}

	// 사업자 번호 중복 체크
	@GetMapping("/storeDupCheck")
	public ResponseEntity<?> storeDupCheck(@RequestParam String storeOwnerNo) {
		Member member = memberService.storeDupCheck(storeOwnerNo);
		System.out.println(storeOwnerNo);

		return ResponseEntity.ok(member == null ? "" : member);
	}

	@GetMapping("/emailDupCheck")
	public ResponseEntity<?> emailDupCheck(@RequestParam String memberEmail) {
		Member member = memberService.emailDupCheck(memberEmail);
		return ResponseEntity.ok(member == null);
	}

	// 사업자 회원가입
	@PostMapping("/signupManager")
	public ResponseEntity<?> signupManager(@RequestBody Map<String, Object> data) {

		int result = memberService.insertManager(data);

		if (result > 0) {
			return ResponseEntity.ok("서압자 가입성공");
		} else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PostMapping("/delete")
	public ResponseEntity<?> deleteMember(@RequestBody Map<String, String> requestBody) // 프론트 에서 보낸 {password :
																						// password}받기
	{
		String memberId = requestBody.get("memberId");
		String rawPassword = requestBody.get("password");

		try {
			// 서비스에 비밀번호 맞는지 확인 후 삭제 진행
			memberService.deleteMember(memberId, rawPassword);
			// 성공하면 프론트 response.ok로 넘어감
			return ResponseEntity.ok().body("회원 탈퇴가 완료되었습니다.");
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}

	@GetMapping("/total-carbon")
	// @CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<?> getTotalCarbon(@RequestParam String memberId) {
		Member totalPoint = memberService.getTotalCarbonPoint(memberId);
		return ResponseEntity.ok(totalPoint);
	}

	@GetMapping("/community-carbon")
	public ResponseEntity<?> getCommunityCarbon() {
		Double total = memberService.getCommunityTotalCarbon();
		return ResponseEntity.ok(total);
	}

	@PatchMapping("/updateAddress")
	public ResponseEntity<String> updateAddress(@RequestBody Member member) {
		System.out.println(member);
		System.out.println("주소 변경 요청 ID: " + member.getMemberId());

		int result = memberService.updateAddress(member);

		if (result > 0) {
			return ResponseEntity.ok("SUCCESS");
		} else {
			return ResponseEntity.internalServerError().body("FAIL");
		}
	}

	@PostMapping("/refresh")
	public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> tokenData) {
		String refreshToken = tokenData.get("refreshToken");

		if (refreshToken != null && jwtUtil.validateToken(refreshToken)) {
			String memberId = jwtUtil.getMemberIdFromToken(refreshToken);

			Member member = memberService.selectOneMember(memberId);

			if (member != null) {
				System.out.println("토큰 재발행");
				String newAccessToken = jwtUtil.createToken(memberId, member.getMemberGrade());

				Map<String, String> response = new HashMap<>();
				response.put("accessToken", newAccessToken);

				System.out.println("✅ 자동 로그인: " + memberId + "님의 AccessToken 재발급 완료!");
				return ResponseEntity.ok(response);
			}
		}

		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("REFRESH_TOKEN_EXPIRED");

	}

	@GetMapping("/check-active-order")
	public ResponseEntity<Integer> checkActiveOrder(@RequestParam("memberId") String memberId) {
		int activeOrderCount = memberService.checkActiveOrder(memberId);
		return ResponseEntity.ok(activeOrderCount);
	}

	@PostMapping("/insertReview")
	public ResponseEntity<String> insertReview(Review review, // FormData로 보낸 orderId, reviewContent, reviewRating이 자동으로
																// 매핑됨
			@RequestParam(value = "uploadFile", required = false) MultipartFile uploadFile) {
		try {

			memberService.insertReview(review, uploadFile);

			String memberId = storeService.getStoreById(review.getStoreId()).getMemberId();

			notificationService.sendNotification(memberId, "orderUpdate", "고객님으로부터 리뷰가 달렸습니다.",
					"/mypage/manager/reviews");

			return ResponseEntity.ok("SUCCESS");
		} catch (RuntimeException e) {
			// 예외 발생 시 프론트의 catch(err) 부분으로 메시지 전달
			return ResponseEntity.badRequest().body(e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("리뷰 등록 중 서버 오류가 발생했습니다.");
		}
	}

	@GetMapping("/myReviewList/{memberId}")
	public ResponseEntity<?> getMyReviewList(@PathVariable String memberId) {
		List<Review> list = memberService.selectReviewList(memberId);
		return ResponseEntity.ok(list);
	}

	@DeleteMapping("/deleteReview/{orderId}")
	public ResponseEntity<?> deleteReview(@PathVariable int orderId) {
		try {
			boolean result = memberService.deleteReview(orderId);
			if (result) {
				return ResponseEntity.ok("SUCCESS");
			} else {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("DELETE_FAIL");
			}
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("SERVER_ERROR");
		}
	}

	@GetMapping("/point-history/{memberId}")
	public ResponseEntity<?> getPointHistory(@PathVariable String memberId) {
		try {
			List<PointHistory> list = memberService.selectPointHistory(memberId);
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body("SERVER_ERROR");
		}
	}

	@GetMapping("/enroll-date")
	public ResponseEntity<String> getEnrollDate(@RequestParam("memberId") String memberId) {
		String enrollDate = memberService.getEnrollDate(memberId);
		return ResponseEntity.ok(enrollDate);
	}

	@GetMapping("/{memberId}")
	public ResponseEntity<?> getMemberDetail(@PathVariable String memberId) {
		System.out.println("최신 멤버 정보 조회 요청 ID: " + memberId);

		Member member = memberService.selectOneMember(memberId);

		if (member != null) {
			return ResponseEntity.ok(member); // 여기서 memberPoint를 포함한 전체 정보가 프론트로 넘어갑니다.
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("회원 정보를 찾을 수 없습니다.");
		}
	}

	@GetMapping("/point/{memberId}")
	public ResponseEntity<?> getMemberPoint(@PathVariable String memberId) {
		// DB에서 해당 유저의 현재 포인트를 가져옵니다.
		int currentPoint = memberService.getPointByMemberId(memberId);
		return ResponseEntity.ok(currentPoint);
	}
	
	@PostMapping("/Addpoint/{memberId}")
	public ResponseEntity<?> EasterEgg(
	        @PathVariable String memberId, 
	        @RequestBody Map<String, String> request) {
	    
	    String eggName = request.get("event_code"); // 프론트: { "event_code": "NIGHT_COUPON" }

	    try {

	        int result = memberService.EasterEgg(memberId, eggName);
	        

	        return ResponseEntity.ok(result); 
	        
	    } catch (IllegalStateException e) {
	        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
	    } catch (Exception e) {
	        e.printStackTrace(); 
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 에러가 발생했습니다.");
	    }
	}

}
