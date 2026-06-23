package kr.co.iei.member.model.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.iei.member.model.vo.Member;
import kr.co.iei.member.model.vo.PointHistory;
import kr.co.iei.member.model.vo.Review;

@Mapper
public interface MemberDao {


	Member loginMember(Member member);

	String findId(Member member);

	int resetPassword(Member member);

	int checkMember(Member member);

	Member selectOneMember(String memberId);

	int updatePassword(String memberId, String encodedNewPw);



	List<Member> selectAllMember();

	int updateProfile(Member member);

	int insertUser(Member member);

	int insertManager(Map<String, Object> data);

	Member storeDupCheck(String storeOwnerNo);

	Member emailDupCheck(String memberEmail);

	int updateAddress(Member member);


	void deleteMember(String memberId);

	Member getTotalCarbonPoint(String memberId);

	Double getCommunityTotalCarbon();

	int checkActiveOrder(String memberId);

	int checkOrderOwner(@Param("orderId") int orderId, @Param("memberId") String memberId);

    int isAlreadyReviewed(int orderId);

    int insertReview(Review review);

	List<Review> selectReviewList(String memberId);

	int deleteReview(int orderId);

	List<PointHistory> selectPointHistory(String memberId);

	void updateReviewStatus(int orderId);
	String getEnrollDate(String memberId);

    int updateStoreOwner(Member member);

	int getPointByMemberId(String memberId);

	int checkEasterEgg(String memberId, String eggName);

	void addMemberPoint(String memberId, int reward);

	void insertEasterEgg(String memberId, String eggName, int reward);
}