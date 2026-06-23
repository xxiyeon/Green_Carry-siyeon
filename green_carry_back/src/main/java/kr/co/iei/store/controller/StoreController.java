package kr.co.iei.store.controller;

import kr.co.iei.notification.model.service.NotificationService;
import kr.co.iei.store.model.service.StoreService;
import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.Order;
import kr.co.iei.store.model.vo.OrderResponse;
import kr.co.iei.store.model.vo.StatsOrderInfo;
import kr.co.iei.store.model.vo.Store;
import kr.co.iei.store.model.vo.StoreIdResponse;
import kr.co.iei.store.model.vo.StoreOperating;
import kr.co.iei.store.model.vo.StoreSaveRequest;
import kr.co.iei.store.model.vo.StoreReviewResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stores")
@CrossOrigin(origins = "https://greencarry.vercel.app")
public class StoreController {
	private static final String STORE_IMAGE_FOLDER = "projet/upload/web/store";

	@Autowired
	private Cloudinary cloudinary;
	@Autowired
	private StoreService storeService;

	@Autowired
	private NotificationService notificationService;

	//  컨트롤러 입력 검증과 알림 분기를 단순화해 런타임 오류 가능성을 줄였습니다.

	@GetMapping
	public ResponseEntity<?> getStores() {
		List<Store> list = storeService.selectAllStore();
		return ResponseEntity.ok(list);
	}

