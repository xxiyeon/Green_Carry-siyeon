package kr.co.iei.store.model.vo;

import lombok.*;
import org.apache.ibatis.type.Alias;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Alias("storeInfo")
@Data
public class StoreInfo {
    private Integer storeId;
    private String storeName;
    private String storeAddress;
    private String storePhone;
    private String storeIntro;
    private String storeOwner;
    private String storeOwnerAddress;
    private String storeOriginInfo;
    private String storeOwnerNo;
    private String storeCategory;
    private Double latitude;
    private Double longitude;
    private String openingDate; // YYYY-MM-DD 형식의 문자열

    // 영업시간 및 휴무일 리스트
    private List<StoreOperating> operatingHours;
}