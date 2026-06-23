package kr.co.iei.store.model.dao;

import kr.co.iei.store.model.vo.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface StoreDao {
    //  중복 선언과 실제 사용되지 않는 시그니처를 정리해 DAO 계약을 단순화했습니다.
    List<Store> selectAllStore();

    Store findStoreById(Integer storeId);

    List<Menu> selectAllMenu(Long storeId);

    List<MenuOption> getMenuOptions(Long menuId);

    int insertOrder(Order order);

    int insertOrderHistory(@Param("orderId") int orderId, @Param("memberId") String memberId);

    OrderResponse searchOrderInfo(Integer orderId);

    List<OrderItem> searchOrderItems(Integer orderId);

    List<OrderListResponse> searchOrdersByMemberId(String memberId);

    List<OrderResponse> searchOrderList(String memberId);

	int insertOrderDetail(@Param("orderItem") OrderItem orderItem, @Param("orderId") int orderId);

	int getTotalCarbonPoint(String memberId);

    int cancelOrder(Integer orderId);

    OrderListObject selectOrderListObject(String memberId);

    int[] selectOrderList(String memberId);

	int updatePoint(Integer orderId);

    int addReduceCarbon(int orderId);

    int updateOrderStatus(Integer orderId);

	Store findStoreByMemberId(String memberId);

	String getMenuImageById(int menuId);

	StoreIdResponse selectStoreId(String memberId);

    List<StatsOrderInfo> selectStatsOrderInfo(Integer storeId, String yearMonth);

    List<SaleMonth> selectMonthlySalesByStoreId(Integer storeId);

    List<OrderResponse> getOrdersByStoreId(Integer storeId);

    List<StoreReviewResponse> selectStoreReviews(Integer storeId);

    int changeOrderStatus(Integer orderId, int status, Integer expectedTime);

    void updateStore(StoreSaveRequest req);

    void deleteOperatingHours(Integer storeId);

	Map<String, Object> selectStoreReviewStats(int storeId);

	int insertReviewComment(Map<String, Object> payload);

	Long selectTotalSales(Integer storeId);

	List<StoreOperating> getStoreOperatingHours(Integer storeId);

	String getMemberIdByOrderId(Integer orderId);

	int rollbackPoint(Integer orderId);

    void insertOperatingHours(StoreOperating dto);
	void pointReward(Integer orderId);

	int insertStore(Map<String, Object> data);

	Store getStoreLocation(Integer storeId);

	int deductMemberPoint(Order order);

}
