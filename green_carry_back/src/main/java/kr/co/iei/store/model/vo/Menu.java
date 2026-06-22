package kr.co.iei.store.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("menu")
public class Menu {
    private Long menuId;
    private Long storeId;
    private String menuName;
    private Double menuCarbon;
    private String menuInfo;
    private String menuImage;
    private Integer menuPrice;
    private Integer menuStatus;
    private String menuCategory;
    private Integer orderCount;
}
