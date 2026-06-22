package kr.co.iei.store.model.vo;

import java.sql.Date;
import java.util.List;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias("orderListObject")
public class OrderListObject {
	private String storeName;
	private List<Menu> menuList;
	private String orderDate;
	private String storeAddr;
	private String memberAddr;
	private Double totalCarbonReduce;
}
