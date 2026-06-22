package kr.co.iei.store.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Alias("storeReviewResponse")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreReviewResponse {
    // 고객 리뷰 정보
	private String memberId;
	private String memberProfile;
    private Integer orderId;
    private Integer reviewRating;
    private String reviewDate;
    private String reviewContent;
    private String reviewThumb;
    private String menuName; // 주문한 메뉴 이름
    private String storeName;
    private Integer storeId;

    // 사장님 답글 정보
    private String reviewCommentContent;
    private String reviewCommentDate;
}