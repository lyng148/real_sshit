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
     * Find all groups where the user is either a member or the leader
     * @param member the user as member
     * @param leaderId the user id as leader
     * @return list of groups
     */
    @Query("SELECT g FROM Group g WHERE :member MEMBER OF g.members OR g.leader.id = :leaderId")
    List<Group> findByMembersContainingOrLeaderId(@Param("member") User member, @Param("leaderId") Long leaderId);
    
    /**
     * Find a group in a project by name
     * @param name the group name
     * @param project the project
     * @return the group if found
     */
    Optional<Group> findByNameAndProject(String name, Project project);
    
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

    List<Group> findByMembersContainingOrLeader(User user, User user1);

    List<Group> findByMembersContainingAndProject(User user, Project project);

    Optional<Object> findByRepositoryUrlAndProject(String repositoryUrl, Project project);

    Group findByProjectAndMembersContains(Project project, User user);    
    
    /**
     * Get all members of a group including the leader
     * @param groupId the group id
     * @return list of users in the group
     */
    @Query("SELECT DISTINCT u FROM Group g JOIN g.members u WHERE g.id = :groupId " +
           "UNION " +
           "SELECT g.leader FROM Group g WHERE g.id = :groupId AND g.leader IS NOT NULL")
    List<User> getGroupMembers(@Param("groupId") Long groupId);
}