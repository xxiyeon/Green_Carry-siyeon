package kr.co.iei.admin.model.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import kr.co.iei.admin.model.vo.OrderListByStoreId;
import kr.co.iei.admin.model.vo.orderDetail;
import kr.co.iei.member.model.vo.Review;
import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.OrderResponse;
import kr.co.iei.store.model.vo.StoreReviewResponse;

@Mapper
public interface AdminDao {

	List<Map<String, Object>> selectMonthlySales();

	List<Map<String, Object>> selectMonthlyPoint();

	List<OrderListByStoreId> selectOrdersByStoreId(int storeId);

	List<Menu> selectMenuListByOrderId(Long orderId);


	Long selectTotalSales(int storeId);

	List<StoreReviewResponse> selectAllReview();

	List<orderDetail> selectOrderDetailByOrderId(int orderId);


}
