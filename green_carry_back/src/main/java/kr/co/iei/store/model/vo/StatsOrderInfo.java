package kr.co.iei.store.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("statsOrderInfo")
public class StatsOrderInfo {

	private Integer deliveryType;   // 배달 수단 코드 (1: 오토바이, 2: 도보, 3: 자전거 등)
    private Long seriesAmount;      // 해당 배달 수단의 총 주문 금액 합계 (SUM 연산 결과)

    // ✅ [추가] 백엔드 서비스에서 계산해서 채워줄 필드들 (프론트엔드 차트용)
    private String label;           // 배달 수단 이름 (예: '오토바이 배달')
    private Double percent;			// 당월 총 금액 대비 비율 (%)
    private Integer orderCount;
}
