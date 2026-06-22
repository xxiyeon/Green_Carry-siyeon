package kr.co.iei.store.model.vo;

import java.sql.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrderResponse {
	private String memberId;
	// 1. 기본 주문 정보
	private Integer orderId;
	private String orderDate;
	private Integer orderStatus;
	private Integer storeId;
	private String storeName;
	private String memberPhone;

	// 2.  금액 및 수량 정보 (이게 있어야 0원이 안 나옵니다)
	private Integer totalPrice; // 총 결제 금액
	private Integer totalCount; // 총 주문 상품 개수
	private Integer extraCount; // "메뉴명 외 N건"의 N

	// 3.  포인트 및 배달 정보
	private Integer usedPoint;
	private Integer getPoint;
	private Integer deliveryPrice;
	private Integer deliveryType;
	private Integer expectedTime;
	private String confirmDate;
	private String completeDate;
	

	// 4.  메뉴 상세 정보 (리뷰 모달 및 목록용)
	private String menuName; // 대표 메뉴 이름
	private String menuImage; // 대표 메뉴 이미지 경로
	private String optionString; // 선택한 옵션 문자열
	private List<OrderItem> items; // 전체 아이템 리스트 (필요 시)
	private String storeThumb;

	// 5.  탄소 및 주소 정보
	private Double orderCarbon; // 탄소 절감량 (0.000kg 방지)
	private String storeAddress; // 매장 주소
	private String deliveryAddress;// 배달 주소

	// 6. 리뷰 정보
	private Integer hasReview; // 리뷰 작성 여부 (0 또는 1)
	private int reviewStatus;
	


	private Double totalReduceCarbon;
}
