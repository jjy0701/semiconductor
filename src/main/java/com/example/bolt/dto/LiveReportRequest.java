package com.example.bolt.dto;

public class LiveReportRequest {
    private String lineId;
    private String defectType;
    private Double confidence;

    // Getters and Setters
    public String getLineId() { return lineId; }
    public void setLineId(String lineId) { this.lineId = lineId; }
    public String getDefectType() { return defectType; }
    public void setDefectType(String defectType) { this.defectType = defectType; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
}