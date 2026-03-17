const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const apiUrlInput = document.getElementById('api-url') as HTMLInputElement;

chrome.storage.sync.get('apiBaseUrl', ({ apiBaseUrl }) => {
  apiUrlInput.value = apiBaseUrl || 'http://localhost:8080';
});

apiUrlInput.addEventListener('change', () => {
  chrome.storage.sync.set({ apiBaseUrl: apiUrlInput.value });
});

saveBtn.addEventListener('click', async () => {
  saveBtn.disabled = true;
  setStatus('saving', '저장 중...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) {
      setStatus('error', '탭을 찾을 수 없습니다');
      return;
    }

    // Try content script capture
    let html: string | undefined;
    let title = tab.title || '';
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'CAPTURE_PAGE' });
      if (response?.success && response.data) {
        html = response.data.html;
        title = response.data.title || title;
      }
    } catch {
      // Content script not available — will fallback to Puppeteer
    }

    // Send to API
    const { apiBaseUrl = 'http://localhost:8080' } = await chrome.storage.sync.get('apiBaseUrl');
    const res = await fetch(`${apiBaseUrl}/api/archives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: tab.url, title, html }),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);

    setStatus('success', '저장 완료!');
  } catch (error: any) {
    setStatus('error', `실패: ${error.message}`);
  } finally {
    saveBtn.disabled = false;
  }
});

function setStatus(type: 'saving' | 'success' | 'error', text: string) {
  statusEl.className = `status ${type}`;
  statusEl.textContent = text;
}
