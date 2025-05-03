package com.itss.projectmanagement.converter;

import com.itss.projectmanagement.dto.response.user.UserDTO;
import com.itss.projectmanagement.dto.response.user.UserSummaryDTO;
import com.itss.projectmanagement.entity.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserConverter {

    @Autowired
    private ModelMapper modelMapper;

    /**
     * Convert a User entity to UserDTO with all details
     * @param user the User entity to convert
     * @return the converted UserDTO
     */
    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }
        
        return modelMapper.map(user, UserDTO.class);
    }

    /**
     * Convert a list of User entities to UserDTOs
     * @param users the list of User entities to convert
     * @return the list of converted UserDTOs
     */
    public List<UserDTO> toDTO(List<User> users) {
        if (users == null) {
            return List.of();
        }
        
        return users.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert a User entity to UserSummaryDTO with minimal details
     * @param user the User entity to convert
     * @return the converted UserSummaryDTO
     */
    public UserSummaryDTO toUserSummaryDTO(User user) {
        if (user == null) {
            return null;
        }
        
        UserSummaryDTO dto = new UserSummaryDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        
        return dto;
    }

    /**
     * Convert a list of User entities to UserSummaryDTOs
     * @param users the list of User entities to convert
     * @return the list of converted UserSummaryDTOs
     */
    public List<UserSummaryDTO> toUserSummaryDTO(List<User> users) {
        if (users == null) {
            return List.of();
        }
        
        return users.stream()
                .map(this::toUserSummaryDTO)
                .collect(Collectors.toList());
    }
}