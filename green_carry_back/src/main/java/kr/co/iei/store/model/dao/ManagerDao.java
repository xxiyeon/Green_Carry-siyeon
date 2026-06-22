package kr.co.iei.store.model.dao;

import kr.co.iei.store.model.vo.Container;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.MenuSaveRequest;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface ManagerDao {
    List<Container> selectAllContainers();

    // 💡 [추가] 특정 메뉴에 맵핑된 옵션 목록 조회
    List<MenuOption> selectOptionsByMenuId(Long menuId);

    // 등록/수정
    int insertMenu(MenuSaveRequest request);
    int updateMenu(MenuSaveRequest request);

    // 신규 옵션 마스터 등록
    int insertNewOption(MenuOption option);

    // 매핑 (연결)
    int insertMenuOptionMap(Map<String, Object> map);
    int insertContainerMap(Map<String, Object> map);

    // 삭제 (수정 시 초기화용)
    int deleteMenuOptionMap(Long menuId);
    int deleteContainerMap(Long menuId);

    MenuSaveRequest selectMenuById(Long menuId);

    List<Container> selectContainersByMenuId(Long menuId);

    int updateMenuStatus(Map<String, Object> map);

    int deleteMenu(Long menuId);
}
