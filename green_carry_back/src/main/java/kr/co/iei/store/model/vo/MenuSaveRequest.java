package kr.co.iei.store.model.vo;

import lombok.Data;
import org.apache.ibatis.type.Alias;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@Alias("menuSaveRequest")
public class MenuSaveRequest {
    private Long storeId;
    private Long menuId;
    private String menuName;
    private String menuInfo;
    private MultipartFile menuImage; 
    private String menuImagePath;
    private Integer menuPrice;
    private String menuCategory;
    private Double menuCarbon;
    private Integer menuStatus;

    // 추가 설정 데이터들
    private String optionIds;
    private String newOptions;
    private String containerMap;

    @Data
    public static class ContainerItem {
        private Long productId;
        private int count;
    }
}