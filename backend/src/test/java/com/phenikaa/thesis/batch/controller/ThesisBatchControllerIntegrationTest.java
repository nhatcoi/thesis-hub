package com.phenikaa.thesis.batch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phenikaa.thesis.auth.service.CurrentUserService;
import com.phenikaa.thesis.batch.dto.ThesisBatchCreateRequest;
import com.phenikaa.thesis.batch.dto.ThesisBatchUpdateRequest;
import com.phenikaa.thesis.organization.entity.AcademicYear;
import com.phenikaa.thesis.organization.repository.AcademicYearRepository;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ThesisBatchControllerIntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @Autowired
    AcademicYearRepository academicYearRepo;

    @Autowired
    UserRepository userRepo;

    @MockBean
    CurrentUserService currentUserService;

    User pdtUser;
    AcademicYear academicYear;

    @BeforeEach
    void setUp() {
        pdtUser = userRepo.findByUsername("pdt01")
                .orElseThrow(() -> new IllegalStateException("Seed user 'pdt01' not found. Run migrations first."));

        when(currentUserService.getCurrentUser()).thenReturn(pdtUser);

        academicYear = academicYearRepo.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No AcademicYear in DB. Run migrations first."));
    }

    ThesisBatchCreateRequest validCreateRequest() {
        OffsetDateTime base = OffsetDateTime.of(2026, 3, 1, 0, 0, 0, 0, ZoneOffset.ofHours(7));
        return new ThesisBatchCreateRequest(
                "Đợt đồ án HK2 2025-2026",
                academicYear.getId(),
                2,
                base, base.plusDays(14),           // topic reg
                base.plusDays(15), base.plusDays(45), // outline
                base.plusDays(46), base.plusDays(120),// implementation
                base.plusDays(121), base.plusDays(140),// defense reg
                base.plusDays(141), base.plusDays(160) // defense
        );
    }

    ThesisBatchUpdateRequest validUpdateRequest() {
        OffsetDateTime base = OffsetDateTime.of(2026, 3, 5, 0, 0, 0, 0, ZoneOffset.ofHours(7));
        return new ThesisBatchUpdateRequest(
                "Đợt đồ án HK2 2025-2026 (cập nhật)",
                academicYear.getId(),
                2,
                base, base.plusDays(14),
                base.plusDays(15), base.plusDays(45),
                base.plusDays(46), base.plusDays(120),
                base.plusDays(121), base.plusDays(140),
                base.plusDays(141), base.plusDays(160)
        );
    }

    @Test
    @DisplayName("POST /api/batches - tạo đợt đồ án thành công (TRAINING_DEPT)")
    @WithMockUser(roles = "TRAINING_DEPT")
    void create_returns201() throws Exception {
        mvc.perform(post("/api/batches")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.name").value("Đợt đồ án HK2 2025-2026"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.semester").value(2));
    }

    @Test
    @DisplayName("POST /api/batches - 403 khi không có quyền TRAINING_DEPT/ADMIN")
    @WithMockUser(roles = "STUDENT")
    void create_forbidden() throws Exception {
        mvc.perform(post("/api/batches")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/batches - danh sách đợt đồ án")
    @WithMockUser
    void list_returns200() throws Exception {
        mvc.perform(get("/api/batches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/batches - filter by status DRAFT")
    @WithMockUser
    void list_filterByStatus() throws Exception {
        mvc.perform(get("/api/batches").param("status", "DRAFT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/batches/{id} - chi tiết đợt đồ án")
    @WithMockUser(roles = "TRAINING_DEPT")
    void getById_returns200() throws Exception {
        UUID id = createBatchAndGetId();
        mvc.perform(get("/api/batches/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id.toString()))
                .andExpect(jsonPath("$.data.name").exists())
                .andExpect(jsonPath("$.data.status").value("DRAFT"));
    }

    @Test
    @DisplayName("GET /api/batches/{id} - 404 khi không tồn tại")
    @WithMockUser
    void getById_notFound() throws Exception {
        mvc.perform(get("/api/batches/{id}", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/batches/{id} - cập nhật đợt DRAFT")
    @WithMockUser(roles = "TRAINING_DEPT")
    void update_returns200() throws Exception {
        UUID id = createBatchAndGetId();
        mvc.perform(put("/api/batches/{id}", id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(validUpdateRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Đợt đồ án HK2 2025-2026 (cập nhật)"));
    }

    @Test
    @DisplayName("PATCH /api/batches/{id}/activate - DRAFT → ACTIVE")
    @WithMockUser(roles = "TRAINING_DEPT")
    void activate_returns200() throws Exception {
        UUID id = createBatchAndGetId();
        mvc.perform(patch("/api/batches/{id}/activate", id).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("PATCH /api/batches/{id}/close - ACTIVE → CLOSED")
    @WithMockUser(roles = "TRAINING_DEPT")
    void close_returns200() throws Exception {
        UUID id = createBatchAndGetId();
        mvc.perform(patch("/api/batches/{id}/activate", id).with(csrf())).andExpect(status().isOk());
        mvc.perform(patch("/api/batches/{id}/close", id).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CLOSED"));
    }

    @Test
    @DisplayName("DELETE /api/batches/{id} - xoá đợt DRAFT")
    @WithMockUser(roles = "TRAINING_DEPT")
    void delete_returns200() throws Exception {
        UUID id = createBatchAndGetId();
        mvc.perform(delete("/api/batches/{id}", id).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        mvc.perform(get("/api/batches/{id}", id)).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/batches - 400 validation lỗi")
    @WithMockUser(roles = "TRAINING_DEPT")
    void create_validationError() throws Exception {
        OffsetDateTime t1 = OffsetDateTime.of(2026, 3, 10, 0, 0, 0, 0, ZoneOffset.ofHours(7));
        OffsetDateTime t2 = OffsetDateTime.of(2026, 3, 5, 0, 0, 0, 0, ZoneOffset.ofHours(7));
        ThesisBatchCreateRequest invalid = new ThesisBatchCreateRequest(
                "",
                academicYear.getId(),
                2,
                t1, t2,
                t1.plusDays(20), t1.plusDays(30),
                t1.plusDays(31), t1.plusDays(60),
                t1.plusDays(61), t1.plusDays(70),
                t1.plusDays(71), t1.plusDays(80)
        );
        mvc.perform(post("/api/batches")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    private UUID createBatchAndGetId() throws Exception {
        ResultActions result = mvc.perform(post("/api/batches")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isCreated());
        String json = result.andReturn().getResponse().getContentAsString();
        return UUID.fromString(
                mapper.readTree(json).at("/data/id").asText());
    }
}
