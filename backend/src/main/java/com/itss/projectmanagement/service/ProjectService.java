package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.request.project.PressureScoreConfigRequest;
import com.itss.projectmanagement.dto.request.project.ProjectCreateRequest;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserService userService;
    
    /**
     * Create a new project for an instructor
     */
    @Transactional
    public Project createProject(ProjectCreateRequest request) {
        // Check if project name already exists
        if (projectRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Project name already exists");
        }
        
        // Get the current authenticated user as instructor
        User instructor = getCurrentUser();
        
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .maxMembers(request.getMaxMembers())
                .evaluationCriteria(request.getEvaluationCriteria())
                .weightW1(request.getWeightW1())
                .weightW2(request.getWeightW2())
                .weightW3(request.getWeightW3())
                .weightW4(request.getWeightW4())
                .freeriderThreshold(request.getFreeriderThreshold())
                .pressureThreshold(request.getPressureThreshold())
                .instructor(instructor)
                .build();
        
        return projectRepository.save(project);
    }
    
    /**
     * Update an existing project
     */
    @Transactional
    public Project updateProject(Long projectId, ProjectCreateRequest request) {
        Project project = getProjectById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));
        
        // Verify the current user is the instructor of this project
        User currentUser = getCurrentUser();
        if (!Objects.equals(project.getInstructor().getId(), currentUser.getId())) {
            throw new IllegalArgumentException("Only the instructor who created the project can update it");
        }
        
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setMaxMembers(request.getMaxMembers());
        project.setEvaluationCriteria(request.getEvaluationCriteria());
        project.setWeightW1(request.getWeightW1());
        project.setWeightW2(request.getWeightW2());
        project.setWeightW3(request.getWeightW3());
        project.setWeightW4(request.getWeightW4());
        project.setFreeriderThreshold(request.getFreeriderThreshold());
        project.setPressureThreshold(request.getPressureThreshold());
        
        return projectRepository.save(project);
    }
    
    /**
     * Get project by ID
     */
    public Optional<Project> getProjectById(Long projectId) {
        return projectRepository.findById(projectId);
    }
    
    /**
     * Get all projects (for admin)
     */
    public List<Project> getAllProjects() {
        List<Project> projects = projectRepository.findAll();
        
        // Filter out projects with invalid instructor references
        return projects.stream()
                .filter(project -> project.getInstructor() != null 
                        && project.getInstructor().getId() != null 
                        && project.getInstructor().getId() > 0)
                .toList();
    }
    
    /**
     * Get all projects created by the current instructor
     */
    public List<Project> getInstructorProjects() {
        User instructor = getCurrentUser();
        return projectRepository.findByInstructor(instructor);
    }
    
    /**
     * Delete a project
     */
    @Transactional
    public void deleteProject(Long projectId) {
        Project project = getProjectById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));
        
        // Verify the current user is the instructor of this project
        User currentUser = getCurrentUser();
        if (!Objects.equals(project.getInstructor().getId(), currentUser.getId())) {
            throw new IllegalArgumentException("Only the instructor who created the project can delete it");
        }
        
        projectRepository.delete(project);
    }
    
    /**
     * Update pressure score configuration for a project
     */
    @Transactional
    public Project updatePressureScoreConfig(Long projectId, PressureScoreConfigRequest request) {
        Project project = getProjectById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));
        
        // Verify the current user is the instructor of this project
        User currentUser = getCurrentUser();
        if (!Objects.equals(project.getInstructor().getId(), currentUser.getId())) {
            throw new IllegalArgumentException("Only the instructor who created the project can update its configuration");
        }
        
        project.setPressureThreshold(request.getPressureThreshold());
        return projectRepository.save(project);
    }
    
    /**
     * Helper method to get the current authenticated user
     */
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Current user not found"));
    }
    
    /**
     * Validate if a GitHub URL is in the correct format
     */
    public boolean isValidGithubUrl(String url) {
        return url != null && url.matches("^https://github\\.com/[\\w-]+/[\\w-]+(\\.[\\w-]+)*$");
    }
}