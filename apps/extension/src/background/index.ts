interface CaptureResult {
  success: boolean;
  data?: { html: string; title: string };
  error?: string;
}

// MV3: use chrome.runtime.onMessage with async/await via a wrapper
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SAVE_PAGE') {
    handleSavePage().then(sendResponse);
    return true; // keep channel open
  }
});

async function handleSavePage(): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) {
      return { success: false, message: 'No active tab found' };
    }

    // Try content script capture
    let response: CaptureResult | undefined;
    try {
      response = await chrome.tabs.sendMessage(tab.id, { type: 'CAPTURE_PAGE' });
    } catch {
      // Content script not available
    }

    if (response?.success && response.data) {
      return await sendToApi({
        url: tab.url,
        title: response.data.title || tab.title || '',
        html: response.data.html,
      });
    }

    // Fallback: URL only (Puppeteer will handle it)
    return await sendToApi({ url: tab.url, title: tab.title || '' });
  } catch (error: any) {
    return { success: false, message: error.message || 'Unknown error' };
  }
}

async function sendToApi(payload: {
  url: string;
  title: string;
  html?: string;
}): Promise<{ success: boolean; message: string; id?: string }> {
  const { apiBaseUrl = 'http://localhost:8080' } = await chrome.storage.sync.get('apiBaseUrl');

  const res = await fetch(`${apiBaseUrl}/api/archives`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const data = await res.json();
  return { success: true, message: '저장 완료!', id: data.id };
}
