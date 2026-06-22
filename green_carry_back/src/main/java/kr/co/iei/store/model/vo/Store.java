package kr.co.iei.store.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("store")
public class Store {
    private Integer storeId;
    private String memberId;
    private String storeName;
    private String storeAddress;
    private String storePhone;
    private String storeIntro;
    private String storeOwner;
    private String storeOwnerAddress;
    private String storeOriginInfo;
    private String storeOwnerNo;
    private String storeCategory;
    private Double storeRating;
    private Double latitude;
    private Double longitude;
    private String storeThumb;
    private String openingDate;
    private Long totalSale;
    private List<SaleMonth> SaleMonth;
    private int reviewCount;

    // 영업시간 및 휴무일 리스트
    private List<StoreOperating> operatingHours;
}
