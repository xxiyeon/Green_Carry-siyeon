package kr.co.iei.store.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Alias("restDay")
@Data
public class RestDay {
    private String weekMonth; // "week", "week2" ...
    private String day;       // "mon", "tue" ...
}