package com.koreait.apiserver.config;

import com.koreait.apiserver.service.ChatLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@Configuration
// @EnableScheduling  // 임시 비활성화
@RequiredArgsConstructor
public class SchedulerConfig {

    private final ChatLogService chatLogService;

    @Value("${chat.log.cleanup.days:1}")
    private int cleanupDays;

    @Scheduled(cron = "${chat.cleanup.cron:0 0 2 * * ?}")
    public void cleanupOldTempMessages() {
        try {
            log.info("Starting cleanup of old temp messages - {} days ago", cleanupDays);
            chatLogService.cleanupOldTempMessages(cleanupDays);
            log.info("Cleanup of old temp messages completed");
        } catch (Exception e) {
            log.error("Error occurred during temp message cleanup", e);
        }
    }
} 