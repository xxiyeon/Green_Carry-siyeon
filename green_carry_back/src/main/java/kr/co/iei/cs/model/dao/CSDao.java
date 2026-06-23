package kr.co.iei.cs.model.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.iei.cs.model.vo.Faq;
import kr.co.iei.cs.model.vo.FaqManager;
import kr.co.iei.cs.model.vo.Qna;

@Mapper
public interface CSDao {

	List<Faq> selectAllList(Faq faq);

	List<Qna> selectMyInquiry(String memberId);

	int insertQna(Qna qna);

	int deleteInquiry(Integer qnaNo);

	int putInquiry(Qna qna);

    int updateAnswer(Qna qna);

	List<FaqManager> selectAllListManagerFaq(FaqManager faqManager);

	String getMemberIdByQnaId(int qna);
}
