package kr.co.iei.store.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

// 3. DB Insert용 DTO (operating_hours_tbl과 매핑)
// 안쓸거같음
@NoArgsConstructor
@AllArgsConstructor
@Alias("operatingHours")
@Data
public class OperatingHours {
    private Integer hourId;
    private Integer storeId;
    private String dayOfWeek;
    private String openTime;
    private String closeTime;
    private String isDayOff;   // Y 또는 N
    private int weekOfMonth; // 0, 1, 2, 3, 4
}