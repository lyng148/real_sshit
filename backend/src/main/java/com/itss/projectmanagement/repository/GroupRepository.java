package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    
    List<Group> findByLeaderId(Long leaderId);

    /**
     * Find all groups in a project
     * @param project the project
     * @return list of groups
     */
    List<Group> findByProject(Project project);
    
    /**
     * Find all groups that a user is a member of
     * @param member the user
     * @return list of groups
     */
    @Query("SELECT g FROM Group g JOIN g.members m WHERE m = :member")
    List<Group> findByMember(User member);
    
    /**
     * Find all groups led by a specific user
     * @param leader the leader
     * @return list of groups
     */
    List<Group> findByLeader(User leader);
    
    /**
     * Find a group in a project by name
     * @param name the group name
     * @param project the project
     * @return the group if found
     */
    Optional<Group> findByNameAndProject(String name, Project project);
    
    /**
     * Count number of members in a group
     * @param groupId the group ID
     * @return the number of members
     */
    @Query("SELECT COUNT(m) FROM Group g JOIN g.members m WHERE g.id = :groupId")
    int countMembersByGroupId(Long groupId);
    
    /**
     * Find groups in a project that still have space for more members
     * @param project the project
     * @param maxMembers the maximum number of members per group
     * @return list of groups with available space
     */
    @Query("SELECT g FROM Group g WHERE g.project = :project AND SIZE(g.members) < :maxMembers")
    List<Group> findGroupsWithAvailableSpace(@Param("project") Project project, @Param("maxMembers") int maxMembers);
    
    /**
     * Check if a user is already in any group for a specific project
     * @param user the user
     * @param project the project
     * @return true if the user is already in a group
     */
    @Query("SELECT COUNT(g) > 0 FROM Group g JOIN g.members m WHERE m = :user AND g.project = :project")
    boolean isUserInAnyGroupForProject(@Param("user") User user, @Param("project") Project project);
}