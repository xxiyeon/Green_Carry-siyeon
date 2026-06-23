package kr.co.iei.store.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrderListResponse {
	private String orderDate;
	private Integer totalCount;
	private String menuName;
	private String menuImage;
	private String optionString;
	private String storeAddress;
	private String deliveryAddress;
}
