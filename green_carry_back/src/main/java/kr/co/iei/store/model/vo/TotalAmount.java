package kr.co.iei.store.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("amount")
public class TotalAmount {

	private Integer storeId; // 매장고유번호
    private String memberId;
    private Integer memberGrade;
    private String orderId;
    private Integer deliveryType;
    private Integer price;
    private Integer quantity;
    private String date;
    
}
