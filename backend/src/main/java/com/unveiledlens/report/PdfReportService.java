package com.unveiledlens.report;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.unveiledlens.admin.AdminRedactionService;
import com.unveiledlens.admin.dto.AdminExposureFinding;
import com.unveiledlens.admin.dto.AdminExposureReport;
import com.unveiledlens.discovery.dto.ExposureFinding;
import com.unveiledlens.discovery.dto.ExposureReport;
import com.unveiledlens.discovery.dto.UserExposureReport;
import com.unveiledlens.discovery.dto.UserExposureSummary;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfReportService {

    private static final Logger log = LoggerFactory.getLogger(PdfReportService.class);
    private final AdminRedactionService redactionService;

    public byte[] generateReport(AdminExposureReport report) {

        if (report == null) {
            throw new IllegalArgumentException("Report cannot be null");
        }

        String html = buildAdminHtml(report);
        return generatePdfFromHtml(html);
    }

    public byte[] generateReport(ExposureReport report) {

        if (report == null) {
            throw new IllegalArgumentException("Report cannot be null");
        }

        String html = buildHtml(report);
        return generatePdfFromHtml(html);
    }

    public byte[] generateUserReport(UserExposureReport report) {

        if (report == null) {
            throw new IllegalArgumentException("User report cannot be null");
        }

        String html = buildUserHtml(report);
        return generatePdfFromHtml(html);
    }

    private byte[] generatePdfFromHtml(String html) {
        try (ByteArrayOutputStream outputStream =
                     new ByteArrayOutputStream()) {

            PdfRendererBuilder builder =
                    new PdfRendererBuilder();

            builder.useFastMode();
            builder.withHtmlContent(
                    html,
                    ""
            );

            builder.toStream(outputStream);
            builder.run();

            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("PDF generation failed. HTML content length: {}, Error: {}", html.length(), e.getMessage(), e);
            throw new IllegalStateException(
                    "Failed to generate PDF report",
                    e
            );
        }
    }

    private String buildUserHtml(UserExposureReport report) {
        String domain = escape(report.getDomain());
        String scannedAt = escape(report.getScannedAt());

        StringBuilder html = new StringBuilder();
        html.append("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8" />
                    <style>
                        @page { size: A4; margin: 36px; }
                        body { font-family: Arial, sans-serif; color: #202020; background: #ffffff; font-size: 11px; line-height: 1.5; }
                        h1 { font-size: 26px; margin-bottom: 4px; }
                        h2 { font-size: 17px; margin-top: 26px; border-bottom: 1px solid #dddddd; padding-bottom: 6px; }
                        h3 { font-size: 13px; margin-bottom: 5px; }
                        .header { margin-bottom: 25px; }
                        .subtitle { color: #666666; font-size: 12px; }
                        .summary { display: table; width: 100%; margin-top: 20px; }
                        .summary-card { display: table-cell; width: 25%; padding: 12px; border: 1px solid #dddddd; }
                        .summary-number { font-size: 20px; font-weight: bold; }
                        .footer { margin-top: 35px; padding-top: 10px; border-top: 1px solid #dddddd; color: #777777; font-size: 9px; }
                        .overview { font-size: 14px; margin-top: 10px; margin-bottom: 10px; }
                        .exposure-level { font-size: 14px; font-weight: bold; margin-bottom: 20px; }
                        ul { padding-left: 20px; }
                        li { margin-bottom: 4px; }
                    </style>
                </head>
                <body>
                """);

        html.append("""
                <div class="header">
                    <h1>UnveiledLens Security Report</h1>
                    <div class="subtitle">Discover Beyond the Known.</div>
                </div>
                """);

        html.append("<p><strong>Target Domain:</strong> ").append(domain).append("</p>");
        html.append("<p><strong>Scan Date:</strong> ").append(scannedAt).append("</p>");

        if (report.getExposureLevel() != null) {
            html.append("<div class=\"exposure-level\">Exposure Level: ")
                    .append(escape(report.getExposureLevel())).append("</div>");
        }

        if (report.getOverview() != null) {
            html.append("<div class=\"overview\">")
                    .append(escape(report.getOverview()))
                    .append("</div>");
        }

        if (report.getSummary() != null) {
            UserExposureSummary summary = report.getSummary();

            html.append("""
                    <div class="summary">
                        <div class="summary-card">
                            <div>Publicly Discovered</div>
                            <div class="summary-number">
                    """)
                    .append(summary.getPubliclyDiscovered())
                    .append("""
                            </div>
                        </div>
                        <div class="summary-card">
                            <div>Potential Signals</div>
                            <div class="summary-number">
                    """)
                    .append(summary.getPotentialSignals())
                    .append("""
                            </div>
                        </div>
                    </div>
                    """);

            html.append("<h2>Signal Breakdown</h2><ul>");
            html.append("<li>API Signals: ").append(summary.getApiSignals()).append("</li>");
            html.append("<li>GraphQL Signals: ").append(summary.getGraphqlSignals()).append("</li>");
            html.append("<li>Configuration Signals: ").append(summary.getConfigurationSignals()).append("</li>");
            html.append("<li>Storage Signals: ").append(summary.getStorageSignals()).append("</li>");
            html.append("</ul>");
        }

        html.append("""
                <div class="footer">
                    Generated by UnveiledLens.
                    This report contains aggregate findings only. Detailed vulnerability and attack-chain information has been intentionally omitted to protect the target system. Findings represent externally observable exposure signals and do not constitute proof of exploitation.
                </div>
                </body>
                </html>
                """);

        return html.toString();
    }

    private String buildAdminHtml(AdminExposureReport report) {
        String domain = escape(report.getDomain());
        String scannedAt = escape(report.getScannedAt());

        StringBuilder html = new StringBuilder();
        appendHtmlHeader(html);

        html.append("<p><strong>Target:</strong> ").append(domain).append("</p>");
        html.append("<p><strong>Scan Date:</strong> ").append(scannedAt).append("</p>");

        if (report.getSummary() != null) {
            var summary = report.getSummary();
            appendSummaryCards(
                    html,
                    summary.getTotalDiscovered(),
                    summary.getRelevantAssets(),
                    summary.getTotalFindings(),
                    summary.getReachableFindings()
            );
        }

        html.append("<h2>Findings</h2>");

        List<AdminExposureFinding> findings = report.getFindings();

        if (findings == null || findings.isEmpty()) {
            html.append("""
                    <p>
                        No significant security findings were identified
                        during this scan.
                    </p>
                    """);
        } else {
            for (AdminExposureFinding finding : findings) {
                appendFindingItem(
                        html,
                        finding.getSeverity(),
                        finding.getCategory(),
                        redactionService.redactUrl(finding.getUrl()),
                        redactionService.redact(finding.getReason()),
                        finding.getRiskLevel(),
                        finding.isReachable(),
                        finding.isAuthRequired(),
                        redactionService.redactList(finding.getEvidence()),
                        redactionService.redactList(finding.getAttackChainSignals()),
                        redactionService.redactList(finding.getCompliance()),
                        redactionService.redact(finding.getRemediation())
                );
            }
        }

        appendHtmlFooter(html);
        return html.toString();
    }

    private String buildHtml(ExposureReport report) {
        String domain = escape(report.getDomain());
        String scannedAt = escape(report.getScannedAt());

        StringBuilder html = new StringBuilder();
        appendHtmlHeader(html);

        html.append("<p><strong>Target:</strong> ").append(domain).append("</p>");
        html.append("<p><strong>Scan Date:</strong> ").append(scannedAt).append("</p>");

        if (report.getSummary() != null) {
            var summary = report.getSummary();
            appendSummaryCards(
                    html,
                    summary.getTotalDiscovered(),
                    summary.getRelevantAssets(),
                    summary.getTotalFindings(),
                    summary.getReachableFindings()
            );
        }

        html.append("<h2>Findings</h2>");

        List<ExposureFinding> findings = report.getFindings();

        if (findings == null || findings.isEmpty()) {
            html.append("""
                    <p>
                        No significant security findings were identified
                        during this scan.
                    </p>
                    """);
        } else {
            for (ExposureFinding finding : findings) {
                appendFindingItem(
                        html,
                        finding.getSeverity(),
                        finding.getCategory(),
                        redactionService.redactUrl(finding.getUrl()),
                        redactionService.redact(finding.getReason()),
                        finding.getRiskLevel(),
                        finding.isReachable(),
                        finding.isAuthRequired(),
                        redactionService.redactList(finding.getEvidence()),
                        redactionService.redactList(finding.getAttackChainSignals()),
                        redactionService.redactList(finding.getCompliance()),
                        redactionService.redact(finding.getRemediation())
                );
            }
        }

        appendHtmlFooter(html);
        return html.toString();
    }

    private void appendHtmlHeader(StringBuilder html) {
        html.append("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8" />
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
                            color: #555555;
                            margin-top: 5px;
                            font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
                            word-wrap: break-word;
                        }
                        .section {
                            margin-top: 10px;
                        }
                        ul {
                            padding-left: 20px;
                        }
                        li {
                            margin-bottom: 3px;
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
                <div class="header">
                    <h1>UnveiledLens Security Report</h1>
                    <div class="subtitle">
                        Discover Beyond the Known.
                    </div>
                </div>
                """);
    }

    private void appendHtmlFooter(StringBuilder html) {
        html.append("""
                <div class="footer">
                    Generated by UnveiledLens.
                    Findings represent externally observable exposure
                    signals and do not constitute proof of exploitation.
                </div>
                </body>
                </html>
                """);
    }

    private void appendSummaryCards(
            StringBuilder html,
            int totalDiscovered,
            int relevantAssets,
            int totalFindings,
            int reachableFindings
    ) {
        html.append("""
                <div class="summary">
                    <div class="summary-card">
                        <div>Total Discovered</div>
                        <div class="summary-number">
                """)
                .append(totalDiscovered)
                .append("""
                        </div>
                    </div>
                    <div class="summary-card">
                        <div>Relevant Assets</div>
                        <div class="summary-number">
                """)
                .append(relevantAssets)
                .append("""
                        </div>
                    </div>
                    <div class="summary-card">
                        <div>Total Findings</div>
                        <div class="summary-number">
                """)
                .append(totalFindings)
                .append("""
                        </div>
                    </div>
                    <div class="summary-card">
                        <div>Reachable</div>
                        <div class="summary-number">
                """)
                .append(reachableFindings)
                .append("""
                        </div>
                    </div>
                </div>
                """);
    }

    private void appendFindingItem(
            StringBuilder html,
            String rawSeverity,
            String rawCategory,
            String redactedUrl,
            String redactedReason,
            String rawRiskLevel,
            boolean reachable,
            boolean authRequired,
            List<String> redactedEvidence,
            List<String> redactedAttackChainSignals,
            List<String> redactedCompliance,
            String redactedRemediation
    ) {
        String severity = escape(rawSeverity);
        String category = escape(rawCategory);
        String url = escape(redactedUrl);

        html.append("<div class=\"finding\">");
        html.append("<h3>").append(category).append("</h3>");
        html.append("<div class=\"severity ").append(severityClass(rawSeverity)).append("\">").append(severity).append("</div>");

        if (url != null && !url.isBlank()) {
            html.append("<div class=\"meta\"><strong>Resource:</strong> ").append(url).append("</div>");
        }

        if (redactedReason != null && !redactedReason.isBlank()) {
            html.append("""
                    <div class="section">
                        <strong>Analysis</strong>
                    </div>
                    """);
            html.append("<p>").append(escape(redactedReason)).append("</p>");
        }

        if (rawRiskLevel != null && !rawRiskLevel.isBlank()) {
            html.append("<p><strong>Risk Level:</strong> ")
                    .append(escape(rawRiskLevel))
                    .append("</p>");
        }

        if (reachable) {
            html.append("<p><strong>Status:</strong> Appears reachable</p>");
        }

        if (authRequired) {
            html.append("<p><strong>Authentication:</strong> Required</p>");
        } else {
            html.append("<p><strong>Authentication:</strong> Not confirmed</p>");
        }

        appendList(html, "Evidence", redactedEvidence);
        appendList(html, "Potential Attack Chains", redactedAttackChainSignals);
        appendList(html, "DPDP Relevance", redactedCompliance);

        if (redactedRemediation != null && !redactedRemediation.isBlank()) {
            html.append("""
                    <div class="section">
                        <strong>Recommended Remediation</strong>
                    </div>
                    """);
            html.append("<p>").append(escape(redactedRemediation)).append("</p>");
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