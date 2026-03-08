package com.phenikaa.thesis.user.controller;

import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.user.entity.Lecturer;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.repository.LecturerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lecturers")
@RequiredArgsConstructor
public class LecturerController {

    private final LecturerRepository lecturerRepo;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getLecturers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) java.util.UUID facultyId) {

        List<Lecturer> lecturers = lecturerRepo.findAll();
        if (facultyId != null) {
            lecturers = lecturers.stream()
                    .filter(l -> l.getFaculty() != null && l.getFaculty().getId().equals(facultyId))
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> result = lecturers.stream()
                .filter(l -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.toLowerCase().trim();
                    User u = l.getUser();
                    String fullName = (u.getLastName() + " " + u.getFirstName()).toLowerCase();
                    return fullName.contains(q) || (u.getEmail() != null && u.getEmail().toLowerCase().contains(q));
                })
                .map(l -> {
                    User u = l.getUser();
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", l.getId().toString());
                    map.put("lecturerCode", l.getLecturerCode());
                    map.put("firstName", u.getFirstName());
                    map.put("lastName", u.getLastName());
                    map.put("email", u.getEmail());
                    map.put("facultyName", l.getFaculty() != null ? l.getFaculty().getName() : null);
                    return map;
                })
                .collect(Collectors.toList());

        return ApiResponse.ok(result);
    }
}
