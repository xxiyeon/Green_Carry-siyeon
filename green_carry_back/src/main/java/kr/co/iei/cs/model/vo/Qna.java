package kr.co.iei.cs.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Alias(value="qna")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Qna {
	private Integer qnaNo;
	private String memberId;
	private String qnaTitle;
	private String qnaContent;
	private String qnaAnswer;
	private Integer qnaStatus;
	private String qnaDate;
	private Integer memberGrade;
	
}
