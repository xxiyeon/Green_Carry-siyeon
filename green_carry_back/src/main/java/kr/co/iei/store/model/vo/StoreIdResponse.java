package kr.co.iei.store.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("storeIdResponse")
public class StoreIdResponse {
	private Integer storeId;
}
