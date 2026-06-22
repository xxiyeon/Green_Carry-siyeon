package kr.co.iei.admin.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class orderDetail {
    //  주문 상세에서 옵션 문자열과 배달 유형별 금액을 함께 매핑하기 위한 필드 정리.
    private String menuName;
    private String menuImage;
    private int quantity;
    private int price;
    private String options;
    private int deliveryType;
    private int deliveryFee;
}
