package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.converter.GroupConverter;
import com.itss.projectmanagement.dto.request.group.GroupCreateRequest;
import com.itss.projectmanagement.dto.request.group.GroupUpdateRequest;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.enums.Role;
import com.itss.projectmanagement.service.IGroupService;
import com.itss.projectmanagement.utils.SecurityUtils;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class GroupServiceImpl implements IGroupService {

    private final GroupRepository groupRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final GroupConverter groupConverter;
    @Autowired
    private EntityManager entityManager;

    /**
     * Create a new group for a project
     * @param request the group creation request
     * @return the created group
     */
    @Transactional
    public Group createGroup(GroupCreateRequest request) {
        // Get current user
        User currentUser = SecurityUtils.getCurrentUser();

        // Get the project
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        // Check if user is already in a group for this project
        if (groupRepository.isUserInAnyGroupForProject(currentUser, project)) {
            throw new IllegalStateException("You are already in a group for this project");
        }

        // Check if group name is already taken in this project
        if (groupRepository.findByNameAndProject(request.getName(), project).isPresent()) {
            throw new IllegalArgumentException("Group name already exists in this project");
        }

        // check if repo url have already been used
        if (groupRepository.findByRepositoryUrlAndProject(request.getRepositoryUrl(), project).isPresent()) {
            throw new IllegalArgumentException("Repository URL already exists in this project");
        }

        // Create the group
        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .repositoryUrl(request.getRepositoryUrl())
                .project(project)
                .leader(currentUser)
                .members(new HashSet<>(Collections.singletonList(currentUser)))
                .build();

        return groupRepository.save(group);
    }

    @Transactional
    public Group joinGroup(Long groupId, Long projectId) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User not found");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        // Check if user is already in ANY group for this project
        if (groupRepository.isUserInAnyGroupForProject(currentUser, project)) {
            throw new IllegalStateException("You are already in a group for this project");
        }

        Group group = entityManager.createQuery(
                        "SELECT g FROM Group g LEFT JOIN FETCH g.members WHERE g.id = :groupId",
                        Group.class)
                .setParameter("groupId", groupId)
                .getSingleResult();

        if (!group.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Group does not belong to the specified project");
        }

        if (group.getMembers().size() >= project.getMaxMembers()) {
            throw new IllegalStateException("Group is already full");
        }

        // Use the safe method to add user to group
        return safelyAddUserToGroup(groupId, currentUser.getId());
    }

    /**
     * Auto-assign a user to a group in a project
     * @param projectId the project ID
     * @return the assigned group
     */
    @Transactional
    public Group autoAssignGroup(Long projectId) {
        // Get current user
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User not found");
        }

        // Get the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        // Check if user is already in a group for this project
        if (groupRepository.isUserInAnyGroupForProject(currentUser, project)) {
            throw new IllegalStateException("You are already in a group for this project");
        }

        // Find groups with available space
        List<Group> availableGroups = groupRepository.findGroupsWithAvailableSpace(project, project.getMaxMembers());

        // If no groups available, throw exception
        if (availableGroups.isEmpty()) {
            throw new IllegalStateException("No available groups to join");
        }

        // Sort groups by member count to balance distribution
        availableGroups.sort(Comparator.comparing(group -> group.getMembers().size()));

        // Get the group with the fewest members
        Long selectedGroupId = availableGroups.get(0).getId();

        // Use the safe method to add user to group
        return safelyAddUserToGroup(selectedGroupId, currentUser.getId());
    }

    /**
     * Get all groups for a project
     * @param projectId the project ID
     * @return list of groups
     */
    public List<Group> getProjectGroups(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        // Admin and instructor can see all groups
        if (SecurityUtils.hasAnyRole(Role.ADMIN, Role.INSTRUCTOR)) {
            return groupRepository.findByProject(project);
        }

        // Students can see all groups if they haven't joined any group for this project
        User currentUser = SecurityUtils.getCurrentUser();
        boolean isUserInAnyGroupForThisProject = groupRepository.isUserInAnyGroupForProject(currentUser, project);

        if (!isUserInAnyGroupForThisProject) {
            // Student hasn't joined any group for this project, show all groups
            return groupRepository.findByProject(project);
        }

        // Otherwise, students can only see groups they are part of
        return groupRepository.findByMember(currentUser).stream()
                .filter(group -> group.getProject().getId().equals(projectId))
                .collect(Collectors.toList());
    }

    /**
     * Get a group by ID
     * @param groupId the group ID
     * @return the group
     */
    public Group getGroupById(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        // Admin and instructor can view any group
        if (SecurityUtils.hasAnyRole(Role.ADMIN, Role.INSTRUCTOR)) {
            return group;
        }

        // Students can only view groups they are part of
        User currentUser = SecurityUtils.getCurrentUser();

        if (Objects.equals(group.getLeader().getId(), currentUser.getId())) {
            return group;
        }

        if (group.getMembers().contains(currentUser)) {
            return group;
        }

        throw new IllegalStateException("You don't have permission to view this group");
    }

    /**
     * Get all groups that the current user is a member of
     * @return list of groups
     */
    public List<Group> getCurrentUserGroups() {
        User currentUser = SecurityUtils.getCurrentUser();
        return groupRepository.findByMember(currentUser);
    }

    /**
     * Get all groups led by the current user
     * @return list of groups where the current user is leader
     */
    public List<Group> getGroupsLedByCurrentUser() {
        User currentUser = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return groupRepository.findByLeader(currentUser);
    }

    /**
     * Check if a user is the leader of a group
     * @param groupId the group ID
     * @param userId the user ID
     * @return true if the user is the leader
     */
    public boolean isGroupLeader(Long groupId, Long userId) {
        return groupRepository.findById(groupId)
                .map(group -> group.getLeader() != null && group.getLeader().getId().equals(userId))
                .orElse(false);
    }

    /**
     * Leave a group
     * @param groupId the group ID
     */
    @Transactional
    public void leaveGroup(Long groupId) {
        User currentUser = SecurityUtils.getCurrentUser();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        // Check if user is in the group
        if (!group.getMembers().contains(currentUser)) {
            throw new IllegalStateException("You are not a member of this group");
        }

        // Check if user is the leader
        if (group.getLeader() != null && group.getLeader().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("Group leader cannot leave the group. Transfer leadership first.");
        }

        // Remove user from group
        group.getMembers().remove(currentUser);
        groupRepository.save(group);
    }

    /**
     * Transfer group leadership
     * @param groupId the group ID
     * @param newLeaderId the ID of the new leader
     * @return the updated group
     */
    @Transactional
    public Group transferLeadership(Long groupId, Long newLeaderId) {
        User currentUser = SecurityUtils.getCurrentUser();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        // Check if current user is the leader
        if (group.getLeader() == null || !group.getLeader().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("Only the current leader can transfer leadership");
        }

        // Get the new leader
        User newLeader = userRepository.findById(newLeaderId)
                .orElseThrow(() -> new IllegalArgumentException("New leader not found"));

        // Check if new leader is a member of the group
        if (!group.getMembers().contains(newLeader)) {
            throw new IllegalArgumentException("New leader must be a member of the group");
        }

        // Transfer leadership
        group.setLeader(newLeader);
        return groupRepository.save(group);
    }

    /**
     * Update an existing group
     * @param groupId the group ID
     * @param updateRequest the update request
     * @return the updated group
     */
    @Transactional
    public Group updateGroup(Long groupId, GroupUpdateRequest updateRequest) {
        // Get current user
        User currentUser = SecurityUtils.getCurrentUser();

        // Get the group
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        // Check permissions: only group leader or instructor can update the group
        boolean isInstructor = SecurityUtils.hasAnyRole(Role.INSTRUCTOR);
        boolean isGroupLeader = group.getLeader() != null && group.getLeader().getId().equals(currentUser.getId());

        if (!isInstructor && !isGroupLeader) {
            throw new IllegalStateException("Only group leader or instructor can update the group");
        }

        // Check if name is already taken (if name is being updated)
        if (updateRequest.getName() != null && !updateRequest.getName().equals(group.getName())) {
            if (groupRepository.findByNameAndProject(updateRequest.getName(), group.getProject()).isPresent()) {
                throw new IllegalArgumentException("Group name already exists in this project");
            }
        }

        // Process leader change if requested
        User newLeader = null;
        if (updateRequest.getLeaderId() != null) {
            newLeader = userRepository.findById(updateRequest.getLeaderId())
                    .orElseThrow(() -> new IllegalArgumentException("New leader not found"));

            // Check if new leader is a member of the group
            if (!group.getMembers().contains(newLeader)) {
                throw new IllegalArgumentException("New leader must be a member of the group");
            }
        }

        // Apply updates
        group = groupConverter.applyUpdateToEntity(group, updateRequest, newLeader);

        return groupRepository.save(group);
    }

    /**
     * Delete a group and all its related entities (tasks, comments, commit records)
     * @param groupId the group ID to delete
     */
    @Transactional
    public void deleteGroup(Long groupId) {
        // Get current user
        User currentUser = SecurityUtils.getCurrentUser();

        // Get the group
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        // Check permissions: only group leader or instructor or admin can delete the group
        boolean isAdmin = SecurityUtils.hasAnyRole(Role.ADMIN);
        boolean isInstructor = SecurityUtils.hasAnyRole(Role.INSTRUCTOR);
        boolean isProjectInstructor = isInstructor &&
                Objects.equals(group.getProject().getInstructor().getId(), currentUser.getId());
        boolean isGroupLeader = group.getLeader() != null &&
                Objects.equals(group.getLeader().getId(), currentUser.getId());

        if (!isAdmin && !isProjectInstructor && !isGroupLeader) {
            throw new IllegalStateException("Only group leader, project instructor or admin can delete the group");
        }

        groupRepository.delete(group);
    }

    /**
     * Helper method to safely add a user to a group
     * Uses direct SQL to bypass Hibernate's session cache issues
     * @param groupId the group ID
     * @param userId the user ID
     * @return the updated group
     */
    @Transactional
    protected Group safelyAddUserToGroup(Long groupId, Long userId) {
        // First check if user is already in the group using native SQL
        String checkQuery = "SELECT COUNT(*) FROM group_members WHERE group_id = ? AND user_id = ?";
        Object result = entityManager.createNativeQuery(checkQuery)
                .setParameter(1, groupId)
                .setParameter(2, userId)
                .getSingleResult();

        if (((Number) result).intValue() > 0) {
            // User is already in this group, just return it
            return groupRepository.findById(groupId)
                    .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        }

        // User is not in the group, add them using native SQL
        String insertQuery = "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)";
        try {
            entityManager.createNativeQuery(insertQuery)
                    .setParameter(1, groupId)
                    .setParameter(2, userId)
                    .executeUpdate();

            // Clear persistence context to ensure fresh data
            entityManager.flush();
            entityManager.clear();

            // Return updated group
            return groupRepository.findById(groupId)
                    .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        } catch (Exception e) {
            // If insertion fails due to duplicate (race condition), return the group without changes
            if (e.getMessage() != null && e.getMessage().contains("Duplicate")) {
                return groupRepository.findById(groupId)
                        .orElseThrow(() -> new IllegalArgumentException("Group not found"));
            }
            throw e;
        }
    }
}