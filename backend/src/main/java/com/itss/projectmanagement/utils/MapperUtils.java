package com.itss.projectmanagement.utils;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class for entity-to-DTO mapping operations
 */
@Component
public class MapperUtils {
    
    private final ModelMapper modelMapper;
    
    public MapperUtils(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }
    
    /**
     * Maps an entity to a DTO
     * 
     * @param <T> the target type
     * @param source the source object
     * @param targetClass the target class
     * @return the mapped object
     */
    public <T> T map(Object source, Class<T> targetClass) {
        return source == null ? null : modelMapper.map(source, targetClass);
    }
    
    /**
     * Maps a collection of entities to a list of DTOs
     * 
     * @param <S> the source type
     * @param <T> the target type
     * @param sourceCollection the source collection
     * @param targetClass the target class
     * @return the list of mapped objects
     */
    public <S, T> List<T> mapList(Collection<S> sourceCollection, Class<T> targetClass) {
        if (sourceCollection == null) {
            return List.of();
        }
        
        return sourceCollection.stream()
                .map(entity -> map(entity, targetClass))
                .collect(Collectors.toList());
    }
}