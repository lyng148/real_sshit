package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.ContributionScore;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContributionScoreRepository extends JpaRepository<ContributionScore, Long> {
    
    List<ContributionScore> findByProject(Project project);
    
    List<ContributionScore> findByUser(User user);
    
    Optional<ContributionScore> findByUserAndProject(User user, Project project);
    
    List<ContributionScore> findByProjectAndIsFinalTrue(Project project);
    
    @Query("SELECT AVG(cs.calculatedScore) FROM ContributionScore cs WHERE cs.project.id = :projectId")
    Double calculateAverageScoreByProject(@Param("projectId") Long projectId);
    
    @Query("SELECT AVG(cs.calculatedScore) FROM ContributionScore cs WHERE cs.project.id = :projectId AND cs.user.id IN " +
           "(SELECT m.id FROM Group g JOIN g.members m WHERE g.id = :groupId)")
    Double calculateAverageScoreByGroup(@Param("projectId") Long projectId, @Param("groupId") Long groupId);
}