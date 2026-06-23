package kr.co.iei.store.model.service;

import kr.co.iei.store.model.dao.StoreDao;
import kr.co.iei.store.model.vo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class StoreService {
	//  null 방어와 중복 로직 정리를 통해 store 서비스 안정성을 높였습니다.
	@Autowired
	private StoreDao storeDao;

	public List<Store> selectAllStore() {
		List<Store> list = storeDao.selectAllStore();

		for (Store store : list) {
			List<SaleMonth> monthlySalesList = storeDao.selectMonthlySalesByStoreId(store.getStoreId());
			Long totalSales = storeDao.selectTotalSales(store.getStoreId());
			store.setSaleMonth(monthlySalesList != null ? monthlySalesList : Collections.emptyList());
			store.setTotalSale(totalSales != null ? totalSales : 0L);
		}

		return list;
	}

	public Store getStoreById(Integer storeId) {
		return storeDao.findStoreById(storeId);
	}

	public List<Menu> selectAllMenu(Long storeId) {
		return storeDao.selectAllMenu(storeId);
	}

	public List<MenuOption> getMenuOptions(Long menuId) {
		return storeDao.getMenuOptions(menuId);
	}

	@Transactional
	public int insertOrder(Order order) {
		//  1. 포인트 선차감 (이게 핵심입니다 형님!)
		// 사용한 포인트가 있을 때만 실행
		if (order.getUsedPoint() > 0) {
			// memberDao든 storeDao든 멤버 포인트를 깎는 메소드를 호출합니다.
			// SQL: UPDATE member_tbl SET member_point = member_point - #{usedPoint}
			// WHERE member_id = #{memberId} AND member_point >= #{usedPoint}
			int deductResult = storeDao.deductMemberPoint(order);

			if (deductResult != 1) {
				// 포인트가 부족하면 여기서 바로 터뜨려서 아래 로직이 아예 실행 안 되게 막습니다.
				throw new RuntimeException("포인트가 부족하거나 차감 중 오류가 발생했습니다.");
			}
		}

		// 2. 주문 메인 저장 (기존 로직)
		int result = storeDao.insertOrder(order);
		if (result != 1)
			return 0;

		int orderId = order.getOrderId();
		String memberId = order.getMemberId();
		List<OrderItem> list = order.getItems();

		// 3. 주문 상세 저장 (기존 로직)
		if (list != null && !list.isEmpty()) {
			for (OrderItem orderItem : list) {
				int detailResult = storeDao.insertOrderDetail(orderItem, orderId);
				if (detailResult != 1) {
					throw new RuntimeException("주문 상세 저장 중 오류 발생");
				}
			}
		}

		// 4. 주문 이력 저장 (기존 로직)
		int historyResult = storeDao.insertOrderHistory(orderId, memberId);
		if (historyResult != 1) {
			throw new RuntimeException("주문 이력 저장 실패");
		}

		// 모든 과정이 성공하면 orderId 반환 (실패 시 @Transactional이 다 되돌려줌)
		return orderId;
	}

	@Transactional
	public OrderResponse searchOrder(Integer orderId) {
		OrderResponse orderResponse = storeDao.searchOrderInfo(orderId);
		if (orderResponse == null) {
			return null;
		}

		List<OrderItem> items = storeDao.searchOrderItems(orderId);
		if (orderResponse.getOrderStatus() == 0) {
			storeDao.updateOrderStatus(orderId);
		}
		orderResponse.setItems(items);
		return orderResponse;
	}

	public List<OrderListResponse> searchOrdersByMemberId(String memberId) {
		return storeDao.searchOrdersByMemberId(memberId);
	}

	public List<OrderResponse> searchOrderList(String memberId) {
		return storeDao.searchOrderList(memberId);
	}

	public Store getStoreByMemberId(String memberId) {
		return storeDao.findStoreByMemberId(memberId);
	}

	public String getMenuImageById(int menuId) {
		return storeDao.getMenuImageById(menuId);
	}

	public StoreIdResponse selectStoreId(String memberId) {
		return storeDao.selectStoreId(memberId);
	}

	public List<StatsOrderInfo> selectStatsOrderInfo(Integer storeId, String yearMonth) {
		List<StatsOrderInfo> list = storeDao.selectStatsOrderInfo(storeId, yearMonth);

		if (list == null || list.isEmpty()) {
			return list;
		}
		long totalAmount = list.stream().mapToLong(StatsOrderInfo::getSeriesAmount).sum();

		for (StatsOrderInfo order : list) {
			order.setLabel(resolveDeliveryLabel(order.getDeliveryType()));

			// 퍼센트 계산 (총 금액 대비 비율)
			if (totalAmount > 0) {
				double percent = (double) order.getSeriesAmount() / totalAmount * 100;
				// 소수점 첫째 자리까지 반올림 (예: 90.0)
				order.setPercent(Math.round(percent * 10) / 10.0);
			} else {
				order.setPercent(0.0);
			}
		}
		return list;
	}

	private String resolveDeliveryLabel(Integer deliveryType) {
		return switch (deliveryType == null ? 0 : deliveryType) {
		case 1 -> "포장";
		case 2 -> "도보 & 자전거";
		case 3 -> "오토바이";
		default -> "기타";
		};
	}

	@Transactional
	public int changeOrderStatus(Integer orderId, int status, Integer expectedTime) {
		if (status == 9) {
			//  롤백 후 취소 결과만 반환해 취소 분기 흐름을 단순화합니다.
			storeDao.rollbackPoint(orderId);
			return storeDao.cancelOrder(orderId);
		}

		return storeDao.changeOrderStatus(orderId, status, expectedTime);
	}

	public Map<String, Object> selectStoreReviewStats(int storeId) {
		return storeDao.selectStoreReviewStats(storeId);
	}

	public int insertReviewComment(Map<String, Object> payload) {
		if (payload == null || !payload.containsKey("orderId")) {
			return 0;
		}

		return storeDao.insertReviewComment(payload);
	}

	public List<StoreOperating> getStoreOperatingHours(Integer storeId) {
		return storeDao.getStoreOperatingHours(storeId);
	}

	public String getMemberIdByOrderId(Integer orderId) {
		return storeDao.getMemberIdByOrderId(orderId);
	}

	@Transactional
	public int updatePoint(Integer orderId) {
		int setPoint = storeDao.updatePoint(orderId);
		if (setPoint != 1) {
			return 0;
		}

		//  포인트 반영 성공 시에만 후속 적립/탄소 누적을 실행합니다.
		storeDao.pointReward(orderId);
		storeDao.addReduceCarbon(orderId);
		return setPoint;
	}

	public List<OrderResponse> getOrdersByStoreId(Integer storeId) {
		return storeDao.getOrdersByStoreId(storeId);
	}

	public List<StoreReviewResponse> selectStoreReviews(Integer storeId) {
		return storeDao.selectStoreReviews(storeId);
	}

	@Transactional // 도중에 에러나면 롤백되도록 트랜잭션 처리
	public void updateStoreInfoAndHours(StoreSaveRequest req) {
		if (req == null || req.getStoreId() == null) {
			throw new IllegalArgumentException("storeId는 필수입니다.");
		}

		// 1. STORE_TBL 정보 업데이트
		storeDao.updateStore(req);

		// 2. 기존 OPERATING_HOURS_TBL 정보 전체 삭제 (초기화)
		storeDao.deleteOperatingHours(req.getStoreId());

		// 3. 새 영업시간 데이터 구성
		List<StoreOperating> hoursList = new ArrayList<>();
		HoursInfo hoursInfo = req.getHoursInfo();
		if (hoursInfo == null || hoursInfo.getHoursType() == null) {
			return;
		}

		String[] allDays = { "mon", "tue", "wed", "thu", "fri", "sat", "sun" };

		// 3-1. 기본 영업시간 7일 세팅 (weekOfMonth = 0)
		for (String day : allDays) {
			StoreOperating dto = new StoreOperating();
			dto.setStoreId(req.getStoreId());
			dto.setDayOfWeek(day);
			dto.setWeekOfMonth(0); // 매주 기본값

			if (hoursInfo.getHoursType().equals("same")) {
				if (hoursInfo.is24h()) {
					dto.setOpenTime("00:00");
					dto.setCloseTime("24:00");
					dto.setIsDayOff("N");
				} else {
					Map<String, String> sameTime = hoursInfo.getSameTime();
					if (sameTime == null) {
						dto.setIsDayOff("Y");
					} else {
						dto.setOpenTime(sameTime.get("startH") + ":" + sameTime.get("startM"));
						dto.setCloseTime(sameTime.get("endH") + ":" + sameTime.get("endM"));
						dto.setIsDayOff("N");
					}
				}
			} else if (hoursInfo.getDiffTimes() != null) {
				DiffTime diffDay = hoursInfo.getDiffTimes().stream().filter(d -> day.equals(d.getDay())).findFirst()
						.orElse(null);

				if (diffDay != null && diffDay.isOpen()) {
					dto.setOpenTime(diffDay.getStartH() + ":" + diffDay.getStartM());
					dto.setCloseTime(diffDay.getEndH() + ":" + diffDay.getEndM());
					dto.setIsDayOff("N");
				} else {
					dto.setIsDayOff("Y");
				}
			} else {
				dto.setIsDayOff("Y");
			}
			hoursList.add(dto);
		}

		// 3-2. 정기 휴무일 추가 세팅 (restDays)
		if (hoursInfo.getRestDays() != null) {
			for (RestDay restDay : hoursInfo.getRestDays()) {
				StoreOperating dto = new StoreOperating();
				dto.setStoreId(req.getStoreId());
				dto.setDayOfWeek(restDay.getDay());
				dto.setIsDayOff("Y"); // 무조건 휴무

				// weekMonth 매핑 (week=0, month=0(특정 로직 필요시 조정), week2=1 등 프론트 값에 맞춰 파싱)
				int weekNum = parseWeekMonth(restDay.getWeekMonth());
				dto.setWeekOfMonth(weekNum);

				hoursList.add(dto);
			}
		}

		// 4. DB에 영업시간 리스트 반복 Insert
		for (StoreOperating hours : hoursList) {
			storeDao.insertOperatingHours(hours);
		}
	}

	private int parseWeekMonth(String val) {
		return switch (val) {
		case "week1" -> 1; // 첫째주
		case "week2" -> 2; // 둘째주
		case "week3" -> 3; // 셋째주
		case "week4" -> 4; // 넷째주
		default -> 0; // week(매주)
		};
	}

	// DAO의 매개변수가 Integer이므로 매개변수 타입을 Integer로 맞춥니다.
	public Store getStoreInfo(Integer storeId) {
		Store storeInfo = storeDao.findStoreById(storeId);

		if (storeInfo != null) {
			List<StoreOperating> hoursList = storeDao.getStoreOperatingHours(storeId);
			storeInfo.setOperatingHours(hoursList);
		}

		return storeInfo;
	}

	public Store getStoreLocation(Integer storeId) {
		return storeDao.getStoreLocation(storeId);
	}

}
