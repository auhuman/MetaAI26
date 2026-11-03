/**
 * SplitSmart AI - Popup Application Logic
 * Meta Global AI Developer Hackathon 2026
 */

import { MetaModelClient } from './meta-api.js';
import { SplitwiseClient } from './splitwise-api.js';
import { SAMPLE_RECEIPT_SVG, SAMPLE_DICTATION } from './sample-data.js';

class SplitSmartApp {
  constructor() {
    this.metaClient = new MetaModelClient();
    this.splitwiseClient = new SplitwiseClient();

    // App state
    this.receiptImageBase64 = null;
    this.speechRecognition = null;
    this.isRecording = false;
    this.analysisResult = null;
    this.friendsList = [];
    this.groupsList = [];
    this.currentUser = null;

    // DOM Elements
    this.dom = {
      // Views
      captureView: document.getElementById('captureView'),
      breakdownView: document.getElementById('breakdownView'),
      backToCaptureBtn: document.getElementById('backToCaptureBtn'),

      // Header
      modeBadge: document.getElementById('modeBadge'),
      settingsBtn: document.getElementById('settingsBtn'),

      // Receipt Source
      captureTabBtn: document.getElementById('captureTabBtn'),
      fileUploadInput: document.getElementById('fileUploadInput'),
      loadSampleBtn: document.getElementById('loadSampleBtn'),
      receiptPreviewContainer: document.getElementById('receiptPreviewContainer'),
      receiptImagePreview: document.getElementById('receiptImagePreview'),
      removeImageBtn: document.getElementById('removeImageBtn'),

      // Voice Dictation
      micBtn: document.getElementById('micBtn'),
      micStatusText: document.getElementById('micStatusText'),
      dictationInput: document.getElementById('dictationInput'),
      presetChips: document.querySelectorAll('.chip'),

      // Primary Action
      analyzeBtn: document.getElementById('analyzeBtn'),
      analyzeSpinner: document.getElementById('analyzeSpinner'),
      analyzeBtnText: document.getElementById('analyzeBtnText'),

      // Breakdown View
      viewRestaurantName: document.getElementById('viewRestaurantName'),
      receiptTotalDisplay: document.getElementById('receiptTotalDisplay'),
      receiptSubtotalDisplay: document.getElementById('receiptSubtotalDisplay'),
      receiptTaxDisplay: document.getElementById('receiptTaxDisplay'),
      receiptTipDisplay: document.getElementById('receiptTipDisplay'),
      receiptFeesDisplay: document.getElementById('receiptFeesDisplay'),
      reconciliationBanner: document.getElementById('reconciliationBanner'),
      reconciliationText: document.getElementById('reconciliationText'),
      participantCountBadge: document.getElementById('participantCountBadge'),
      participantsList: document.getElementById('participantsList'),

      // Splitwise section
      splitwiseGroupSelect: document.getElementById('splitwiseGroupSelect'),
      splitwisePayerSelect: document.getElementById('splitwisePayerSelect'),
      friendsResolutionContainer: document.getElementById('friendsResolutionContainer'),
      syncSplitwiseBtn: document.getElementById('syncSplitwiseBtn'),
      syncSpinner: document.getElementById('syncSpinner'),
      syncBtnText: document.getElementById('syncBtnText'),
      splitwiseResultBox: document.getElementById('splitwiseResultBox'),

      // Settings Modal
      settingsModal: document.getElementById('settingsModal'),
      closeSettingsBtn: document.getElementById('closeSettingsBtn'),
      offlineModeToggle: document.getElementById('offlineModeToggle'),
      metaApiKeyInput: document.getElementById('metaApiKeyInput'),
      metaEndpointInput: document.getElementById('metaEndpointInput'),
      splitwiseApiKeyInput: document.getElementById('splitwiseApiKeyInput'),
      splitwiseBaseUrlInput: document.getElementById('splitwiseBaseUrlInput'),
      resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),
      saveSettingsBtn: document.getElementById('saveSettingsBtn'),

      // Toast
      toast: document.getElementById('toast')
    };

