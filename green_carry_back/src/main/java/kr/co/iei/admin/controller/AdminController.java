package kr.co.iei.admin.controller;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import kr.co.iei.CreenCarryBackApplication;
import kr.co.iei.admin.model.service.AdminService;
import kr.co.iei.admin.model.vo.OrderListByStoreId;
import kr.co.iei.admin.model.vo.StoreResponse;
import kr.co.iei.admin.model.vo.orderDetail;
import kr.co.iei.member.model.vo.Review;
import kr.co.iei.store.model.vo.OrderResponse;
import kr.co.iei.store.model.vo.StoreReviewResponse;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "https://greencarry.vercel.app")
public class AdminController {

	@Autowired
	private AdminService adminService;

	@GetMapping("/api/sales/stats")
	public ResponseEntity<?> getSalesStats() {
		List<Map<String, Object>> list = adminService.selectMonthlySales();

		List<Long> pastSeries = new ArrayList<>();
		List<Long> currentSeries = new ArrayList<>();
		List<String> categories = new ArrayList<>();

		// 1. 기준이 되는 과/현재 'YYYY-MM' 목록 만들기 (빈 값은 0으로 세팅)
		List<String> targetCurrent = new ArrayList<>();
		List<String> targetPast = new ArrayList<>();
		YearMonth now = YearMonth.now();

		for (int i = 5; i >= 0; i--) {
			YearMonth ym = now.minusMonths(i);
			targetCurrent.add(ym.toString()); // 예: "2026-04"
			targetPast.add(ym.minusYears(1).toString()); // 예: "2025-04"
			categories.add(String.format("%02d월", ym.getMonthValue())); // 예: "04월"

			// 데이터가 없는 달을 대비해 기본값 0 셋팅
			currentSeries.add(0L);
			pastSeries.add(0L);
		}

		// 2. DB에서 가져온 데이터를 '날짜' 기준으로 찾아서 진짜 값 덮어쓰기
		for (Map<String, Object> map : list) {
			String dbMonth = String.valueOf(map.get("MONTHLY")); // DB에서 온 "2026-04"
			long sales = Long.parseLong(String.valueOf(map.get("TOTAL_SALES")));

			// 현재(당기) 배열에 자리가 있는지 확인
			int currIdx = targetCurrent.indexOf(dbMonth);
			if (currIdx != -1) {
				currentSeries.set(currIdx, sales);
				continue;
			}

			// 과거(전기) 배열에 자리가 있는지 확인
			int pastIdx = targetPast.indexOf(dbMonth);
			if (pastIdx != -1) {
				pastSeries.set(pastIdx, sales);
			}
		}

		Map<String, Object> response = new HashMap<>();
		response.put("pastSeries", pastSeries);
		response.put("currentSeries", currentSeries);
		response.put("categories", categories);

		return ResponseEntity.ok(response);
	}

	@GetMapping("/api/point/stats")
	public ResponseEntity<?> getPointStats() {
		List<Map<String, Object>> list = adminService.selectMonthlyPoint();

		List<Integer> pastSeries = new ArrayList<>();
		List<Integer> currentSeries = new ArrayList<>();
		List<String> categories = new ArrayList<>();

		List<String> targetCurrent = new ArrayList<>();
		List<String> targetPast = new ArrayList<>();
		YearMonth now = YearMonth.now();

		for (int i = 5; i >= 0; i--) {
			YearMonth ym = now.minusMonths(i);
			targetCurrent.add(ym.toString());
			targetPast.add(ym.minusYears(1).toString());
			categories.add(String.format("%02d월", ym.getMonthValue()));

			currentSeries.add(0);
			pastSeries.add(0);
		}

		for (Map<String, Object> map : list) {
			String dbMonth = String.valueOf(map.get("MONTHLY"));
			int point = Integer.parseInt(String.valueOf(map.get("TOTAL_POINT")));

			int currIdx = targetCurrent.indexOf(dbMonth);
			if (currIdx != -1) {
				currentSeries.set(currIdx, point);
				continue;
			}

			int pastIdx = targetPast.indexOf(dbMonth);
			if (pastIdx != -1) {
				pastSeries.set(pastIdx, point);
			}
		}

		Map<String, Object> response = new HashMap<>();
		response.put("pastSeries", pastSeries);
		response.put("currentSeries", currentSeries);
		response.put("categories", categories);

		return ResponseEntity.ok(response);
	}

	@GetMapping("/{storeId}")
	public ResponseEntity<?> selectOrdersByStoreId(@PathVariable int storeId) {
		List<OrderListByStoreId> list = adminService.selectOrdersByStoreId(storeId);
		return ResponseEntity.ok(list);
	}

	@GetMapping("/order-detail/{orderId}")
	public ResponseEntity<?> selectOrderDetailByOrderId(@PathVariable("orderId") int orderId) {
		// 1. 서비스로 주문번호(orderId)를 넘겨서 상세 메뉴 리스트를 받아옴
		List<orderDetail> detailList = adminService.selectOrderDetailByOrderId(orderId);

		// 2. 프론트엔드로 JSON 형태로 반환
		return ResponseEntity.ok(detailList);
	}

	@GetMapping("/reviews")
	public ResponseEntity<?> selectAllReviews() {
		List<StoreReviewResponse> list = adminService.selectAllReview();
		return ResponseEntity.ok(list);
	}
}
