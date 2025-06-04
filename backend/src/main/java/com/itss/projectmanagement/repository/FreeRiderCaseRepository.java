package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.FreeRiderCase;

import com.itss.projectmanagement.enums.FreeRiderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FreeRiderCaseRepository extends JpaRepository<FreeRiderCase, Long> {
    
    List<FreeRiderCase> findByProject_Id(Long projectId);
    
    List<FreeRiderCase> findByStudent_Id(Long studentId);
    
    List<FreeRiderCase> findByGroup_Id(Long groupId);
    
    List<FreeRiderCase> findByProject_IdAndStudent_Id(Long projectId, Long studentId);
    
    List<FreeRiderCase> findByProject_IdAndStatus(Long projectId, FreeRiderStatus status);
    
    List<FreeRiderCase> findByGroup_IdAndStatus(Long groupId, FreeRiderStatus status);
    
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN TRUE ELSE FALSE END FROM FreeRiderCase c WHERE c.project.id = ?1 AND c.student.id = ?2 AND c.status <> com.itss.projectmanagement.enums.FreeRiderStatus.RESOLVED")
    boolean existsActiveCase(Long projectId, Long studentId);
}