    this.init();
  }

  async init() {
    await this.loadSettings();
    this.initEventListeners();
    this.initSpeechRecognition();
  }

  /* ----------------------------------------------------
   * SETTINGS & STORAGE MANAGEMENT
   * ---------------------------------------------------- */
  async loadSettings() {
    const data = await chrome.storage.local.get([
      'offlineMode',
      'metaApiKey',
      'metaEndpoint',
      'splitwiseApiKey',
      'splitwiseBaseUrl'
    ]);

    const offlineMode = data.offlineMode ?? true;
    const metaApiKey = data.metaApiKey || '';
    const metaEndpoint = data.metaEndpoint || 'https://api.meta.ai/v1';
    const splitwiseApiKey = data.splitwiseApiKey || '';
    const splitwiseBaseUrl = data.splitwiseBaseUrl || 'https://secure.splitwise.com/api/v3.0';

    this.dom.offlineModeToggle.checked = offlineMode;
    this.dom.metaApiKeyInput.value = metaApiKey;
    this.dom.metaEndpointInput.value = metaEndpoint;
    this.dom.splitwiseApiKeyInput.value = splitwiseApiKey;
    this.dom.splitwiseBaseUrlInput.value = splitwiseBaseUrl;

    this.updateModeBadge(offlineMode);

    this.metaClient.updateConfig({
      apiKey: metaApiKey,
      baseUrl: metaEndpoint,
      offlineMode: offlineMode
    });

    this.splitwiseClient.updateConfig({
      apiKey: splitwiseApiKey,
      baseUrl: splitwiseBaseUrl,
      offlineMode: offlineMode
    });
  }

  async saveSettings() {
    const offlineMode = this.dom.offlineModeToggle.checked;
    const metaApiKey = this.dom.metaApiKeyInput.value.trim();
    const metaEndpoint = this.dom.metaEndpointInput.value.trim() || 'https://api.meta.ai/v1';
    const splitwiseApiKey = this.dom.splitwiseApiKeyInput.value.trim();
    const splitwiseBaseUrl = this.dom.splitwiseBaseUrlInput.value.trim() || 'https://secure.splitwise.com/api/v3.0';

    await chrome.storage.local.set({
      offlineMode,
      metaApiKey,
      metaEndpoint,
      splitwiseApiKey,
      splitwiseBaseUrl
    });

    this.updateModeBadge(offlineMode);

    this.metaClient.updateConfig({
      apiKey: metaApiKey,
      baseUrl: metaEndpoint,
      offlineMode: offlineMode
    });

    this.splitwiseClient.updateConfig({
      apiKey: splitwiseApiKey,
      baseUrl: splitwiseBaseUrl,
      offlineMode: offlineMode
    });

    this.closeSettings();
    this.showToast('✓ Settings successfully saved');
  }

  updateModeBadge(isOffline) {
    if (isOffline) {
      this.dom.modeBadge.className = 'mode-pill demo';
      this.dom.modeBadge.textContent = 'Demo Mode';
      this.dom.modeBadge.title = 'Offline mode active - using simulated responses';
    } else {
      this.dom.modeBadge.className = 'mode-pill live';
      this.dom.modeBadge.textContent = 'Live API';
      this.dom.modeBadge.title = 'Live Meta & Splitwise API active';
    }
  }

  openSettings() {
    this.dom.settingsModal.classList.remove('hidden');
  }

  closeSettings() {
    this.dom.settingsModal.classList.add('hidden');
  }

  /* ----------------------------------------------------
   * EVENT LISTENERS
   * ---------------------------------------------------- */
  initEventListeners() {
    // Settings modal events
    this.dom.settingsBtn.addEventListener('click', () => this.openSettings());
    this.dom.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    this.dom.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    this.dom.resetDefaultsBtn.addEventListener('click', () => {
      this.dom.offlineModeToggle.checked = true;
      this.dom.metaApiKeyInput.value = '';
      this.dom.metaEndpointInput.value = 'https://api.meta.ai/v1';
      this.dom.splitwiseApiKeyInput.value = '';
      this.dom.splitwiseBaseUrlInput.value = 'https://secure.splitwise.com/api/v3.0';
      this.showToast('Reset fields to defaults');
    });

    // Capture tab screenshot
    this.dom.captureTabBtn.addEventListener('click', () => this.handleCaptureTab());

    // File upload
    this.dom.fileUploadInput.addEventListener('change', (e) => this.handleFileUpload(e));

    // Load sample receipt
    this.dom.loadSampleBtn.addEventListener('click', () => this.loadSampleReceipt());

    // Remove preview image
    this.dom.removeImageBtn.addEventListener('click', () => this.clearReceiptImage());

    // Voice dictation mic
    this.dom.micBtn.addEventListener('click', () => this.toggleVoiceRecording());

    // Preset chips
    this.dom.presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        this.dom.dictationInput.value = prompt;
        this.showToast('Prompt copied to dictation');
      });
    });

    // Analyze receipt CTA
    this.dom.analyzeBtn.addEventListener('click', () => this.handleAnalyzeReceipt());

    // Back button in breakdown view
    this.dom.backToCaptureBtn.addEventListener('click', () => {
      this.switchView('captureView');
    });

    // Splitwise Sync CTA
    this.dom.syncSplitwiseBtn.addEventListener('click', () => this.handleSplitwiseSync());
  }

  /* ----------------------------------------------------
   * TAB CAPTURE & IMAGE HANDLING
   * ---------------------------------------------------- */
  handleCaptureTab() {
    try {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError || !dataUrl) {
          const errMsg = chrome.runtime.lastError?.message || 'Failed to capture tab';
          console.warn('[SplitSmart AI] Direct tab capture failed:', errMsg);
          this.showToast(`Capture failed: ${errMsg}`);
          // Offer sample receipt fallback
          this.loadSampleReceipt();
        } else {
          this.setReceiptImage(dataUrl);
          this.showToast('📸 Visible tab captured!');
        }
      });
    } catch (err) {
      console.warn('[SplitSmart AI] Tab capture error:', err);
      this.showToast('Tab capture unavailable in this context, loading sample.');
      this.loadSampleReceipt();
    }
  }

  handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.setReceiptImage(e.target.result);
      this.showToast('Receipt image loaded!');
    };
    reader.readAsDataURL(file);
  }

  loadSampleReceipt() {
    this.setReceiptImage(SAMPLE_RECEIPT_SVG);
    if (!this.dom.dictationInput.value.trim()) {
      this.dom.dictationInput.value = SAMPLE_DICTATION;
    }
    this.showToast('Sample Ramen receipt & dictation loaded!');
  }

  setReceiptImage(dataUrl) {
    this.receiptImageBase64 = dataUrl;
    this.dom.receiptImagePreview.src = dataUrl;
    this.dom.receiptPreviewContainer.classList.remove('hidden');
  }

  clearReceiptImage() {
    this.receiptImageBase64 = null;
    this.dom.receiptImagePreview.src = '';
    this.dom.receiptPreviewContainer.classList.add('hidden');
    this.dom.fileUploadInput.value = '';
    this.showToast('Image removed');
  }

  /* ----------------------------------------------------
   * WEB SPEECH API / VOICE DICTATION
   * ---------------------------------------------------- */
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.dom.micStatusText.textContent = 'Voice dictation not supported in browser';
      this.dom.micBtn.disabled = true;
      this.dom.micBtn.style.opacity = '0.5';
      return;
    }

    this.speechRecognition = new SpeechRecognition();
    this.speechRecognition.continuous = false;
    this.speechRecognition.interimResults = true;
    this.speechRecognition.lang = 'en-US';

    this.speechRecognition.onstart = () => {
      this.isRecording = true;
      this.dom.micBtn.classList.add('recording');
      this.dom.micStatusText.textContent = 'Listening... Speak your split instructions';
    };

    this.speechRecognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      this.dom.dictationInput.value = transcript;
    };

    this.speechRecognition.onerror = (event) => {
      console.warn('[SplitSmart AI] Speech recognition error:', event.error);
      this.stopVoiceRecording();
      this.dom.micStatusText.textContent = `Mic error: ${event.error}. You can type instructions above.`;
    };

    this.speechRecognition.onend = () => {
      this.stopVoiceRecording();
    };
  }

  toggleVoiceRecording() {
    if (!this.speechRecognition) {
      this.showToast('Voice dictation not supported');
      return;
    }

    if (this.isRecording) {
      this.speechRecognition.stop();
      this.stopVoiceRecording();
    } else {
      try {
        this.speechRecognition.start();
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  }

  stopVoiceRecording() {
    this.isRecording = false;
    this.dom.micBtn.classList.remove('recording');
    this.dom.micStatusText.textContent = 'Tap mic to speak your split instructions';
  }

  /* ----------------------------------------------------
   * AI ANALYSIS & PENNY-PERFECT RECONCILIATION
   * ---------------------------------------------------- */
  async handleAnalyzeReceipt() {
    // If no image is provided, auto-load sample receipt
    if (!this.receiptImageBase64) {
      this.loadSampleReceipt();
    }

    const dictation = this.dom.dictationInput.value.trim();

    // Show loading UI
    this.setAnalyzeLoading(true);

    try {
      const result = await this.metaClient.analyzeReceipt({
        imageBase64: this.receiptImageBase64,
        voiceInstructions: dictation
      });

      this.analysisResult = result;
      this.renderBreakdownView(result);
      this.switchView('breakdownView');

      if (result._warning) {
        this.showToast(result._warning);
      } else {
        this.showToast('✓ Split breakdown reconciled successfully!');
      }

      // Initialize Splitwise data
      this.prepareSplitwiseIntegration(result);

    } catch (err) {
      console.error('[SplitSmart AI] Analysis error:', err);
      this.showToast(`Analysis failed: ${err.message}`);
    } finally {
      this.setAnalyzeLoading(false);
    }
  }

  setAnalyzeLoading(isLoading) {
    if (isLoading) {
      this.dom.analyzeBtn.disabled = true;
      this.dom.analyzeSpinner.classList.remove('hidden');
      this.dom.analyzeBtnText.textContent = 'Analyzing with Muse Spark 1.3...';
    } else {
      this.dom.analyzeBtn.disabled = false;
      this.dom.analyzeSpinner.classList.add('hidden');
      this.dom.analyzeBtnText.textContent = '✨ Analyze with Muse Spark 1.3';
    }
  }

  renderBreakdownView(data) {
    this.dom.viewRestaurantName.textContent = data.restaurant || 'Receipt Breakdown';
    this.dom.receiptTotalDisplay.textContent = `$${data.total.toFixed(2)}`;
    this.dom.receiptSubtotalDisplay.textContent = `$${data.subtotal.toFixed(2)}`;
    this.dom.receiptTaxDisplay.textContent = `$${data.tax.toFixed(2)}`;
    this.dom.receiptTipDisplay.textContent = `$${data.tip.toFixed(2)}`;
    this.dom.receiptFeesDisplay.textContent = `$${data.fees.toFixed(2)}`;

    // Reconciliation banner
    const recon = data.reconciliation;
    if (recon.isPennyPerfect) {
      this.dom.reconciliationBanner.className = 'reconciliation-pill success';
      this.dom.reconciliationText.textContent = `✓ Cent-reconciled: Sum of shares strictly equals $${recon.receiptTotal.toFixed(2)} down to the cent`;
    } else {
      this.dom.reconciliationBanner.className = 'reconciliation-pill error';
      this.dom.reconciliationText.textContent = `Rounding Discrepancy: $${recon.discrepancy.toFixed(2)}`;
    }

    // Participants list
    const participants = data.participants || [];
    this.dom.participantCountBadge.textContent = `${participants.length} Diners`;
    this.dom.participantsList.innerHTML = '';

    participants.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'participant-card';

      const weightPct = ((p.shareWeight || 0) * 100).toFixed(0);
      const initial = (p.name || 'D')[0].toUpperCase();

      let itemsHtml = '';
      (p.assignedItems || []).forEach(item => {
        itemsHtml += `
          <div class="p-item-row">
            <span class="p-item-name">${item.shareFraction !== '1/1' ? `[${item.shareFraction}] ` : ''}${item.name}</span>
            <span class="p-item-price">$${item.allocatedPrice.toFixed(2)}</span>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="p-header">
          <div class="p-name-badge">
            <div class="p-avatar">${initial}</div>
            <div>
              <div class="p-name">${p.name} ${p.name.toLowerCase() === 'me' ? '<span style="color:#60a5fa; font-size:11px;">(You)</span>' : ''}</div>
              <div class="p-share-percent">${weightPct}% of food items</div>
            </div>
          </div>
          <div class="p-total-badge">$${p.finalTotal.toFixed(2)}</div>
        </div>
        <div class="p-items-list">
          ${itemsHtml || '<span style="color:var(--text-dim)">No items assigned</span>'}
        </div>
        <div class="p-math-breakdown">
          <span>Items: $${p.subtotal.toFixed(2)}</span>
          <span>Tax: $${p.taxShare.toFixed(2)}</span>
          <span>Tip: $${p.tipShare.toFixed(2)}</span>
          ${p.feeShare > 0 ? `<span>Fee: $${p.feeShare.toFixed(2)}</span>` : ''}
        </div>
      `;

      this.dom.participantsList.appendChild(card);
    });
  }

  /* ----------------------------------------------------
   * SPLITWISE INTEGRATION
   * ---------------------------------------------------- */
  async prepareSplitwiseIntegration(data) {
    this.dom.splitwiseResultBox.classList.add('hidden');
    this.dom.splitwiseGroupSelect.innerHTML = '<option value="">Loading Splitwise groups...</option>';
    this.dom.splitwisePayerSelect.innerHTML = '<option value="">Resolving user...</option>';

    try {
      // 1. Fetch current user
      this.currentUser = await this.splitwiseClient.getCurrentUser();

      // 2. Fetch friends & groups
      const [friends, groups] = await Promise.all([
        this.splitwiseClient.getFriends(),
        this.splitwiseClient.getGroups()
      ]);

      this.friendsList = friends;
      this.groupsList = groups;

      // Populate group selector
      this.dom.splitwiseGroupSelect.innerHTML = '';
      groups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = `${g.name} (${g.members ? g.members.length : 0} members)`;
        this.dom.splitwiseGroupSelect.appendChild(opt);
      });

      // Populate payer selector
      this.dom.splitwisePayerSelect.innerHTML = '';
      const meOpt = document.createElement('option');
      meOpt.value = this.currentUser.id;
      meOpt.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name || ''} (You - Payer)`;
      meOpt.selected = true;
      this.dom.splitwisePayerSelect.appendChild(meOpt);

      friends.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = `${f.first_name} ${f.last_name || ''}`;
        this.dom.splitwisePayerSelect.appendChild(opt);
      });

      // Render friend resolution list
      this.renderFriendsResolution(data.participants);

    } catch (err) {
      console.warn('[SplitSmart AI] Splitwise preparation error:', err);
      this.dom.splitwiseGroupSelect.innerHTML = '<option value="0">Default Non-Group Expense</option>';
      this.dom.splitwisePayerSelect.innerHTML = '<option value="me">You (Default)</option>';
    }
  }

  renderFriendsResolution(participants) {
    this.dom.friendsResolutionContainer.innerHTML = '';

    participants.forEach(p => {
      const match = this.splitwiseClient.resolveParticipantToUser(p.name, this.currentUser, this.friendsList);
      p.splitwiseUser = match.user;

      const pill = document.createElement('div');
      pill.className = 'friend-pill';
      pill.innerHTML = `
        <div class="fp-left">
          <span>${match.isCurrentUser ? '👤' : '👥'}</span>
          <span><strong>${p.name}</strong> ➔ ${match.displayName}</span>
        </div>
        <span class="fp-amount">$${p.finalTotal.toFixed(2)}</span>
      `;
      this.dom.friendsResolutionContainer.appendChild(pill);
    });
  }

  async handleSplitwiseSync() {
    if (!this.analysisResult) return;

    this.setSyncLoading(true);

    try {
      const selectedGroupId = parseInt(this.dom.splitwiseGroupSelect.value, 10) || null;
      const paidByUserId = parseInt(this.dom.splitwisePayerSelect.value, 10) || this.currentUser?.id;

      const participantShares = this.analysisResult.participants.map(p => {
        const resolved = this.splitwiseClient.resolveParticipantToUser(p.name, this.currentUser, this.friendsList);
        return {
          name: p.name,
          userId: resolved.user.id,
          amount: p.finalTotal
        };
      });

      const response = await this.splitwiseClient.createExpense({
        cost: this.analysisResult.total,
        description: `${this.analysisResult.restaurant || 'Dinner'} (SplitSmart AI)`,
        groupId: selectedGroupId,
        participantShares: participantShares,
        paidByUserId: paidByUserId
      });

      // Display success box
      this.dom.splitwiseResultBox.classList.remove('hidden');
      this.dom.splitwiseResultBox.innerHTML = `
        <div style="font-weight:700; margin-bottom:4px;">🎉 Expense Successfully Recorded!</div>
        <div>Expense Total: <strong>$${this.analysisResult.total.toFixed(2)}</strong></div>
        <div style="font-size:11px; margin-top:4px;">
          ${response.message}
        </div>
      `;

      this.showToast('⚡ Expense synced to Splitwise!');

    } catch (err) {
      console.error('[SplitSmart AI] Sync failed:', err);
      this.dom.splitwiseResultBox.classList.remove('hidden');
      this.dom.splitwiseResultBox.style.background = 'rgba(239, 68, 68, 0.15)';
      this.dom.splitwiseResultBox.style.borderColor = 'rgba(239, 68, 68, 0.35)';
      this.dom.splitwiseResultBox.style.color = '#f87171';
      this.dom.splitwiseResultBox.innerHTML = `
        <strong>Sync Error:</strong> ${err.message}
      `;
      this.showToast(`Sync failed: ${err.message}`);
    } finally {
      this.setSyncLoading(false);
    }
  }

  setSyncLoading(isLoading) {
    if (isLoading) {
      this.dom.syncSplitwiseBtn.disabled = true;
      this.dom.syncSpinner.classList.remove('hidden');
      this.dom.syncBtnText.textContent = 'Syncing to Splitwise...';
    } else {
      this.dom.syncSplitwiseBtn.disabled = false;
      this.dom.syncSpinner.classList.add('hidden');
      this.dom.syncBtnText.textContent = '⚡ Sync Expense to Splitwise';
    }
  }

  /* ----------------------------------------------------
   * UI NAVIGATION & HELPERS
   * ---------------------------------------------------- */
  switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => {
      v.classList.remove('active');
      v.classList.add('hidden');
    });

    const target = document.getElementById(viewId);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
    }
  }

  showToast(message) {
    this.dom.toast.textContent = message;
    this.dom.toast.classList.remove('hidden');

    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.dom.toast.classList.add('hidden');
    }, 2800);
  }
}

// Instantiate app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SplitSmartApp();
});

