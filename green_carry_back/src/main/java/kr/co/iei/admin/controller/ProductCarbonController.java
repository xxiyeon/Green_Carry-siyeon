package kr.co.iei.admin.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import kr.co.iei.admin.model.service.ProductCarbonService;
import kr.co.iei.admin.model.vo.ProductCarbon;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "https://greencarry.vercel.app")
@RequestMapping("/carbon-list")
@RequiredArgsConstructor
public class ProductCarbonController {
    private static final String STORE_IMAGE_FOLDER = "projet/upload/web/container";

    private final ProductCarbonService productCarbonService;
    @Autowired
    private Cloudinary cloudinary;

    @GetMapping
    public ResponseEntity<?> getCarbonList() {
        List<ProductCarbon> list = productCarbonService.getCarbonList();
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteContainer(@PathVariable Integer productId) {
        int result = productCarbonService.deleteCarbon(productId);

        if (result > 0) {
            return ResponseEntity.ok("SUCCESS");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("FAIL");
        }
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateCarbon(
            @ModelAttribute ProductCarbon product,
            @RequestParam(value = "uploadFile", required = false) MultipartFile uploadFile) {
        try {
            //  용기 이미지는 컨트롤러에서 바로 Cloudinary 업로드 처리
            if (uploadFile != null && !uploadFile.isEmpty()) {
                Map uploadParams = ObjectUtils.asMap(
                        "folder", STORE_IMAGE_FOLDER,
                        "use_filename", true,
                        "unique_filename", true);

                Map uploadResult = cloudinary.uploader().upload(uploadFile.getBytes(), uploadParams);
                String productImg = (String) uploadResult.get("secure_url");
                product.setProductImg(productImg);
            }

            Integer result = productCarbonService.updateProduct(product);

            if (result > 0) {
                return ResponseEntity.ok("SUCCESS");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("FAIL");
            }
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("FILE_UPLOAD_FAIL");
        }
    }
}
