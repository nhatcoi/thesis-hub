package com.phenikaa.thesis.user.service.importing;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import com.phenikaa.thesis.user.dto.importing.ImportResult;
import com.phenikaa.thesis.user.dto.importing.LecturerImportRow;
import com.phenikaa.thesis.user.dto.importing.StudentImportRow;
import com.phenikaa.thesis.audit.annotation.Auditable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserImportService {

    private final UserImportRowProcessor rowProcessor;

    private final CsvMapper csvMapper = new CsvMapper() {
        {
            configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        }
    };

    @Auditable(action = "IMPORT_STUDENTS", entityType = "User")
    public ImportResult importStudents(MultipartFile file) {
        List<ImportResult.RowError> errors = new ArrayList<>();
        int successCount = 0;
        int failureCount = 0;

        try (InputStream is = file.getInputStream()) {
            CsvSchema schema = CsvSchema.emptySchema().withHeader().withColumnSeparator(',');
            MappingIterator<StudentImportRow> it = csvMapper.readerFor(StudentImportRow.class)
                    .with(schema).readValues(is);

            int rowNum = 1;
            while (it.hasNext()) {
                rowNum++;
                StudentImportRow row = it.next();
                try {
                    rowProcessor.processStudentRow(row);
                    successCount++;
                } catch (Exception e) {
                    log.warn("Import student error at row {}: {}", rowNum, e.getMessage());
                    failureCount++;
                    errors.add(ImportResult.RowError.builder()
                            .rowNumber(rowNum)
                            .identifier(row.getUsername())
                            .message(translateError(e))
                            .build());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi đọc file CSV: " + translateError(e));
        }

        return ImportResult.builder()
                .successCount(successCount)
                .failureCount(failureCount)
                .errors(errors)
                .build();
    }

    @Auditable(action = "IMPORT_LECTURERS", entityType = "User")
    public ImportResult importLecturers(MultipartFile file) {
        List<ImportResult.RowError> errors = new ArrayList<>();
        int successCount = 0;
        int failureCount = 0;

        try (InputStream is = file.getInputStream()) {
            CsvSchema schema = CsvSchema.emptySchema().withHeader().withColumnSeparator(',');
            MappingIterator<LecturerImportRow> it = csvMapper.readerFor(LecturerImportRow.class)
                    .with(schema).readValues(is);

            int rowNum = 1;
            while (it.hasNext()) {
                rowNum++;
                LecturerImportRow row = it.next();
                try {
                    rowProcessor.processLecturerRow(row);
                    successCount++;
                } catch (Exception e) {
                    log.warn("Import lecturer error at row {}: {}", rowNum, e.getMessage());
                    failureCount++;
                    errors.add(ImportResult.RowError.builder()
                            .rowNumber(rowNum)
                            .identifier(row.getUsername())
                            .message(translateError(e))
                            .build());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi đọc file CSV: " + translateError(e));
        }

        return ImportResult.builder()
                .successCount(successCount)
                .failureCount(failureCount)
                .errors(errors)
                .build();
    }

    private String translateError(Exception ex) {
        String raw = getRootMessage(ex);
        if (ex instanceof DataIntegrityViolationException || raw.contains("duplicate key")) {
            Pattern keyPattern = Pattern.compile("Key \\(([^)]+)\\)=\\(([^)]+)\\)");
            Matcher m = keyPattern.matcher(raw);
            if (m.find()) {
                String column = translateColumn(m.group(1));
                String value = m.group(2);
                return "Trùng lặp: " + column + " \"" + value + "\" đã tồn tại trong hệ thống";
            }
            return "Trùng lặp dữ liệu - bản ghi đã tồn tại";
        }
        if (raw.contains("not-null constraint") || raw.contains("null value in column")) {
            Pattern colPattern = Pattern.compile("column \"([^\"]+)\"");
            Matcher m = colPattern.matcher(raw);
            if (m.find()) {
                String column = translateColumn(m.group(1));
                return "Thiếu dữ liệu bắt buộc: " + column;
            }
            return "Thiếu dữ liệu bắt buộc cho một trường quan trọng";
        }
        if (raw.contains("foreign key") || raw.contains("is not present in table")) {
            return "Dữ liệu tham chiếu không hợp lệ (mã khoa/ngành không tồn tại)";
        }
        if (raw.contains("NumberFormatException") || raw.contains("Cannot deserialize")) {
            return "Sai định dạng dữ liệu số (GPA hoặc số tín chỉ)";
        }
        if (raw.startsWith("Không tìm thấy")) {
            return raw;
        }
        if (raw.contains("Unrecognized field")) {
            Pattern fieldPattern = Pattern.compile("Unrecognized field \"([^\"]+)\"");
            Matcher m = fieldPattern.matcher(raw);
            if (m.find()) {
                return "Cột không hợp lệ: \"" + m.group(1) + "\" không có trong mẫu import";
            }
            return "File CSV có cột không hợp lệ";
        }
        if (raw.length() > 120) {
            return raw.substring(0, 120) + "...";
        }
        return raw;
    }

    private String translateColumn(String column) {
        return switch (column) {
            case "username" -> "Tên đăng nhập";
            case "email" -> "Email";
            case "external_id" -> "Mã SSO";
            case "student_code" -> "Mã sinh viên";
            case "lecturer_code" -> "Mã giảng viên";
            case "first_name" -> "Tên";
            case "last_name" -> "Họ";
            case "faculty_code" -> "Mã khoa";
            case "major_code" -> "Mã ngành";
            case "phone" -> "Số điện thoại";
            case "status" -> "Trạng thái";
            case "role" -> "Vai trò";
            case "gpa" -> "Điểm GPA";
            case "accumulated_credits" -> "Tín chỉ tích lũy";
            case "cohort" -> "Khóa";
            default -> column;
        };
    }

    private String getRootMessage(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        String msg = cause.getMessage();
        if (msg == null || msg.isBlank()) {
            msg = ex.getMessage();
        }
        return msg != null ? msg : ex.getClass().getSimpleName();
    }
}
