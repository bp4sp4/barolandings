type SlackPayload = {
  text: string;
};

// Slack Incoming Webhook 알림
export async function sendSlackNotification(payload: SlackPayload) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[SLACK] SLACK_WEBHOOK_URL 미설정 - 슬랙 알림 건너뜀");
    return { success: false, reason: "missing_webhook" };
  }

  // 5초 타임아웃
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error("[SLACK] 전송 실패:", res.status, await res.text());
      return { success: false, status: res.status };
    }

    return { success: true };
  } catch (error) {
    console.error("[SLACK] 전송 예외:", error);
    return { success: false, error };
  } finally {
    clearTimeout(timeout);
  }
}
