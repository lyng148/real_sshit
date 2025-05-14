package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.request.group.GroupCreateRequest;
import com.itss.projectmanagement.dto.request.group.GroupUpdateRequest;
import com.itss.projectmanagement.entity.Group;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

public interface IGroupService {
    /**
     * Create a new group for a project
     * @param request the group creation request
     * @return the created group
     */
    Group createGroup(GroupCreateRequest request);

    Group joinGroup(Long groupId, Long projectId);

    /**
     * Auto-assign a user to a group in a project
     * @param projectId the project ID
     * @return the assigned group
     */
    Group autoAssignGroup(Long projectId);

    /**
     * Get all groups for a project
     * @param projectId the project ID
     * @return list of groups
     */
    List<Group> getProjectGroups(Long projectId);

    /**
     * Get a group by ID
     * @param groupId the group ID
     * @return the group
     */
    Group getGroupById(Long groupId);

    /**
     * Get all groups that the current user is a member of
     * @return list of groups
     */
    List<Group> getCurrentUserGroups();

    /**
     * Get all groups led by the current user
     * @return list of groups where the current user is leader
     */
    List<Group> getGroupsLedByCurrentUser();

    /**
     * Leave a group
     * @param groupId the group ID
     */
    @Transactional
    void leaveGroup(Long groupId);

    /**
     * Transfer group leadership
     * @param groupId the group ID
     * @param newLeaderId the ID of the new leader
     * @return the updated group
     */
    @Transactional
    Group transferLeadership(Long groupId, Long newLeaderId);

    /**
     * Update an existing group
     * @param groupId the group ID
     * @param updateRequest the update request
     * @return the updated group
     */
    @Transactional
    Group updateGroup(Long groupId, GroupUpdateRequest updateRequest);

    /**
     * Delete a group and all its related entities (tasks, comments, commit records)
     * @param groupId the group ID to delete
     */
    @Transactional
    void deleteGroup(Long groupId);
}