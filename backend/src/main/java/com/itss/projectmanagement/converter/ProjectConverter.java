package com.itss.projectmanagement.converter;

import com.itss.projectmanagement.dto.response.project.ProjectDTO;
import com.itss.projectmanagement.dto.response.user.UserSummaryDTO;
import com.itss.projectmanagement.entity.Project;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProjectConverter {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private UserConverter userConverter;

    /**
     * Convert a Project entity to ProjectDTO
     * @param project the Project entity to convert
     * @return the converted ProjectDTO
     */
    public ProjectDTO toDTO(Project project) {
        if (project == null) {
            return null;
        }

        ProjectDTO dto = modelMapper.map(project, ProjectDTO.class);
        
        // Handle special mappings
        if (project.getInstructor() != null) {
            dto.setInstructor(userConverter.toUserSummaryDTO(project.getInstructor()));
        }
        
        return dto;
    }

    /**
     * Convert a list of Project entities to ProjectDTOs
     * @param projects the list of Project entities to convert
     * @return the list of converted ProjectDTOs
     */
    public List<ProjectDTO> toDTO(List<Project> projects) {
        if (projects == null) {
            return List.of();
        }
        
        return projects.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}