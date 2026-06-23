package kr.co.iei.admin.model.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class StoreResponse {
	private List<OrderListByStoreId> dataList;
	private Long totalSales;
}
