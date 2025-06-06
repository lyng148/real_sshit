package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.dto.request.project.ProjectCreateRequest;
import com.itss.projectmanagement.dto.response.project.ProjectDTO;
import com.itss.projectmanagement.converter.ProjectConverter;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.ProjectStudent;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.exception.ResourceNotFoundException;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.ProjectStudentRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.enums.Role;
import com.itss.projectmanagement.service.IProjectService;
import com.itss.projectmanagement.service.IUserService;
import com.itss.projectmanagement.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ProjectServiceImpl implements IProjectService {    
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private IUserService userService;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private ProjectStudentRepository projectStudentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectConverter projectConverter;    
    
    /**
     * Create a new project for an instructor
     */
    @Transactional
    public ProjectDTO createProject(ProjectCreateRequest request) {
        // Check if project name already exists
        if (projectRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Project name already exists");
        }

        // Get the current authenticated user as instructor
        User instructor = getCurrentUser();

        // Generate a unique access code for this project
        String accessCode = generateUniqueAccessCode();

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
                .accessCode(accessCode)
                .build();

        Project savedProject = projectRepository.save(project);
        return projectConverter.toDTO(savedProject);
    }    
    
    /**
     * Update an existing project
     */
    @Transactional
    public ProjectDTO updateProject(Long projectId, ProjectCreateRequest request) {
        Project project = projectRepository.findById(projectId)
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

        Project updatedProject = projectRepository.save(project);
        return projectConverter.toDTO(updatedProject);
    }    
    
    /**
     * Get project by ID
     */
    public Optional<ProjectDTO> getProjectById(Long projectId) {
        return projectRepository.findById(projectId)
                .map(projectConverter::toDTO);
    }    
    
    /**
     * Get all projects (for admin)
     */
    public List<ProjectDTO> getAllProjects() {
        List<Project> projects = projectRepository.findAll();

        // Filter out projects with invalid instructor references
        List<Project> validProjects = projects.stream()
                .filter(project -> project.getInstructor() != null
                        && project.getInstructor().getId() != null
                        && project.getInstructor().getId() > 0)
                .toList();
        
        return projectConverter.toDTO(validProjects);
    }

    /**
     * Get all projects created by the current instructor
     */
    public List<ProjectDTO> getInstructorProjects() {
        User instructor = getCurrentUser();
        List<Project> projects = projectRepository.findByInstructor(instructor);
        return projectConverter.toDTO(projects);
    }    
    
    /**
     * Delete a project and all related entities
     */
    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        // Verify the current user is the instructor of this project
        User currentUser = getCurrentUser();
        if (!Objects.equals(project.getInstructor().getId(), currentUser.getId())) {
            throw new IllegalArgumentException("Only the instructor who created the project can delete it");
        }

        // With cascading delete configured in entities, this will automatically:
        // 1. Delete all groups in the project
        // 2. Delete all tasks in those groups
        // 3. Delete all comments on those tasks
        // 4. Delete all commit records for those groups
        // 5. Delete all peer reviews for the project
        projectRepository.delete(project);
    }
    
    /**
     * Check if the current user is a leader of any group in the project
     * @param projectId The project ID to check
     * @return True if the user is a leader of any group in the project, false otherwise
     */
    public boolean isUserGroupLeaderInProject(Long projectId) {
        if (projectId == null) {
            log.warn("Project ID is null in isUserGroupLeaderInProject");
            return false;
        }
        
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                log.warn("Current user is null in isUserGroupLeaderInProject");
                return false;
            }
            
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

            List<Group> projectGroups = groupRepository.findByProject(project);
            if (projectGroups.isEmpty()) {
                log.debug("No groups found for project {}", projectId);
                return false;
            }

            return projectGroups.stream()
                    .anyMatch(group -> group.getLeader() != null &&
                            Objects.equals(group.getLeader().getId(), currentUser.getId()));
        } catch (Exception e) {
            log.error("Error checking if user is group leader in project {}: {}", projectId, e.getMessage());
            return false;
        }
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
     * Generate a unique random access code for a project
     * @return a unique 8-character alphanumeric access code
     */
    private String generateUniqueAccessCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(8);

        boolean isUnique = false;
        String code = "";

        while (!isUnique) {
            // Generate an 8-character code
            sb.setLength(0);
            for (int i = 0; i < 8; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }

            code = sb.toString();

            // Check if the code is already used
            boolean exists = projectRepository.existsByAccessCode(code);
            if (!exists) {
                isUnique = true;
            }
        }

        return code;
    }

    /**
     * Add student to project through direct invitation
     * @param projectId Project ID
     * @param usernames List of student usernames to invite
     * @return List of successfully invited students
     */
    @Transactional
    public List<User> inviteStudentsToProject(Long projectId, List<String> usernames) {
        // Get the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        // Verify that current user is either admin or the instructor who created the project
        User currentUser = getCurrentUser();
        boolean isAdmin = SecurityUtils.hasAnyRole(Role.ADMIN);
        boolean isProjectInstructor = project.getInstructor().getId().equals(currentUser.getId());

        if (!isAdmin && !isProjectInstructor) {
            throw new IllegalArgumentException("Only project instructor or admin can invite students");
        }

        // Find existing users by username
        List<User> studentsToInvite = userRepository.findByUsernameIn(usernames);

        // Validate all users have STUDENT role
        List<User> nonStudentUsers = studentsToInvite.stream()
                .filter(user -> !user.getRoles().contains(Role.STUDENT))
                .toList();

        if (!nonStudentUsers.isEmpty()) {
            throw new IllegalArgumentException(
                    "The following users are not students: " +
                            nonStudentUsers.stream().map(User::getUsername).collect(Collectors.joining(", ")));
        }

        // Add students to project
        List<User> invitedStudents = new ArrayList<>();
        for (User student : studentsToInvite) {
            // Check if student is already invited
            boolean alreadyInvited = projectStudentRepository.existsByProjectAndStudent(project, student);
            if (!alreadyInvited) {
                ProjectStudent projectStudent = ProjectStudent.builder()
                        .project(project)
                        .student(student)
                        .build();

                projectStudentRepository.save(projectStudent);
                invitedStudents.add(student);
            }
        }

        return invitedStudents;
    }    
    
    /**
     * Let a student join a project using access code
     * @param accessCode Project access code
     * @return The project the student joined
     */
    @Transactional
    public ProjectDTO joinProjectByAccessCode(String accessCode) {
        // Get current user (must be a student)
        User student = getCurrentUser();
        if (!SecurityUtils.hasAnyRole(Role.STUDENT)) {
            throw new IllegalArgumentException("Only students can join projects using access codes");
        }

        // Find project by access code
        Project project = projectRepository.findByAccessCode(accessCode);
        if (project == null) {
            throw new IllegalArgumentException("Invalid project access code");
        }

        // Check if student is already in the project
        boolean alreadyInvited = projectStudentRepository.existsByProjectAndStudent(project, student);
        if (alreadyInvited) {
            throw new IllegalStateException("You are already invited to this project");
        }

        // Add student to project
        ProjectStudent projectStudent = ProjectStudent.builder()
                .project(project)
                .student(student)
                .build();

        projectStudentRepository.save(projectStudent);

        return projectConverter.toDTO(project);
    }    
    
    /**
     * Get all projects a student has access to
     * @return List of projects the student has access to
     */
    public List<ProjectDTO> getStudentProjects() {
        User student = getCurrentUser();
        if (!SecurityUtils.hasAnyRole(Role.STUDENT)) {
            throw new IllegalArgumentException("This method is only for students");
        }

        List<ProjectStudent> projectStudents = projectStudentRepository.findByStudent(student);
        List<Project> projects = projectStudents.stream()
                .map(ProjectStudent::getProject)
                .collect(Collectors.toList());
        
        return projectConverter.toDTO(projects);
    }

    /**
     * Remove a student from a project
     * @param projectId The project ID
     * @param studentId The student ID to remove
     */
    @Transactional
    public void removeStudentFromProject(Long projectId, Long studentId) {
        // Get the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        // Verify that current user is either admin or the instructor who created the project
        User currentUser = getCurrentUser();
        boolean isAdmin = SecurityUtils.hasAnyRole(Role.ADMIN);
        boolean isProjectInstructor = project.getInstructor().getId().equals(currentUser.getId());

        if (!isAdmin && !isProjectInstructor) {
            throw new IllegalArgumentException("Only project instructor or admin can remove students");
        }

        // Get the student
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        // Remove the student from the project
        ProjectStudent projectStudent = projectStudentRepository.findByProjectAndStudent(project, student)
                .orElseThrow(() -> new IllegalArgumentException("Student is not invited to this project"));

        projectStudentRepository.delete(projectStudent);
    }

    /**
     * Get all students in a project
     * @param projectId The project ID
     * @return List of students in the project
     */
    public List<User> getProjectStudents(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));
        
        List<ProjectStudent> projectStudents = projectStudentRepository.findByProject(project);
        return projectStudents.stream()
                .map(ProjectStudent::getStudent)
                .collect(Collectors.toList());
    }

    @Override
    public Project getProjectEntityById(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
    }
}