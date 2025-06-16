package com.example.RhNova.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecentActivityDto {
    private String id;
    private String user;
    private String action;
    private String time;
    private String status;
    private String avatar;
    private LocalDateTime timestamp;
}
