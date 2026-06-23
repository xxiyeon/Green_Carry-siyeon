package kr.co.iei.store.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@Alias("operating")
@AllArgsConstructor
@Data
public class StoreOperating {
    private Integer hourId;
    private Integer storeId;
    private String dayOfWeek;
    private String openTime;
    private String closeTime;
    private String isDayOff;
    private int weekOfMonth;
}
