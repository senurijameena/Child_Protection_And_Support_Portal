package com.example.childPortal.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AiReportSummaryService {

    private final ObjectProvider<org.springframework.ai.chat.client.ChatClient.Builder> chatClientBuilderProvider;
    private final String openAiApiKey;

    public AiReportSummaryService(
            ObjectProvider<org.springframework.ai.chat.client.ChatClient.Builder> chatClientBuilderProvider,
            @Value("${spring.ai.openai.api-key:}") String openAiApiKey) {
        this.chatClientBuilderProvider = chatClientBuilderProvider;
        this.openAiApiKey = openAiApiKey;
    }

    public String generateCompletedRequestSummary(String context) {
        if (!isRealApiKeyConfigured()) {
            return "AI summary unavailable: OPENAI_API_KEY is not configured. "
                    + "Add a valid key in backend environment to enable Spring AI summaries.";
        }

        org.springframework.ai.chat.client.ChatClient.Builder builder = chatClientBuilderProvider.getIfAvailable();
        if (builder == null) {
            return "AI summary unavailable because Spring AI ChatClient is not configured. "
                    + "Verify OpenAI starter dependency and application properties.";
        }
        try {
            org.springframework.ai.chat.client.ChatClient chatClient = builder.build();
            String summary = chatClient.prompt()
                    .system("""
                            You are writing an official summary for a completed social work support report.
                            Keep it concise, factual, and suitable for admin review.
                            Mention completion quality, risks, and recommendation in 4-6 sentences.
                            """)
                    .user(context)
                    .call()
                    .content();
            if (StringUtils.hasText(summary)) {
                return summary.trim();
            }
        } catch (Exception ex) {
            return "AI summary generation failed: " + safeError(ex.getMessage())
                    + ". Review timeline and follow-up outcome details manually.";
        }
        return "AI summary generation failed at this time. Review timeline and follow-up outcome details manually.";
    }

    private boolean isRealApiKeyConfigured() {
        if (!StringUtils.hasText(openAiApiKey)) return false;
        String key = openAiApiKey.trim();
        return !key.equals("sk-dummy-key-for-startup") && !key.contains("dummy");
    }

    private String safeError(String message) {
        if (!StringUtils.hasText(message)) return "Unknown model error";
        String normalized = message.replace('\n', ' ').trim();
        return normalized.length() > 120 ? normalized.substring(0, 120) + "..." : normalized;
    }
}
