package kr.co.iei.store.model.service;

import kr.co.iei.store.model.dao.ManagerDao;
import kr.co.iei.store.model.vo.Container;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.MenuSaveRequest;
import tools.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ManagerService {
	private static final String EMPTY_JSON_ARRAY = "[]";

	@Autowired
	private Cloudinary cloudinary;

	@Autowired
	private ManagerDao managerDao;

	public List<Container> getContainers() {
		return managerDao.selectAllContainers();
	}

	// 💡 [추가] 메뉴 ID로 기존 옵션 목록 조회
	public List<MenuOption> getOptionsByMenuId(Long menuId) {
		return managerDao.selectOptionsByMenuId(menuId);
	}

	@Transactional
	public int insertMenuAll(MenuSaveRequest request) {
		//  저장 실패 시 연관 데이터 저장을 건너뛰어 트랜잭션 경계를 명확히 했습니다.
		//  1. DB 삽입 전, 사진 파일이 있다면 하드디스크에 저장하고 경로를 DTO에 세팅
		saveImageFile(request);

		// 2. 메뉴 기본 정보 삽입 (DB 컬럼에는 사진 경로 문자열이 들어감)
		int result = managerDao.insertMenu(request);
		if (result <= 0 || request.getMenuId() == null) {
			return result;
		}

		// 3. 연관 데이터 저장
		saveMenuRelations(request, request.getMenuId());

		return result;
	}

	// --- [2. 메뉴 수정 로직] ---
	@Transactional
	public int updateMenuAll(MenuSaveRequest request) {
		//  1. 사진 수정이 발생했다면 새 사진을 저장하고 DTO에 경로 세팅
		saveImageFile(request);

		// 2. 메뉴 기본 정보 업데이트
		int result = managerDao.updateMenu(request);
		if (result <= 0 || request.getMenuId() == null) {
			return result;
		}

		// 3. 기존 연결(매핑) 데이터 일괄 삭제
		managerDao.deleteMenuOptionMap(request.getMenuId());
		managerDao.deleteContainerMap(request.getMenuId());

		// 4. 연관 데이터 다시 저장
		saveMenuRelations(request, request.getMenuId());

		return result;
	}

	private void saveImageFile(MenuSaveRequest request) {
		MultipartFile file = request.getMenuImage();

		if (file != null && !file.isEmpty()) {
			try {
				// 1. Cloudinary 업로드 설정 (스크린샷에서 보여주신 경로 사용)
				// "projet/upload/web/menu" 폴더로 지정
				Map uploadParams = ObjectUtils.asMap("folder", "projet/upload/web/menu", "use_filename", true,
						"unique_filename", true);

				// 2. Cloudinary로 업로드 실행
				Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);

				// 3. 업로드된 결과에서 URL(또는 secure_url) 추출
				// 기존: "/uploads/menu/UUID.jpg" -> 변경: "https://res.cloudinary.com/..."
				String menuThumb = (String) uploadResult.get("secure_url");

				// 4. DTO에 세팅 (이제 DB에는 클라우드 주소가 들어갑니다)
				request.setMenuImagePath(menuThumb);

			} catch (IOException e) {
				e.printStackTrace();
				throw new RuntimeException("Cloudinary 사진 저장 중 오류가 발생했습니다.", e);
			}
		}
	}

	// --- [공통] 옵션 및 용기 매핑 로직 ---
	private void saveMenuRelations(MenuSaveRequest request, Long menuId) {
		// JSON 문자열을 자바 객체로 변환해주는 도구
		ObjectMapper mapper = new ObjectMapper();

		try {
			// A. 기존 옵션 연결 (String "[1, 2, 3]" -> Long[] 변환)
			if (hasJsonArrayContent(request.getOptionIds())) {
				Long[] optionIdArray = mapper.readValue(request.getOptionIds(), Long[].class);
				for (Long optionNo : optionIdArray) {
					Map<String, Object> map = new HashMap<>();
					map.put("menuId", menuId);
					map.put("optionNo", optionNo);
					managerDao.insertMenuOptionMap(map);
				}
			}

			// B. 신규 생성 옵션 추가 및 연결 (String "[{...}]" -> MenuOption[] 변환)
			if (hasJsonArrayContent(request.getNewOptions())) {
				MenuOption[] newOptionArray = mapper.readValue(request.getNewOptions(), MenuOption[].class);
				for (MenuOption opt : newOptionArray) {
					managerDao.insertNewOption(opt); // 옵션 마스터 테이블 등록

					Map<String, Object> map = new HashMap<>();
					map.put("menuId", menuId);
					map.put("optionNo", opt.getOptionNo());
					managerDao.insertMenuOptionMap(map); // 매핑 테이블 연결
				}
			}

			// C. 용기 매핑 (String "[{...}]" -> ContainerItem[] 변환)
			if (hasJsonArrayContent(request.getContainerMap())) {
				MenuSaveRequest.ContainerItem[] containerArray = mapper.readValue(request.getContainerMap(),
						MenuSaveRequest.ContainerItem[].class);
				for (MenuSaveRequest.ContainerItem item : containerArray) {
					Map<String, Object> map = new HashMap<>();
					map.put("menuId", menuId);
					map.put("productId", item.getProductId());
					map.put("count", item.getCount());
					managerDao.insertContainerMap(map);
				}
			}
		} catch (Exception e) {
			// JSON 변환 중 에러 발생 시 트랜잭션 롤백을 위해 예외 던짐
			e.printStackTrace();
			throw new RuntimeException("연관 데이터(옵션/용기) 변환 중 오류가 발생했습니다.", e);
		}
	}

	private boolean hasJsonArrayContent(String rawValue) {
		return rawValue != null && !rawValue.isBlank() && !EMPTY_JSON_ARRAY.equals(rawValue.trim());
	}

	// [추가] 메뉴 단건 조회
	public MenuSaveRequest getMenuById(Long menuId) {
		return managerDao.selectMenuById(menuId);
	}

	// [추가] 메뉴별 용기 목록 조회
	public List<Container> getContainersByMenuId(Long menuId) {
		return managerDao.selectContainersByMenuId(menuId);
	}

	public int updateMenuStatus(Long menuId, int menuStatus) {
		Map<String, Object> map = new HashMap<>();
		map.put("menuId", menuId);
		map.put("menuStatus", menuStatus);
		return managerDao.updateMenuStatus(map);
	}

	@Transactional
	public int deleteMenu(Long menuId) {
		managerDao.deleteMenuOptionMap(menuId); // 기존 메서드 재활용
		managerDao.deleteContainerMap(menuId); // 기존 메서드 재활용
		return managerDao.deleteMenu(menuId);
	}
}
