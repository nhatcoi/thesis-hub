package com.phenikaa.thesis.audit.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation dùng để đánh dấu các method cần được ghi Audit Log tự động qua
 * AOP.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    /**
     * Tên hành động (vd: CREATE_USER, UPDATE_BATCH).
     */
    String action() default "";

    /**
     * Loại thực thể (vd: User, ThesisBatch).
     */
    String entityType() default "";
}
