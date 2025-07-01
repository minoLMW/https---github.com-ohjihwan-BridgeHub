package com.koreait.apiserver.dao;

import com.koreait.apiserver.entity.BoardCategory;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface BoardCategoryDao {
    
    // 활성화된 카테고리 목록 조회 (정렬 순서대로)
    List<BoardCategory> selectAllActiveCategories();
    
    // 모든 카테고리 목록 조회 (관리자용)
    List<BoardCategory> selectAllCategories();
} 