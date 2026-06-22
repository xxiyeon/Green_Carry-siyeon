package kr.co.iei.cs.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.iei.cs.model.dao.CSDao;
import kr.co.iei.cs.model.vo.Faq;
import kr.co.iei.cs.model.vo.FaqManager;
import kr.co.iei.cs.model.vo.Qna;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CSService {

	@Autowired
	private CSDao csDao;
	
	public List<Faq> selectAllList(Faq faq) {
		List<Faq> list = csDao.selectAllList(faq); 
		return list;
	}

	public List<Qna> selectMyInquiry(String memberId) {
		List<Qna> list = csDao.selectMyInquiry(memberId);
		return list;
	}

	@Transactional
	public int insertQna(Qna qna) {
		int result = csDao.insertQna(qna);
		return result;
	}

	@Transactional
	public int deleteInquiry(Integer qnaNo) {
		int result = csDao.deleteInquiry(qnaNo);
		return result;
	}

	@Transactional
	public int putInquiry(Qna qna) {
		int result = csDao.putInquiry(qna);
		return result;
	}


	@Transactional
	public int updateAnswer(Qna qna) {
		return csDao.updateAnswer(qna);
	}

	public List<FaqManager> selectAllListManagerFaq(FaqManager faqManager) {
		List<FaqManager> list = csDao.selectAllListManagerFaq(faqManager);
		return list;
	}

	public String getMemberIdByQnaId(int qna) {
		String memberId = csDao.getMemberIdByQnaId(qna);
		return memberId;
	}
}
