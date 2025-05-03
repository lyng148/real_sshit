package com.itss.projectmanagement.converter;

import com.itss.projectmanagement.dto.response.GroupDTO;
import com.itss.projectmanagement.dto.response.UserSummaryDTO;
import com.itss.projectmanagement.entity.Group;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class GroupConverter {

    @Autowired
    private ModelMapper modelMapper;
    
    @Autowired
    private UserConverter userConverter;

    /**
     * Convert Group entity to GroupDTO
     * @param group the Group entity
     * @return the GroupDTO
     */
    public GroupDTO toDTO(Group group) {
        if (group == null) {
            return null;
        }

        GroupDTO dto = new GroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        
        if (group.getProject() != null) {
            dto.setProjectId(group.getProject().getId());
            dto.setProjectName(group.getProject().getName());
            dto.setMaxMembers(group.getProject().getMaxMembers());
        }
        
        if (group.getLeader() != null) {
            dto.setLeader(userConverter.toUserSummaryDTO(group.getLeader()));
        }
        
        if (group.getMembers() != null && !group.getMembers().isEmpty()) {
            Set<UserSummaryDTO> memberDTOs = group.getMembers().stream()
                    .map(userConverter::toUserSummaryDTO)
                    .collect(Collectors.toSet());
            dto.setMembers(memberDTOs);
            dto.setMemberCount(memberDTOs.size());
        } else {
            dto.setMemberCount(0);
        }
        
        dto.setCreatedAt(group.getCreatedAt());
        dto.setUpdatedAt(group.getUpdatedAt());
        
        return dto;
    }

    /**
     * Convert list of Group entities to list of GroupDTOs
     * @param groups the list of Group entities
     * @return the list of GroupDTOs
     */
    public List<GroupDTO> toDTO(List<Group> groups) {
        if (groups == null) {
            return List.of();
        }
        
        return groups.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}