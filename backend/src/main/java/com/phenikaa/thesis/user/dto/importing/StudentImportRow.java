package com.phenikaa.thesis.user.dto.importing;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;

@Data
@JsonPropertyOrder({
        "username", "external_id", "email", "first_name", "last_name",
        "role", "school_code", "faculty_code", "major_code",
        "cohort"
})
public class StudentImportRow {
    private String username;

    @JsonProperty("external_id")
    private String externalId;

    private String email;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    private String role;

    @JsonProperty("school_code")
    private String schoolCode;

    @JsonProperty("faculty_code")
    private String facultyCode;

    @JsonProperty("major_code")
    private String majorCode;

    private String cohort;
}
