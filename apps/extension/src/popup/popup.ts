const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const apiUrlInput = document.getElementById('api-url') as HTMLInputElement;

// Load saved API URL
chrome.storage.sync.get('apiBaseUrl', ({ apiBaseUrl }) => {
  apiUrlInput.value = apiBaseUrl || 'http://localhost:3000';
});

// Save API URL on change
apiUrlInput.addEventListener('change', () => {
  chrome.storage.sync.set({ apiBaseUrl: apiUrlInput.value });
});

saveBtn.addEventListener('click', async () => {
  saveBtn.disabled = true;
  setStatus('saving', '저장 중...');

  try {
    const response = await chrome.runtime.sendMessage({ type: 'SAVE_PAGE' });
    if (response.success) {
      setStatus('success', '저장 완료!');
    } else {
      setStatus('error', `실패: ${response.message}`);
    }
  } catch (error: any) {
    setStatus('error', `오류: ${error.message}`);
  } finally {
    saveBtn.disabled = false;
  }
});

function setStatus(type: 'saving' | 'success' | 'error', text: string) {
  statusEl.className = `status ${type}`;
  statusEl.textContent = text;
}