	@GetMapping("/{storeId:[0-9]+}")
	public ResponseEntity<?> getStoreDetail(@PathVariable Integer storeId) {
		Store store = storeService.getStoreById(storeId);

		if (store == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(store);
	}

	@GetMapping("/member/{memberId}")
	public ResponseEntity<?> getStoreByMemberId(@PathVariable String memberId) {
		Store store = storeService.getStoreByMemberId(memberId);
		return ResponseEntity.ok(store);
	}

	@GetMapping("/{storeId}/menus")
	public ResponseEntity<?> getMenuList(@PathVariable Long storeId) {
		// 서비스 호출
		List<Menu> menuList = storeService.selectAllMenu(storeId);

		// 데이터가 없어도 빈 배열([])을 담아 200 OK 응답 (프론트 에러 방지)
		return ResponseEntity.ok(menuList);
	}

	@GetMapping("/{menuId}/options")
	public ResponseEntity<List<MenuOption>> getOptionsByMenu(@PathVariable Long menuId) {
		List<MenuOption> options = storeService.getMenuOptions(menuId);
		return ResponseEntity.ok(options);
	}

	@PostMapping("/order")
	public ResponseEntity<?> insertOrder(@RequestBody Order orderData) {
		int orderId = storeService.insertOrder(orderData);
		Store store = storeService.getStoreById(orderData.getStoreId());
		if (orderId > 0 && store != null && store.getMemberId() != null) {
			notificationService.sendNotification(store.getMemberId(), "orderUpdate", "주문이 들어왔습니다.", "/mypage/manager/orders");
		}
		return ResponseEntity.ok(orderId);
	}

	@GetMapping("/order/{orderId}")
	public ResponseEntity<?> searchOrder(@PathVariable Integer orderId) {
		OrderResponse orderResponse = storeService.searchOrder(orderId);
		if (orderResponse == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(orderResponse);
	}

	@GetMapping("/orders/owner/{storeId}")
	public ResponseEntity<?> getStoreOrders(@PathVariable Integer storeId) {
		List<OrderResponse> list = storeService.getOrdersByStoreId(storeId);
		return ResponseEntity.ok(list);
	}

	@GetMapping("/orders/itemImg/{menuId}")
	public ResponseEntity<String> getMenuImage(@PathVariable int menuId) {
		String imagePath = storeService.getMenuImageById(menuId);
		return ResponseEntity.ok(imagePath);
	}

	@GetMapping(value = "/stats/order")
	public ResponseEntity<?> selectStatsOrderInfo(@RequestParam Integer storeId, @RequestParam String yearMonth) {
		List<StatsOrderInfo> list = storeService.selectStatsOrderInfo(storeId, yearMonth);
		if (list != null && !list.isEmpty()) {
			return ResponseEntity.ok(list);
		} else {
			return ResponseEntity.noContent().build();
		}
	}

	@GetMapping("/orders/{memberId}")
	public ResponseEntity<?> searchOrderList(@PathVariable String memberId) {
		List<OrderResponse> list = storeService.searchOrderList(memberId);
		return ResponseEntity.ok(list);
	}

	// 대시보드용 (memberId 로 storeId조회)
	@GetMapping(value = "/id")
	public ResponseEntity<?> selectStoreId(@RequestParam String memberId) {
		StoreIdResponse storeId = storeService.selectStoreId(memberId);
		if (storeId != null && storeId.getStoreId() != null) {
			return ResponseEntity.ok(storeId);
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	@GetMapping("/stats/review")
	public ResponseEntity<Map<String, Object>> getReviewStats(@RequestParam int storeId) {
		// service -> dao를 거쳐 위에서 만든 selectStoreReviewStats 결과 반환
		Map<String, Object> stats = storeService.selectStoreReviewStats(storeId);
		return ResponseEntity.ok(stats);
	}

	@GetMapping("/reviews/{storeId}")
	public ResponseEntity<?> getStoreReviews(@PathVariable Integer storeId) {
		List<StoreReviewResponse> list = storeService.selectStoreReviews(storeId);
		return ResponseEntity.ok(list);
	}

	@PostMapping("/review/comment")
	public ResponseEntity<?> insertReviewComment(@RequestBody Map<String, Object> payload) {
		// 1. 프론트에서 보낸 데이터 꺼내기 (reviewId, commentContent 등)
		// 💡 VO(객체)를 따로 만드셨다면 @RequestBody ReviewCommentVO vo 형태로 받으셔도 됩니다.
		int result = storeService.insertReviewComment(payload);

		if (result > 0) {
			String customerId = storeService.getMemberIdByOrderId(Integer.parseInt(payload.get("orderId").toString()));

			String message = "작성하신 리뷰에 답글이 달렸습니다.";
			String navUrl = "/mypage/user/reviews";
			notificationService.sendNotification(customerId, "orderUpdate", message, navUrl);
			return ResponseEntity.ok("답글이 등록되었습니다.");
		} else {
			return ResponseEntity.internalServerError().body("답글 등록 실패");
		}
	}

	@PatchMapping("/order/{orderId}/status")
	public ResponseEntity<?> changeOrderStatus(@PathVariable Integer orderId,
			@RequestBody Map<String, Object> payload) {

		// 리액트에서 보낸 status와 expectedTime 꺼내기
		int status = Integer.parseInt(payload.get("status").toString());

		// expectedTime은 수락 단계에서만 들어오므로 null 체크 필요
		Integer expectedTime = null;
		if (payload.get("expectedTime") != null) {
			expectedTime = Integer.parseInt(payload.get("expectedTime").toString());
		}

		// 서비스 호출 (상태값과 예상 시간을 넘겨줍니다)
		int result = storeService.changeOrderStatus(orderId, status, expectedTime);

		if (result > 0) {
			// orderId로 memberId를 직접 조회합니다.
			// storeService에 getMemberIdByOrderId 메서드를 하나 만드세요.
			String memberId = storeService.getMemberIdByOrderId(orderId);

			// 1. 현재 시간을 타임스탬프(숫자)로 가져오기
			long timestamp = System.currentTimeMillis();

			// 2. 리액트가 원하는 "ORDER_ID_TIMESTAMP" 형식으로 조립
			// 제공해주신 예시: ORDER_370_1775788200000

			String navUrl = String.format("/checkoutPage?orderId=ORDER_%d_%d", orderId, timestamp);

			// 3. 알림 대상(4, 5, 9번 상태)이면 알림 발송
			if (memberId != null && (status == 2 || status == 4 || status == 5 || status == 9)) {
				String message = "";
				if (status == 2) {
					message = expectedTime != null
							? "주문이 접수되었습니다. 약 " + expectedTime + "분 뒤 조리가 완료됩니다."
							: "주문이 접수되었습니다.";
				}
				else if (status == 4) {
					message = "메뉴가 준비되었습니다! 픽업/배달을 확인해주세요.";
				}
				else if (status == 5) {
					storeService.updatePoint(orderId);
					message = "맛있게 드셨나요? 픽업/배달이 완료되었습니다. 🌿";
				}
				else if (status == 9) {
					message = "주문이 취소되었습니다. 다시 확인 부탁드립니다.";
				}

				notificationService.sendNotification(memberId, "orderUpdate", message, navUrl);
			}
			return ResponseEntity.ok("상태 변경 성공");
		} else {
			return ResponseEntity.internalServerError().body("상태 변경 실패");
		}
	}


	// 매장 운영 정보 가져오기
	@GetMapping("/{storeId}/hours")
	public ResponseEntity<?> getStoreOperatingHours(@PathVariable Integer storeId) {

		List<StoreOperating> hours = storeService.getStoreOperatingHours(storeId);

		if (hours == null || hours.isEmpty()) {

			return ResponseEntity.ok(List.of());
		}
		return ResponseEntity.ok(hours);
	}

	// ------------------- 매장 수정 로직 ----------------------
	@PostMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> updateStore(@RequestPart("data") StoreSaveRequest request,
			@RequestPart(value = "file", required = false) MultipartFile file) {

		try {
			// 1. Cloudinary 파일 저장 로직 적용
			if (file != null && !file.isEmpty()) {
				Map uploadParams = ObjectUtils.asMap("folder", STORE_IMAGE_FOLDER, "use_filename", true,
						"unique_filename", true);

				// Cloudinary로 업로드 실행
				// (컨트롤러 상단에 @Autowired private Cloudinary cloudinary; 가 있어야 합니다)
				Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);

				// 업로드된 결과에서 전체 보안 URL(https) 추출
				String storeThumb = (String) uploadResult.get("secure_url");

				// DB에 저장할 경로를 Cloudinary URL로 세팅
				request.setStoreThumb(storeThumb);
			}

			// 2. 서비스 호출 (가게 정보 + 운영 시간 + 이미지 경로 업데이트)
			storeService.updateStoreInfoAndHours(request);

			return ResponseEntity.ok("SUCCESS");

		} catch (IOException e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("FILE_UPLOAD_ERROR");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("UPDATE_FAIL");
		}
	}

	@GetMapping("/info/{storeId}")
	public ResponseEntity<Store> getStoreInfo(@PathVariable Integer storeId) {
		Store storeInfo = storeService.getStoreInfo(storeId);

		// 데이터가 없는 경우 404 Not Found 또는 빈 객체 반환 등을 처리할 수 있습니다.
		if (storeInfo == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(storeInfo);
	}

	@GetMapping("/location/{storeId}")
	public ResponseEntity<?> getStoreLocation(@PathVariable Integer storeId) {
		Store store = storeService.getStoreLocation(storeId);
		if (store == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(store);
	}
}
