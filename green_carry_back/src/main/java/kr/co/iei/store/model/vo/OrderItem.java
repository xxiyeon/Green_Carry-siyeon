package kr.co.iei.store.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias("orderItem")
public class OrderItem {
	//  주문 상세 조회에서 배달 유형별 금액을 함께 받기 위한 필드 추가.
	private String menuName;
	private Integer menuId;
	private Integer quantity;
	private Integer price;
	private String optionString;
	private Double totalcarbon;
	private String menuImage;
	private Integer deliveryFee;
}
