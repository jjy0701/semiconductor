package com.example.bolt.controller;

import com.example.bolt.dto.LiveReportRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analysis")
public class LiveAnalysisController {

    private final SimpMessagingTemplate messagingTemplate;

    public LiveAnalysisController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/live-report")
    public ResponseEntity<Map<String, String>> receiveLiveReport(@RequestBody LiveReportRequest request) {

        Map<String, Object> broadcastMessage = new HashMap<>();
        broadcastMessage.put("line_id", request.getLineId());
        broadcastMessage.put("defect_type", request.getDefectType());
        broadcastMessage.put("confidence", request.getConfidence());
        broadcastMessage.put("timestamp", LocalDateTime.now().toString());

        messagingTemplate.convertAndSend("/topic/live-feed", broadcastMessage);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Live report broadcasted successfully.");
        return ResponseEntity.ok(response);
    }
}