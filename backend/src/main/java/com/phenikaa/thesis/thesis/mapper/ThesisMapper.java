package com.phenikaa.thesis.thesis.mapper;

import com.phenikaa.thesis.thesis.dto.ThesisResponse;
import com.phenikaa.thesis.user.entity.Student;
import com.phenikaa.thesis.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ThesisMapper {

    @Mapping(target = "studentId", source = "id")
    @Mapping(target = "studentName", source = "user", qualifiedByName = "fullName")
    @Mapping(target = "studentFirstName", source = "user.firstName")
    @Mapping(target = "studentLastName", source = "user.lastName")
    @Mapping(target = "studentCode", source = "studentCode")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "topicId", ignore = true)
    @Mapping(target = "topicName", ignore = true)
    @Mapping(target = "batchId", ignore = true)
    @Mapping(target = "batchName", ignore = true)
    @Mapping(target = "advisorId", ignore = true)
    @Mapping(target = "advisorName", ignore = true)
    @Mapping(target = "majorCode", ignore = true)
    @Mapping(target = "majorName", ignore = true)
    @Mapping(target = "facultyId", ignore = true)
    @Mapping(target = "facultyName", ignore = true)
    @Mapping(target = "status", ignore = true)
    ThesisResponse studentToBaseResponse(Student student);

    @Named("fullName")
    default String fullName(User user) {
        if (user == null) return null;
        String last = user.getLastName() != null ? user.getLastName() : "";
        String first = user.getFirstName() != null ? user.getFirstName() : "";
        return (last + " " + first).trim();
    }
}
