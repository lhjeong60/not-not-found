interface CaptureResult {
  success: boolean;
  data?: { html: string; title: string };
  error?: string;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SAVE_PAGE') {
    handleSavePage()
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleSavePage(): Promise<{ success: boolean; message: string; id?: string }> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) {
    return { success: false, message: 'No active tab found' };
  }

  // Send capture request to content script
  const response: CaptureResult = await chrome.tabs.sendMessage(tab.id, {
    type: 'CAPTURE_PAGE',
  });

  if (!response.success || !response.data) {
    // Fallback: send URL only (server will use Puppeteer)
    return await sendToApi({ url: tab.url, title: tab.title || '' });
  }

  return await sendToApi({
    url: tab.url,
    title: response.data.title || tab.title || '',
    html: response.data.html,
  });
}

async function sendToApi(payload: {
  url: string;
  title: string;
  html?: string;
}): Promise<{ success: boolean; message: string; id?: string }> {
  const { apiBaseUrl = 'http://localhost:8080' } = await chrome.storage.sync.get('apiBaseUrl');

  try {
    const res = await fetch(`${apiBaseUrl}/api/archives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    return { success: true, message: 'Archive saved!', id: data.id };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to save' };
  }
}
