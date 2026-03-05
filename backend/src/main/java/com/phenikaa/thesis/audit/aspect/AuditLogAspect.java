package com.phenikaa.thesis.audit.aspect;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phenikaa.thesis.audit.annotation.Auditable;
import com.phenikaa.thesis.audit.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    @AfterReturning(value = "@annotation(auditable)", returning = "result")
    public void auditLog(JoinPoint joinPoint, Auditable auditable, Object result) {
        try {
            String action = auditable.action();
            String entityType = auditable.entityType();
            UUID entityId = extractId(result, joinPoint.getArgs());

            // Lấy dữ liệu mới nhất (newValue)
            Map<String, Object> newValue = null;
            if (result != null && !action.contains("DELETE")) {
                newValue = convertToMap(result);
            }

            // Ghi nhận vào DB
            auditLogService.log(action, entityType, entityId, null, newValue);

            log.debug("AOP Audit recorded: {} -> {} (ID: {})", action, entityType, entityId);
        } catch (Exception e) {
            log.error("AuditLog AOP failure in method {}: {}", joinPoint.getSignature().getName(), e.getMessage());
        }
    }

    private UUID extractId(Object result, Object[] args) {
        // 1. Thử lấy từ kết quả trả về
        if (result != null) {
            UUID id = tryGetId(result);
            if (id != null)
                return id;
        }

        // 2. Thử lấy từ tham số đầu vào (thường là ID truyền vào để update/delete)
        for (Object arg : args) {
            if (arg instanceof UUID uuid)
                return uuid;
            // Nếu tham số là một String có thể là UUID
            if (arg instanceof String s) {
                try {
                    return UUID.fromString(s);
                } catch (Exception ignored) {
                }
            }
        }

        return null;
    }

    private UUID tryGetId(Object obj) {
        if (obj == null)
            return null;

        // Cách 1: Thử gọi getId() qua Reflection
        try {
            Method getIdMethod = obj.getClass().getMethod("getId");
            Object res = getIdMethod.invoke(obj);
            if (res instanceof UUID uuid)
                return uuid;
        } catch (Exception ignored) {
        }

        // Cách 2: Với Records (Spring Boot 3 / Java 21)
        try {
            Method idMethod = obj.getClass().getMethod("id");
            Object res = idMethod.invoke(obj);
            if (res instanceof UUID uuid)
                return uuid;
        } catch (Exception ignored) {
        }

        return null;
    }

    private Map<String, Object> convertToMap(Object obj) {
        if (obj == null)
            return null;
        try {
            // ObjectMapper xử lý tốt cả Entity và Record
            return objectMapper.convertValue(obj, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception e) {
            return Collections.singletonMap("summary", obj.toString());
        }
    }
}
