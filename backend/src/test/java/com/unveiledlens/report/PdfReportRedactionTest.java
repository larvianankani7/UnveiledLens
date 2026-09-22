package com.unveiledlens.report;

import com.unveiledlens.admin.AdminRedactionService;
import com.unveiledlens.admin.dto.AdminExposureFinding;
import com.unveiledlens.admin.dto.AdminExposureReport;
import com.unveiledlens.admin.dto.AdminScanSummary;
import com.unveiledlens.discovery.dto.ExposureFinding;
import com.unveiledlens.discovery.dto.ExposureReport;
import com.unveiledlens.discovery.dto.ScanSummary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PdfReportRedactionTest {

    private AdminRedactionService redactionService;
    private PdfReportService pdfReportService;

    @BeforeEach
    void setUp() {
        redactionService = new AdminRedactionService();
        pdfReportService = new PdfReportService(redactionService);
    }

    @Test
    void testUrlRedactionPreservesStructureWhileRedactingSecrets() {
        // Query secret
        String urlWithToken = "https://example.com/api/v1/users?token=supersecret123";
        String redactedUrl1 = redactionService.redactUrl(urlWithToken);
        assertTrue(redactedUrl1.contains("https://example.com/api/v1/users?token=[REDACTED]"));
        assertFalse(redactedUrl1.contains("supersecret123"));

        // Sensitive path segment
        String urlWithPathUser = "https://example.com/api/v1/users/987654";
        String redactedUrl2 = redactionService.redactUrl(urlWithPathUser);
        assertTrue(redactedUrl2.contains("https://example.com/api/v1/users/***REDACTED***"));
        assertFalse(redactedUrl2.contains("987654"));

        // AWS key in path
        String urlWithAwsKey = "https://example.com/api/v1/keys/AKIAIOSFODNN7EXAMPLE";
        String redactedUrl3 = redactionService.redactUrl(urlWithAwsKey);
        assertTrue(redactedUrl3.contains("[REDACTED_AWS_KEY]"));
        assertFalse(redactedUrl3.contains("AKIAIOSFODNN7EXAMPLE"));

        // Safe documentation endpoint
        String safeDocUrl = "https://example.com/swagger-ui/index.html";
        String redactedUrl4 = redactionService.redactUrl(safeDocUrl);
        assertEquals("https://example.com/swagger-ui/index.html", redactedUrl4);
    }

    @Test
    void testPdfReportGenerationContainsRedactedEvidenceNotRawSecrets() {
        ExposureFinding rawFinding = ExposureFinding.builder()
                .category("API_ENDPOINT")
                .severity("HIGH")
                .url("https://example.com/api/v1/users/58291?token=raw_super_secret_token_123")
                .reason("Exposed user API endpoint containing raw_super_secret_token_123 and admin@example.com")
                .reachable(true)
                .authRequired(false)
                .riskLevel("HIGH")
                .evidence(List.of(
                        "API endpoint path pattern detected.",
                        "Authentication token observed: raw_super_secret_token_123",
                        "Admin contact: security@example.com"
                ))
                .attackChainSignals(List.of("UNPROTECTED_ADMIN_API"))
                .compliance(List.of("DPDP Sec 8(5) Data Protection"))
                .remediation("Revoke token raw_super_secret_token_123 and enforce authentication.")
                .build();

        ExposureReport rawReport = ExposureReport.builder()
                .domain("example.com")
                .scannedAt("2026-09-22T23:59:00Z")
                .summary(ScanSummary.builder()
                        .totalDiscovered(10)
                        .relevantAssets(5)
                        .totalFindings(1)
                        .reachableFindings(1)
                        .build())
                .findings(List.of(rawFinding))
                .build();

        byte[] pdfBytes = pdfReportService.generateReport(rawReport);
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);

        // Verify PDF signature
        String pdfHeader = new String(pdfBytes, 0, Math.min(10, pdfBytes.length), StandardCharsets.US_ASCII);
        assertTrue(pdfHeader.startsWith("%PDF"));

        // Verify that raw secrets are never in the rendered PDF content
        String fullPdfString = new String(pdfBytes, StandardCharsets.ISO_8859_1);
        assertFalse(fullPdfString.contains("raw_super_secret_token_123"), "Raw secret token must NOT appear in PDF");
        assertFalse(fullPdfString.contains("admin@example.com"), "Raw email must NOT appear in PDF");
        assertFalse(fullPdfString.contains("security@example.com"), "Raw email must NOT appear in PDF");
    }

    @Test
    void testAdminReportGenerationWithRedactedEvidence() {
        AdminExposureFinding adminFinding = AdminExposureFinding.builder()
                .category("API_ENDPOINT")
                .severity("HIGH")
                .url(redactionService.redactUrl("https://example.com/api/v1/users/12345?token=rawsecret"))
                .reason(redactionService.redact("Analysis of https://example.com/api/v1/users/***REDACTED***"))
                .reachable(true)
                .authRequired(false)
                .riskLevel("HIGH")
                .evidence(redactionService.redactList(List.of(
                        "Safe validation confirmed reachability.",
                        "Token parameter token=rawsecret was identified and redacted."
                )))
                .attackChainSignals(List.of("API_EXPOSURE"))
                .compliance(List.of("DPDP compliance review needed."))
                .remediation(redactionService.redact("Secure the endpoint."))
                .build();

        AdminExposureReport adminReport = AdminExposureReport.builder()
                .domain("example.com")
                .scannedAt("2026-09-22T23:59:00Z")
                .summary(AdminScanSummary.builder()
                        .totalDiscovered(12)
                        .relevantAssets(6)
                        .totalFindings(1)
                        .reachableFindings(1)
                        .build())
                .findings(List.of(adminFinding))
                .build();

        byte[] pdfBytes = pdfReportService.generateReport(adminReport);
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);

        String fullPdfString = new String(pdfBytes, StandardCharsets.ISO_8859_1);
        assertFalse(fullPdfString.contains("rawsecret"), "Raw secret must not be in PDF");
    }
}
