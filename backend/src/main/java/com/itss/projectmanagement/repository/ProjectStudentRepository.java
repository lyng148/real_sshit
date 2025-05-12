package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.ProjectStudent;
import com.itss.projectmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectStudentRepository extends JpaRepository<ProjectStudent, Long> {
    
    List<ProjectStudent> findByStudent(User student);
    
    List<ProjectStudent> findByProject(Project project);
    
    Optional<ProjectStudent> findByProjectAndStudent(Project project, User student);
    
    @Query("SELECT CASE WHEN COUNT(ps) > 0 THEN TRUE ELSE FALSE END FROM ProjectStudent ps WHERE ps.project = :project AND ps.student = :student")
    boolean existsByProjectAndStudent(@Param("project") Project project, @Param("student") User student);
    
    void deleteByProjectAndStudent(Project project, User student);
}
