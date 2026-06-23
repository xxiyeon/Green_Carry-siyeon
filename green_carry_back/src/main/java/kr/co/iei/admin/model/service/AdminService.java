package kr.co.iei.admin.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.iei.admin.model.dao.AdminDao;
import kr.co.iei.admin.model.vo.OrderListByStoreId;
import kr.co.iei.admin.model.vo.orderDetail;
import kr.co.iei.member.model.vo.Review;
import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.OrderResponse;
import kr.co.iei.store.model.vo.StoreReviewResponse;

@Service
public class AdminService {
	private static final int DELIVERY_FEE_WALK = 0;
	private static final int DELIVERY_FEE_BICYCLE = 1000;
	private static final int DELIVERY_FEE_CAR = 3000;

	@Autowired
	private AdminDao adminDao;

	public List<Map<String, Object>> selectMonthlySales() {
		List<Map<String, Object>> list = adminDao.selectMonthlySales();
		return list;
	}

	public List<Map<String, Object>> selectMonthlyPoint() {
		List<Map<String, Object>> list = adminDao.selectMonthlyPoint();
		return list;
	}

	public List<OrderListByStoreId> selectOrdersByStoreId(int storeId) {
		List<OrderListByStoreId> list = adminDao.selectOrdersByStoreId(storeId);

		for (OrderListByStoreId o : list) {
			List<Menu> menuList = adminDao.selectMenuListByOrderId(o.getOrderId());
			o.setMenuList(menuList);
			o.setTotalPrice((o.getTotalPrice() == null ? 0 : o.getTotalPrice()) + resolveDeliveryFee(o.getDeliveryType()));
		}
		return list;
	}

	public Long selectTotalSales(int storeId) {
		Long totalSales = adminDao.selectTotalSales(storeId);
		return totalSales;
	}

	public List<StoreReviewResponse> selectAllReview() {
		List<StoreReviewResponse> list = adminDao.selectAllReview();
		return list;
	}

	public List<orderDetail> selectOrderDetailByOrderId(int orderId) {
		List<orderDetail> detailList = adminDao.selectOrderDetailByOrderId(orderId);

		for (orderDetail detail : detailList) {
			detail.setDeliveryFee(resolveDeliveryFee(detail.getDeliveryType()));
		}
		return detailList;
	}

	//  DB에는 delivery_type만 저장되어 있어서 서비스 계층에서 금액으로 변환해 사용함.
	private int resolveDeliveryFee(int deliveryType) {
		switch (deliveryType) {
		case 2:
			return DELIVERY_FEE_BICYCLE;
		case 3:
			return DELIVERY_FEE_CAR;
		case 1:
		default:
			return DELIVERY_FEE_WALK;
		}
	}

}
