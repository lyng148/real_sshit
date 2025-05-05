package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByInstructor(User instructor);
    boolean existsByName(String name);
    
    /**
     * Find all active projects (projects that are not finalized)
     * @return List of active projects
     */
    @Query("SELECT p FROM Project p WHERE p.isFinalized = false")
    List<Project> findAllActiveProjects();
}