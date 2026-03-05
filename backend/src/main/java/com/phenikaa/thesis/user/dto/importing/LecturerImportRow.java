package com.phenikaa.thesis.user.dto.importing;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;

@Data
@JsonPropertyOrder({
        "username", "external_id", "email", "first_name", "last_name",
        "role", "faculty_code", "max_students_per_batch"
})
public class LecturerImportRow {
    private String username;

    @JsonProperty("external_id")
    private String externalId;

    private String email;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    private String role;

    @JsonProperty("faculty_code")
    private String facultyCode;

    @JsonProperty("max_students_per_batch")
    private Integer maxStudentsPerBatch;
}
