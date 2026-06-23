package kr.co.iei.cs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.co.iei.cs.model.service.CSService;
import kr.co.iei.cs.model.vo.Faq;
import kr.co.iei.cs.model.vo.FaqManager;
import kr.co.iei.cs.model.vo.Qna;
import kr.co.iei.notification.model.service.NotificationService;
import tools.jackson.databind.ext.QNameSerializer;

@RestController
@RequestMapping("/cs/inquiries")
@CrossOrigin(origins = "https://greencarry.vercel.app")
public class CSController {

	@Autowired
	private CSService csService;

	@Autowired
	private NotificationService notificationService;

	// user FAQ 전체조회
	@GetMapping(value = "/faq")
	public ResponseEntity<?> selectAllListUser(Faq faq) {
		System.out.println("데이터 확인:" + faq);
		List<Faq> list = csService.selectAllList(faq);
		return ResponseEntity.ok(list);
	}

	// manager FAQ 전체조회
	@GetMapping(value = "/faq/manager")
	public ResponseEntity<?> selectAllListManagerFaq(FaqManager faqManager) {
		System.out.println("데이터 확인:" + faqManager);
		List<FaqManager> list = csService.selectAllListManagerFaq(faqManager);
		return ResponseEntity.ok(list);
	}

	// 1:1문의내역 전체조회
	@GetMapping(value = "/list")
	public ResponseEntity<?> selectMyInquiry(@RequestParam(value = "memberId", required = false) String memberId) {
		List<Qna> list = csService.selectMyInquiry(memberId);
		return ResponseEntity.ok(list);
	}

	// 문의등록
	@PostMapping(value = "/submit")
	public ResponseEntity<?> insertQna(@RequestBody Qna qna) {
		int result = csService.insertQna(qna);
		notificationService.sendNotification("admin123", "orderUpdate", "1대1 문의가 등록되었습니다.", "/mypage/admin");
		return ResponseEntity.ok(result);
	}

	// 문의삭제
	@DeleteMapping(value = "/delete")
	public ResponseEntity<?> deleteInquiry(@RequestParam Integer qnaNo) {
		int result = csService.deleteInquiry(qnaNo);
		return ResponseEntity.ok(result);
	}

	// 문의수정
	@PutMapping(value = "/update")
	public ResponseEntity<?> putInquiry(@RequestBody Qna qna) {
		int result = csService.putInquiry(qna);
		return ResponseEntity.ok(result);

	}

	@PatchMapping("/adminAnswer")
	public ResponseEntity<?> adminAnswer(@RequestBody Qna qna) {
		int result = csService.updateAnswer(qna);
		if (result == 1) {
			String memberId = getMemberIdByQnaId(qna.getQnaNo());

			String message = "문의하신 1:1 문의에 대한 답변이 등록되었습니다.";
			String navUrl = "/mypage/user/userCS";
			notificationService.sendNotification(memberId, "orderUpdate", message, navUrl);
		}
		return ResponseEntity.ok(result);
	}
	public String getMemberIdByQnaId(int qna) {
		String memberId = csService.getMemberIdByQnaId(qna);
		return memberId;
	}

}
