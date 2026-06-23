package kr.co.iei.admin.model.vo;

import java.util.List;

import org.apache.ibatis.type.Alias;

import kr.co.iei.store.model.vo.Menu;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias("orderListByStoreId")
public class OrderListByStoreId {
	//  delivery_type 원본을 받아 서비스에서 금액으로 계산할 수 있게 필드 추가.
	private Long orderId;
	private String memberId;
	private String memberEmail;
	private Integer totalPrice;
	private Integer deliveryType;
	private String storeName;
	private Integer orderStatus;
	private String memberThumb;
	private String menuImage;
	private List<Menu> menuList;
}
