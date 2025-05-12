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
     * Check if a project exists with the given access code
     * @param accessCode The access code to check
     * @return True if a project with this access code exists
     */
    boolean existsByAccessCode(String accessCode);
    
    /**
     * Find a project by its access code
     * @param accessCode The access code to search for
     * @return The project, if found
     */
    Project findByAccessCode(String accessCode);
    
    /**
     * Find all active projects (projects that are not finalized)
     * @return List of active projects
     */
    @Query("SELECT p FROM Project p WHERE p.isFinalized = false")
    List<Project> findAllActiveProjects();
}