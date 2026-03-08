package com.phenikaa.thesis.thesis.mapper;

import com.phenikaa.thesis.thesis.dto.OutlineResponse;
import com.phenikaa.thesis.thesis.entity.Outline;
import com.phenikaa.thesis.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface OutlineMapper {

    @Mapping(target = "thesisId", source = "thesis.id")
    @Mapping(target = "reviewerName", source = "reviewedBy.user", qualifiedByName = "fullName")
    @Mapping(target = "studentName", source = "thesis.student.user", qualifiedByName = "fullName")
    @Mapping(target = "studentCode", source = "thesis.student.studentCode")
    @Mapping(target = "topicTitle", source = "thesis.topic.title")
    @Mapping(target = "publicUrl", source = "filePath", qualifiedByName = "toPublicUrl")
    OutlineResponse toResponse(Outline outline);

    @Named("toPublicUrl")
    default String toPublicUrl(String filePath) {
        if (filePath == null) return null;
        // Chuyển đường dẫn vật lý thành URL relative (ví dụ: /uploads/outlines/...)
        int index = filePath.indexOf("uploads");
        if (index != -1) {
            return "/" + filePath.substring(index).replace("\\", "/");
        }
        return filePath;
    }

    @Named("fullName")
    default String fullName(User user) {
        if (user == null) return null;
        String last = user.getLastName() != null ? user.getLastName() : "";
        String first = user.getFirstName() != null ? user.getFirstName() : "";
        return (last + " " + first).trim();
    }
}
