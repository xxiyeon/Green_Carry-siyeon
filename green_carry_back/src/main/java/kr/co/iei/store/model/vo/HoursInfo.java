package kr.co.iei.store.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.List;
import java.util.Map;

// 2. 프론트엔드의 영업시간 설정 객체 매핑
@NoArgsConstructor
@AllArgsConstructor
@Alias("hoursInfo")
@Data
public class HoursInfo {
    private String hoursType; // "same" or "diff"
    private boolean is24h;
    private Map<String, String> sameTime;
    private List<DiffTime> diffTimes;
    private List<RestDay> restDays;
}