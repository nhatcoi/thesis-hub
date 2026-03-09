package com.phenikaa.thesis.thesis.mapper;

import com.phenikaa.thesis.thesis.dto.DefenseRegistrationResponse;
import com.phenikaa.thesis.thesis.entity.DefenseRegistration;
import com.phenikaa.thesis.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface DefenseRegistrationMapper {

    @Mapping(target = "thesisId", source = "thesis.id")
    @Mapping(target = "studentName", source = "thesis.student.user", qualifiedByName = "fullName")
    @Mapping(target = "studentCode", source = "thesis.student.studentCode")
    @Mapping(target = "topicTitle", source = "thesis.topic.title")
    @Mapping(target = "reportUrl", source = "reportPath", qualifiedByName = "toPublicUrl")
    @Mapping(target = "sourceCodeUrl", source = "sourceCodePath", qualifiedByName = "toPublicUrl")
    @Mapping(target = "slideUrl", source = "slidePath", qualifiedByName = "toPublicUrl")
    @Mapping(target = "reviewerName", source = "reviewedBy.user", qualifiedByName = "fullName")
    DefenseRegistrationResponse toResponse(DefenseRegistration entity);

    @Named("fullName")
    default String fullName(User user) {
        if (user == null) return null;
        String last = user.getLastName() != null ? user.getLastName() : "";
        String first = user.getFirstName() != null ? user.getFirstName() : "";
        return (last + " " + first).trim();
    }

    @Named("toPublicUrl")
    default String toPublicUrl(String filePath) {
        if (filePath == null) return null;
        int index = filePath.indexOf("uploads");
        if (index != -1) return "/" + filePath.substring(index).replace("\\", "/");
        return filePath;
    }
}
