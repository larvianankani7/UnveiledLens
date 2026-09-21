package com.unveiledlens.report;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.unveiledlens.discovery.dto.ExposureFinding;
import com.unveiledlens.discovery.dto.ExposureReport;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class PdfReportService {

    public byte[] generateReport(ExposureReport report) {

        String html = buildHtml(report);

        try (ByteArrayOutputStream outputStream =
                     new ByteArrayOutputStream()) {

            PdfRendererBuilder builder =
                    new PdfRendererBuilder();

            builder.useFastMode();
            builder.withHtmlContent(
                    html,
                    null
            );

            builder.toStream(outputStream);
            builder.run();

            return outputStream.toByteArray();

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Failed to generate PDF report",
                    e
            );
        }
    }

    private String buildHtml(
            ExposureReport report
    ) {

        String domain =
                escape(report.getDomain());

        String scannedAt =
                escape(report.getScannedAt());

        StringBuilder html =
                new StringBuilder();

        html.append("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">

                    <style>

                        @page {
                            size: A4;
                            margin: 36px;
                        }

                        body {
                            font-family: Arial, sans-serif;
                            color: #202020;
                            background: #ffffff;
                            font-size: 11px;
                            line-height: 1.5;
                        }

                        h1 {
                            font-size: 26px;
                            margin-bottom: 4px;
                        }

                        h2 {
                            font-size: 17px;
                            margin-top: 26px;
                            border-bottom: 1px solid #dddddd;
                            padding-bottom: 6px;
                        }

                        h3 {
                            font-size: 13px;
                            margin-bottom: 5px;
                        }

                        .header {
                            margin-bottom: 25px;
                        }

                        .subtitle {
                            color: #666666;
                            font-size: 12px;
                        }

                        .summary {
                            display: table;
                            width: 100%;
                            margin-top: 20px;
                        }

                        .summary-card {
                            display: table-cell;
                            width: 25%;
                            padding: 12px;
                            border: 1px solid #dddddd;
                        }

                        .summary-number {
                            font-size: 20px;
                            font-weight: bold;
                        }

                        .finding {
                            border: 1px solid #dddddd;
                            padding: 14px;
                            margin-top: 14px;
                            page-break-inside: avoid;
                        }

                        .severity {
                            font-weight: bold;
                            text-transform: uppercase;
                        }

                        .high {
                            color: #b91c1c;
                        }

                        .medium {
                            color: #b45309;
                        }

                        .low {
                            color: #2563eb;
                        }

                        .meta {
                            color: #666666;
                            margin-top: 5px;
                        }

                        .section {
                            margin-top: 10px;
                        }

                        ul {
                            padding-left: 20px;
                        }

                        .footer {
                            margin-top: 35px;
                            padding-top: 10px;
                            border-top: 1px solid #dddddd;
                            color: #777777;
                            font-size: 9px;
                        }

                    </style>
                </head>

                <body>
                """);

        html.append("""
                <div class="header">
                    <h1>UnveiledLens Security Report</h1>
                    <div class="subtitle">
                        Discover Beyond the Known.
                    </div>
                </div>
                """);

        html.append("<p><strong>Target:</strong> ")
                .append(domain)
                .append("</p>");

        html.append("<p><strong>Scan Date:</strong> ")
                .append(scannedAt)
                .append("</p>");

        if (report.getSummary() != null) {

            var summary =
                    report.getSummary();

            html.append("""
                    <div class="summary">

                        <div class="summary-card">
                            <div>Total Discovered</div>
                            <div class="summary-number">
                    """)
                    .append(summary.getTotalDiscovered())
                    .append("""
                            </div>
                        </div>

                        <div class="summary-card">
                            <div>Relevant Assets</div>
                            <div class="summary-number">
                    """)
                    .append(summary.getRelevantAssets())
                    .append("""
                            </div>
                        </div>

                        <div class="summary-card">
                            <div>Total Findings</div>
                            <div class="summary-number">
                    """)
                    .append(summary.getTotalFindings())
                    .append("""
                            </div>
                        </div>

                        <div class="summary-card">
                            <div>Reachable</div>
                            <div class="summary-number">
                    """)
                    .append(summary.getReachableFindings())
                    .append("""
                            </div>
                        </div>

                    </div>
                    """);
        }

        html.append("<h2>Findings</h2>");

        List<ExposureFinding> findings =
                report.getFindings();

        if (findings == null || findings.isEmpty()) {

            html.append("""
                    <p>
                        No significant security findings were identified
                        during this scan.
                    </p>
                    """);

        } else {

            for (ExposureFinding finding : findings) {

                appendFinding(
                        html,
                        finding
                );
            }
        }

        html.append("""
                <div class="footer">
                    Generated by UnveiledLens.
                    Findings represent externally observable exposure
                    signals and do not constitute proof of exploitation.
                </div>

                </body>
                </html>
                """);

        return html.toString();
    }

    private void appendFinding(
            StringBuilder html,
            ExposureFinding finding
    ) {

        String severity =
                escape(finding.getSeverity());

        String category =
                escape(finding.getCategory());

        String url =
                escape(finding.getUrl());

        html.append("<div class=\"finding\">");

        html.append("<h3>")
                .append(category)
                .append("</h3>");

        html.append("<div class=\"severity ")
                .append(severityClass(finding.getSeverity()))
                .append("\">")
                .append(severity)
                .append("</div>");

        if (url != null && !url.isBlank()) {

            html.append("<div class=\"meta\">")
                    .append("Resource: ")
                    .append(url)
                    .append("</div>");
        }

        if (finding.getReason() != null) {

            html.append("""
                    <div class="section">
                        <strong>Analysis</strong>
                    </div>
                    """);

            html.append("<p>")
                    .append(escape(finding.getReason()))
                    .append("</p>");
        }

        if (finding.getRiskLevel() != null) {

            html.append("<p><strong>Risk Level:</strong> ")
                    .append(escape(finding.getRiskLevel()))
                    .append("</p>");
        }

        if (finding.isReachable()) {

            html.append(
                    "<p><strong>Status:</strong> Appears reachable</p>"
            );
        }

        if (finding.isAuthRequired()) {

            html.append(
                    "<p><strong>Authentication:</strong> Required</p>"
            );

        } else {

            html.append(
                    "<p><strong>Authentication:</strong> Not confirmed</p>"
            );
        }

        appendList(
                html,
                "Potential Attack Chains",
                finding.getAttackChainSignals()
        );

        appendList(
                html,
                "DPDP Relevance",
                finding.getCompliance()
        );

        if (finding.getRemediation() != null) {

            html.append("""
                    <div class="section">
                        <strong>Recommended Remediation</strong>
                    </div>
                    """);

            html.append("<p>")
                    .append(escape(finding.getRemediation()))
                    .append("</p>");
        }

        html.append("</div>");
    }

    private void appendList(
            StringBuilder html,
            String title,
            List<String> values
    ) {

        if (values == null || values.isEmpty()) {
            return;
        }

        html.append("<div class=\"section\">")
                .append("<strong>")
                .append(title)
                .append("</strong>")
                .append("</div>");

        html.append("<ul>");

        for (String value : values) {

            html.append("<li>")
                    .append(escape(value))
                    .append("</li>");
        }

        html.append("</ul>");
    }

    private String severityClass(
            String severity
    ) {

        if (severity == null) {
            return "low";
        }

        return switch (
                severity.toUpperCase()
        ) {
            case "CRITICAL", "HIGH" -> "high";
            case "MEDIUM" -> "medium";
            default -> "low";
        };
    }

    private String escape(
            String value
    ) {

        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}