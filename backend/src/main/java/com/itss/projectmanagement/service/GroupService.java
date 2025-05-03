package com.itss.projectmanagement.service;

import com.itss.projectmanagement.converter.GroupConverter;
import com.itss.projectmanagement.dto.GroupCreateRequest;
import com.itss.projectmanagement.dto.GroupUpdateRequest;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.enums.Role;
import com.itss.projectmanagement.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final GroupConverter groupConverter;

    /**
     * Create a new group for a project
     * @param request the group creation request
     * @return the created group
     */
    @Transactional
    public Group createGroup(GroupCreateRequest request) {
        // Get current user
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        
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
        
        // Create the group
        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .project(project)
                .leader(currentUser)
                .members(new HashSet<>(Collections.singletonList(currentUser)))
                .build();
        
        return groupRepository.save(group);
    }

    /**
     * Join an existing group
     * @param groupId the group ID
     * @param projectId the project ID
     * @return the updated group
     */
    @Transactional
    public Group joinGroup(Long groupId, Long projectId) {
        // Get current user
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        
        // Get the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        // Check if user is already in a group for this project
        if (groupRepository.isUserInAnyGroupForProject(currentUser, project)) {
            throw new IllegalStateException("You are already in a group for this project");
        }
        
        // Get the group and check if it belongs to the project
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        
        if (!group.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Group does not belong to the specified project");
        }
        
        // Check if group is full
        if (group.getMembers().size() >= project.getMaxMembers()) {
            throw new IllegalStateException("Group is already full");
        }
        
        // Add user to the group
        group.getMembers().add(currentUser);
        return groupRepository.save(group);
    }

    /**
     * Auto-assign a user to a group in a project
     * @param projectId the project ID
     * @return the assigned group
     */
    @Transactional
    public Group autoAssignGroup(Long projectId) {
        // Get current user
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        
        // Get the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        // Check if user is already in a group for this project
        if (groupRepository.isUserInAnyGroupForProject(currentUser, project)) {
            throw new IllegalStateException("You are already in a group for this project");
        }
        
        // Find groups with available space
        List<Group> availableGroups = groupRepository.findGroupsWithAvailableSpace(project, project.getMaxMembers());
        
        // If no groups available, create a new one
        if (availableGroups.isEmpty()) {
            Group newGroup = Group.builder()
                    .name("Auto-created Group " + UUID.randomUUID().toString().substring(0, 6))
                    .description("Automatically created group")
                    .project(project)
                    .leader(currentUser)
                    .members(new HashSet<>(Collections.singletonList(currentUser)))
                    .build();
            
            return groupRepository.save(newGroup);
        }
        
        // Sort groups by member count to balance distribution
        availableGroups.sort(Comparator.comparing(group -> group.getMembers().size()));
        
        // Add user to the group with fewest members
        Group selectedGroup = availableGroups.get(0);
        selectedGroup.getMembers().add(currentUser);
        
        return groupRepository.save(selectedGroup);
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
        
        // Students can only see groups they are part of
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        
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
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
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
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        return groupRepository.findByMember(currentUser);
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
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
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
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
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
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        
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
        if (updateRequest.getLeaderId() != null && (isInstructor || isGroupLeader)) {
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
}