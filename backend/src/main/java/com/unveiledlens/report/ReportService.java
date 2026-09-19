package com.unveiledlens.report;
import org.springframework.stereotype.Service;

@Service
public class ReportService {
    public String generateReport(String domain) {
        return "Report for " + domain;
    }
}

