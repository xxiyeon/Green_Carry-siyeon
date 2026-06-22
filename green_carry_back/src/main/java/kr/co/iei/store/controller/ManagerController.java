package kr.co.iei.store.controller;

import kr.co.iei.store.model.service.ManagerService;
import kr.co.iei.store.model.vo.Container;
import kr.co.iei.store.model.vo.MenuOption; // 추가
import kr.co.iei.store.model.vo.MenuSaveRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "https://greencarry.vercel.app")
@RestController
@RequestMapping("/menus")
public class ManagerController {
    @Autowired
    private ManagerService managerService;

    @GetMapping("/containers")
    public ResponseEntity<?> getContainers() {
        List<Container> list = managerService.getContainers();
        return ResponseEntity.ok(list);
    }

    // 💡 [추가] 특정 메뉴의 기존 옵션 목록 조회 (GET)
    @GetMapping("/{menuId}/options")
    public ResponseEntity<?> getMenuOptions(@PathVariable Long menuId) {
        List<MenuOption> options = managerService.getOptionsByMenuId(menuId);
        return ResponseEntity.ok(options);
    }

    // [추가] 메뉴 단건 조회
    @GetMapping("/{menuId}")
    public ResponseEntity<?> getMenuDetail(@PathVariable Long menuId) {
        MenuSaveRequest menu = managerService.getMenuById(menuId);
        return ResponseEntity.ok(menu);
    }

    // [추가] 메뉴별 용기 목록 조회
    @GetMapping("/{menuId}/containers")
    public ResponseEntity<?> getMenuContainers(@PathVariable Long menuId) {
        List<Container> containers = managerService.getContainersByMenuId(menuId);
        return ResponseEntity.ok(containers);
    }

    // 1. 새 메뉴 등록 (POST)
 // 1. 새 메뉴 등록 (POST)
    @PostMapping(value = "/{storeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> insertMenu(
            @PathVariable Long storeId, 
            @ModelAttribute MenuSaveRequest request) { //  @RequestBody 대신 @ModelAttribute 사용
        
        request.setStoreId(storeId);
        
        int result = managerService.insertMenuAll(request);
        return result > 0 ? ResponseEntity.ok().build() : ResponseEntity.internalServerError().build();
    }

    // 2. 기존 메뉴 수정 (PUT)
    @PostMapping(value = "/{storeId}/{menuId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateMenu(
            @PathVariable Long storeId,
            @PathVariable Long menuId,
            @ModelAttribute MenuSaveRequest request) { //  여기도 변경

        request.setStoreId(storeId);
        request.setMenuId(menuId);
        
        int result = managerService.updateMenuAll(request);
        return result > 0 ? ResponseEntity.ok().build() : ResponseEntity.internalServerError().build();
    }

    // [추가] 판매 상태 변경 (PATCH)
    @PatchMapping("/{menuId}/status")
    public ResponseEntity<?> updateMenuStatus(
            @PathVariable Long menuId,
            @RequestBody Map<String, Integer> body) {
        int result = managerService.updateMenuStatus(menuId, body.get("menuStatus"));
        return result > 0 ? ResponseEntity.ok().build() : ResponseEntity.internalServerError().build();
    }

    // [추가] 메뉴 완전 삭제 (DELETE)
    @DeleteMapping("/{menuId}")
    public ResponseEntity<?> deleteMenu(@PathVariable Long menuId) {
        int result = managerService.deleteMenu(menuId);
        return result > 0 ? ResponseEntity.ok().build() : ResponseEntity.internalServerError().build();
    }



}
