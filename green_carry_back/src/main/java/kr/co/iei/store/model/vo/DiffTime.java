package kr.co.iei.store.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Alias("diffTime")
@Data
public class DiffTime {
    private String day;
    private boolean isOpen;
    private String startH; private String startM;
    private String endH; private String endM;
}