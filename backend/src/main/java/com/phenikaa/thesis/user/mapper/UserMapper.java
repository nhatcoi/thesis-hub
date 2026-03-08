package com.phenikaa.thesis.user.mapper;

import com.phenikaa.thesis.user.dto.UserResponse;
import com.phenikaa.thesis.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "facultyName", ignore = true)
    @Mapping(target = "majorName", ignore = true)
    @Mapping(target = "facultyId", ignore = true)
    @Mapping(target = "managedMajorName", ignore = true)
    @Mapping(target = "majorCode", ignore = true)
    @Mapping(target = "managedMajorCode", ignore = true)
    @Mapping(target = "cohort", ignore = true)
    @Mapping(target = "className", ignore = true)
    UserResponse toBaseResponse(User user);
}
