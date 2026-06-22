package kr.co.iei.store.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("reviewComment")
public class ReviewComment {
    private Integer orderId;
    private Integer storeId;
    private String memberId;
    private String reviewCommentContent;
    private String reviewCommentDate;
}