package com.itss.projectmanagement.service;


import com.itss.projectmanagement.dto.common.PaginationResponse;
import com.itss.projectmanagement.dto.request.group.GroupCreateRequest;
import com.itss.projectmanagement.dto.request.group.GroupUpdateRequest;
import com.itss.projectmanagement.dto.response.group.GroupDTO;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

public interface IGroupService {
    /**
     * Create a new group for a project and return DTO
     * @param request the group creation request
     * @return the created group
     */
    GroupDTO createGroup(GroupCreateRequest request);

    GroupDTO joinGroup(Long groupId, Long projectId);

    /**
     * Auto-assign a user to a group in a project
     * @param projectId the project ID
     * @return the assigned group
     */
    GroupDTO autoAssignGroup(Long projectId);

    /**
     * Get all groups for a project as DTOs
     * @param projectId the project ID
     * @return list of groups
     */
    List<GroupDTO> getProjectGroups(Long projectId);

    /**
     * Get all groups for a project with pagination
     * @param projectId the project ID
     * @param page the page number
     * @param size the page size
     * @param sortBy the field to sort by
     * @param sortDirection the sort direction (ASC or DESC)
     * @return paginated list of groups
     */
    PaginationResponse<GroupDTO> getProjectGroupsPaginated(Long projectId, int page, int size, String sortBy, String sortDirection);

    /**
     * Get a group by ID as DTO
     * @param id the group ID
     * @return the group
     */
    GroupDTO getGroupById(Long id);

    /**
     * Get all groups that the current user is a member of
     * @return list of groups
     */
    List<GroupDTO> getCurrentUserGroups();

    /**
     * Get all groups led by the current user as DTOs
     * @return list of groups where the current user is leader
     */
    List<GroupDTO> getGroupsLedByCurrentUser();

    /**
     * Leave a group
     * @param groupId the group ID
     */
    @Transactional
    void leaveGroup(Long groupId);

    /**
     * Transfer group leadership and return DTO
     * @param groupId the group ID
     * @param newLeaderId the ID of the new leader
     * @return the updated group
     */
    @Transactional
    GroupDTO transferLeadership(Long groupId, Long newLeaderId);

    Set<User> getGroupMembers(Long groupId);
    /**
     * Update an existing group and return DTO
     * @param groupId the group ID
     * @param updateRequest the update request
     * @return the updated group
     */
    @Transactional
    GroupDTO updateGroup(Long groupId, GroupUpdateRequest updateRequest);

    /**
     * Delete a group and all its related entities (tasks, comments, commit records)
     * @param groupId the group ID to delete
     */
    @Transactional
    void deleteGroup(Long groupId);

    /**
     * Get group entity by ID (for internal service use)
     * @param groupId The group ID
     * @return The group entity
     * @throws ResourceNotFoundException if group not found
     */
    Group getGroupEntityById(Long groupId);

    /**
     * Get all groups in a project (for internal service use)
     * @param project The project entity
     * @return List of groups in the project
     */
    List<Group> getGroupsByProject(Project project);
}