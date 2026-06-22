package kr.co.iei.store.model.vo;

import java.util.List;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias("order")
public class Order {
	private Integer orderId;
	private String memberId;
	private Integer storeId;
	private Integer usedPoint;
	private Integer deliveryType;
	private Integer totalPrice;
	private Integer getPoint;
	private List<OrderItem> items;
	private Integer expectedTime;
	private int reviewStatus;
	private String deliveryAddress;
}
