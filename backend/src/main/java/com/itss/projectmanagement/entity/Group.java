package com.itss.projectmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "groups")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Group extends BaseEntity {
    
    @NotBlank(message = "Group name is required")
    @Size(max = 100, message = "Group name cannot exceed 100 characters")
    @Column(nullable = false, columnDefinition = "varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci")
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(length = 500, columnDefinition = "varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci")
    private String description;
    
    @Pattern(regexp = "^(https://github\\.com/[\\w-]+/[\\w.-_]+|git@github\\.com:[\\w-]+/[\\w.-_]+(\\.git)?)$",
            message = "Invalid GitHub repository URL format. Must be like: https://github.com/username/repository or git@github.com:username/repository.git")
    @Column(name = "repository_url", columnDefinition = "varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci")
    private String repositoryUrl;
    
    @NotNull(message = "Project is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id")
    private User leader;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "group_members",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> members = new HashSet<>();
    
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Task> tasks = new HashSet<>();

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<CommitRecord> commitRecords = new HashSet<>();
    
    @OneToMany(mappedBy = "group", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<FreeRiderCase> freeRiderCases = new HashSet<>();
}