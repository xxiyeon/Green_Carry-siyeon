package kr.co.iei.store.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("menuOption")
public class MenuOption {
    private Long optionNo;
    private int optionType;
    private String optionName;
    private int optionPrice;
    private double optionCarbon;
}
