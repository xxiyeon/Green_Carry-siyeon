package kr.co.iei.store.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.List;
import java.util.Map;

// 1. 클라이언트 요청 전체를 받는 Request DTO
@NoArgsConstructor
@AllArgsConstructor
@Alias("storeSaveRequest")
@Data
public class StoreSaveRequest {
    private Integer storeId;
    private String storeName;
    private String storeIntro;
    private String storePhone;
    private String storeOwnerNo;
    private String storeOriginInfo;
    private String storeCategory;
    private String storeAddress;
    private String storeOwnerAddress;
    private Double latitude;
    private Double longitude;
    private HoursInfo hoursInfo; // 프론트에서 보낸 시간 정보 객체
    private String storeThumb;
}
