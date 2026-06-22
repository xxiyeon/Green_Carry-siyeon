package kr.co.iei.member.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Alias(value = "review")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Review {
    private int reviewNo;        // 리뷰 고유 번호 (DB 시퀀스)
    private int orderId;         // 주문 번호
    private String memberId;     // 작성자 아이디
    private String reviewContent;// 리뷰 내용
    private int reviewRating;    // 별점 (1~5)
    private String reviewThumb;  // 저장된 사진 파일명 (DB에 들어갈 이름)
    private String reviewDate;   // 작성일
    private int storeId;
    private String memberProfile;
    private int reviewStatus;
    
    
    private String storeName;    // 상점 이름
    private String menuName;     // 대표 메뉴명
    private int extraCount;      // 외 N건
    private int totalPrice;      // 주문 총 금액
    private String reviewCommentContent;
    private String reviewCommentDate;
    private int deliveryPrice;
}