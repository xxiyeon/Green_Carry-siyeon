package kr.co.iei.container.controller;

import kr.co.iei.container.model.service.ContainerService;
import kr.co.iei.container.model.vo.ContainerVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/container")
@CrossOrigin(origins = "https://greencarry.vercel.app")
public class ContainerController {

    @Autowired
    private ContainerService containerService;

    @PostMapping("/register")
    public ResponseEntity<?> registerContainer(ContainerVo container) {
        try {
            int result = containerService.insertContainer(container);
            
            if (result > 0) {
                return ResponseEntity.ok("SUCCESS"); 
            } else {
                return ResponseEntity.badRequest().body("FAIL");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("SERVER_ERROR");
        }
    }
}
