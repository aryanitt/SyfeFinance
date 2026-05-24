package com.syfe.personalfinance.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private Long id;
    private String username;
    private String fullName;
    private String phoneNumber;
    private LocalDateTime createdAt;
}
