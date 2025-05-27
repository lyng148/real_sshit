package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.request.project.PressureScoreConfigRequest;
import com.itss.projectmanagement.dto.request.project.ProjectCreateRequest;
import com.itss.projectmanagement.dto.response.project.ProjectDTO;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;

import java.util.List;
import java.util.Optional;


public interface IProjectService {    
    /**
     * Create a new project for an instructor
     */
      ProjectDTO createProject(ProjectCreateRequest request);
      
    /**
     * Update an existing project
     */
    ProjectDTO updateProject(Long projectId, ProjectCreateRequest request);
      
    /**
     * Get project by ID
     */
    Optional<ProjectDTO> getProjectById(Long projectId);
      
    /**
     * Get all projects (for admin)
     */
    List<ProjectDTO> getAllProjects();
    
    /**
     * Get all projects created by the current instructor
     */
    List<ProjectDTO> getInstructorProjects();
    
    /**
     * Delete a project and all related entities
     */
    void deleteProject(Long projectId);
      
    /**
     * Update pressure score configuration for a project
     */
    ProjectDTO updatePressureScoreConfig(Long projectId, PressureScoreConfigRequest request);
    
    /**
     * Check if the current user is a leader of any group in the project
     * @param projectId The project ID to check
     * @return True if the user is a leader of any group in the project, false otherwise
     */
    boolean isUserGroupLeaderInProject(Long projectId);
    
    /**
     * Add student to project through direct invitation
     * @param projectId Project ID
     * @param usernames List of student usernames to invite
     * @return List of successfully invited students
     */
    List<User> inviteStudentsToProject(Long projectId, List<String> usernames);
      
    /**
     * Let a student join a project using access code
     * @param accessCode Project access code
     * @return The project the student joined
     */
    ProjectDTO joinProjectByAccessCode(String accessCode);
    
    /**
     * Get all projects a student has access to
     * @return List of projects the student has access to
     */
    List<ProjectDTO> getStudentProjects();
    
    /**
     * Check if a student can access a project
     * @param projectId The project ID to check
     * @param studentId The student ID to check
     * @return True if the student has access to the project
     */
    boolean canStudentAccessProject(Long projectId, Long studentId);
    
    /**
     * Remove a student from a project
     * @param projectId The project ID
     * @param studentId The student ID to remove
     */
    void removeStudentFromProject(Long projectId, Long studentId);
    
    /**
     * Get all students in a project
     * @param projectId The project ID
     * @return List of students in the project
     */
    List<User> getProjectStudents(Long projectId);
}