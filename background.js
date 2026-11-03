/**
 * SplitSmart AI - Background Service Worker (Manifest V3)
 * Meta Global AI Developer Hackathon 2026
 */

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[SplitSmart AI] Extension installed/updated:', details.reason);
  
  // Set sensible initial defaults if not already present
  const existing = await chrome.storage.local.get([
    'offlineMode',
    'metaApiKey',
    'splitwiseApiKey',
    'metaEndpoint',
    'splitwiseBaseUrl'
  ]);

  const updates = {};
  if (existing.offlineMode === undefined) {
    // Default to Offline Demo Mode so reviewers/judges can test immediately
    updates.offlineMode = true;
  }
  if (!existing.metaEndpoint) {
    updates.metaEndpoint = 'https://api.meta.ai/v1';
  }
  if (!existing.splitwiseBaseUrl) {
    updates.splitwiseBaseUrl = 'https://secure.splitwise.com/api/v3.0';
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
    console.log('[SplitSmart AI] Initialized default settings:', updates);
  }
});

// Listener for captureTab request from popup if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureVisibleTab') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, dataUrl });
      }
    });
    return true; // async response
  }
});

