package kr.co.iei.admin.model.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.multipart.MultipartFile;

import kr.co.iei.admin.model.vo.ProductCarbon;

@Mapper
public interface ProductCarbonDao {
	List<ProductCarbon> selectAllCarbon();

	Integer updateCarbonProduct(@Param("product") ProductCarbon product, @Param("uploadFile") MultipartFile uploadFile);

	Integer insertCarbonProduct(@Param("product") ProductCarbon product, @Param("uploadFile") MultipartFile uploadFile);

	Integer deleteCarbon(Integer productId);
}
