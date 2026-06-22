package kr.co.iei.cs.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value="faqManager")
public class FaqManager {

	private Integer faqNo;
	private Integer faqCategory;
	private String faqTitle;
	private String faqContent;
	private String searchKeyword;
}
