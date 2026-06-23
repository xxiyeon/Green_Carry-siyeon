package kr.co.iei.admin.model.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.iei.admin.model.dao.ProductCarbonDao;
import kr.co.iei.admin.model.vo.ProductCarbon;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductCarbonService {
	private final ProductCarbonDao productCarbonDao;

	public List<ProductCarbon> getCarbonList() {
		return productCarbonDao.selectAllCarbon();
	}

	@Transactional
	public Integer updateProduct(ProductCarbon product) {
		if (product.getProductId() != null) {
			return productCarbonDao.updateCarbonProduct(product, null);
		}
		return productCarbonDao.insertCarbonProduct(product, null);
	}

	public Integer deleteCarbon(Integer productId) {
		return productCarbonDao.deleteCarbon(productId);
	}
}
