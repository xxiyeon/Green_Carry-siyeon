package kr.co.iei.member.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("pointHistory")
public class PointHistory {
    private int orderId;       
    private String storeName;   
    private String orderDate;   
    private int pointAmount;   
    private int getPoint;    
    private int usedPoint;
    private Integer orderStatus;
    private int pointReward;
}