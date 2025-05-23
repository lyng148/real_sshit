package com.itss.projectmanagement.converter;

import com.itss.projectmanagement.dto.response.freerider.FreeRiderCaseDTO;
import com.itss.projectmanagement.dto.response.group.GroupSummaryDTO;
import com.itss.projectmanagement.dto.response.project.ProjectSummaryDTO;
import com.itss.projectmanagement.entity.FreeRiderCase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FreeRiderCaseConverter {

    @Autowired
    private UserConverter userConverter;

    /**
     * Convert a FreeRiderCase entity to FreeRiderCaseDTO
     * @param freeRiderCase the FreeRiderCase entity
     * @return the FreeRiderCaseDTO
     */
    public FreeRiderCaseDTO toDTO(FreeRiderCase freeRiderCase) {
        if (freeRiderCase == null) {
            return null;
        }

        FreeRiderCaseDTO dto = new FreeRiderCaseDTO();
        dto.setId(freeRiderCase.getId());
        dto.setStatus(freeRiderCase.getStatus());
        dto.setResolution(freeRiderCase.getResolution());
        dto.setNotes(freeRiderCase.getNotes());
        dto.setDetectedAt(freeRiderCase.getDetectedAt());
        dto.setContactedAt(freeRiderCase.getContactedAt());
        dto.setResolvedAt(freeRiderCase.getResolvedAt());
        dto.setEvidenceJson(freeRiderCase.getEvidenceJson());
        
        // Student mapping
        if (freeRiderCase.getStudent() != null) {
            dto.setStudent(userConverter.toUserSummaryDTO(freeRiderCase.getStudent()));
        }
        
        // Project mapping
        if (freeRiderCase.getProject() != null) {
            ProjectSummaryDTO projectDTO = new ProjectSummaryDTO();
            projectDTO.setId(freeRiderCase.getProject().getId());
            projectDTO.setName(freeRiderCase.getProject().getName());
            projectDTO.setFreeriderThreshold(freeRiderCase.getProject().getFreeriderThreshold());
            
            if (freeRiderCase.getProject().getInstructor() != null) {
                projectDTO.setInstructor(userConverter.toUserSummaryDTO(freeRiderCase.getProject().getInstructor()));
            }
            
            dto.setProject(projectDTO);
        }
        
        // Group mapping
        if (freeRiderCase.getGroup() != null) {
            GroupSummaryDTO groupDTO = new GroupSummaryDTO();
            groupDTO.setId(freeRiderCase.getGroup().getId());
            groupDTO.setName(freeRiderCase.getGroup().getName());
            groupDTO.setRepositoryUrl(freeRiderCase.getGroup().getRepositoryUrl());
            
            dto.setGroup(groupDTO);
        }
        
        return dto;
    }

    /**
     * Convert a list of FreeRiderCase entities to a list of FreeRiderCaseDTOs
     * @param freeRiderCases the list of FreeRiderCase entities
     * @return the list of FreeRiderCaseDTOs
     */
    public List<FreeRiderCaseDTO> toDTO(List<FreeRiderCase> freeRiderCases) {
        if (freeRiderCases == null) {
            return List.of();
        }
        
        return freeRiderCases.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
