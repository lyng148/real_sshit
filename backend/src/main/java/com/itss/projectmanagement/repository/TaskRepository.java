package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByAssignee(User assignee);
    
    List<Task> findByGroup(Group group);
    
    List<Task> findByAssigneeAndStatus(User assignee, Task.TaskStatus status);
    
    List<Task> findByGroupAndStatus(Group group, Task.TaskStatus status);
}