# SplitSmart AI 🧾✨
### 100% Serverless Chrome Extension for the Meta Global AI Developer Hackathon 2026
**Powered by Meta Model API (Muse Spark 1.3) & Splitwise REST API v3.0**

---

## 🌟 Overview
**SplitSmart AI** is a fully client-side, serverless Chrome Extension (Manifest V3) that eliminates the headache of splitting restaurant bills and group expenses.

Instead of running an expensive intermediary backend, **SplitSmart AI operates 100% inside your browser**, issuing direct `fetch()` requests from the extension to the **Meta Model API (Muse Spark 1.3)** and the **Splitwise REST API v3.0**.

With single-click visible tab capture and voice dictation, you can speak natural split rules:
> *"Alex had ramen, Sarah and I shared gyoza, split tip and tax proportionally"*

SplitSmart AI extracts every line item, assigns shares, applies mathematical proportional tax/tip allocation, guarantees penny-perfect cent reconciliation, and creates the expense directly on Splitwise.

---

## 🚀 Key Features

1. **100% Serverless & Zero-Backend Architecture**:
   - Manifest V3 compliant with direct `fetch()` requests.
   - Host permissions scoped to `https://*.meta.ai/*` and `https://secure.splitwise.com/*`.
   - All credentials stored securely in `chrome.storage.local`.

2. **One-Click Tab Screenshot & File Drop**:
   - Captures active receipts directly from food delivery web apps or online receipts using `chrome.tabs.captureVisibleTab`.
   - File drag-and-drop / upload support.
   - Built-in **Demo Receipt** chip for instant hackathon evaluations.

3. **Web Speech API Voice Dictation**:
   - Hands-free voice recognition with live animated soundwave micro-interactions.
   - Real-time transcription into an editable prompt.
   - Quick preset chips for rapid testing without microphone access.

4. **Meta Muse Spark 1.3 Multi-Modal Model Integration**:
   - High-precision OCR parsing of receipt items, prices, subtotals, taxes, tips, and fees.
   - Contextual understanding of conversational split instructions.
   - Strict JSON Schema output format.

5. **Penny-Perfect Proportional Math Engine**:
   - Proportional allocation of tax, tip, and delivery fees based on each participant's item subtotal share.
   - Strict Invariant: **$\sum \text{Participant Shares} \equiv \text{Receipt Total}$ down to the exact cent**.
   - Employs the Hamilton / Hare-Niemeyer largest-remainder method to resolve fractional cent rounding residuals fairly.

6. **Splitwise REST API v3.0 Integration**:
   - Resolves Current User (`GET /get_current_user`).
   - Retrieves Friends List (`GET /get_friends`) and Groups (`GET /get_groups`).
   - Auto-matches participant names to Splitwise contacts (`Alex` ➔ `Alex Chen`, `Me` ➔ `You`).
   - Creates the expense with exact owed shares (`POST /create_expense`).

7. **Offline Demo Mode**:
   - Toggleable from the Settings modal.
   - Pre-loaded with realistic mock receipts and Splitwise responses so judges and reviewers can test the entire workflow with zero configuration or API keys needed.

---

## 📐 Architecture & Math Specification

```
┌────────────────────────────────────────────────────────┐
│             SplitSmart AI (Chrome Extension)            │
│  ┌──────────────────────┐    ┌──────────────────────┐  │
│  │   Visible Tab Shot   │    │    Web Speech API    │  │
│  │  (Receipt Screenshot)│    │   (Voice Dictate)    │  │
│  └──────────┬───────────┘    └──────────┬───────────┘  │
│             └─────────────┬─────────────┘              │
│                           ▼                            │
│           ┌──────────────────────────────┐             │
│           │ Direct Client fetch()        │             │
│           │ Meta Model API:              │             │
│           │ Muse Spark 1.3               │             │
│           └──────────────┬───────────────┘             │
│                          ▼                             │
│           ┌──────────────────────────────┐             │
│           │ Penny-Perfect Math Engine    │             │
│           │ • Proportional Tax/Tip/Fees │             │
│           │ • Hamilton Cent Rounding     │             │
│           └──────────────┬───────────────┘             │
│                          ▼                             │
│           ┌──────────────────────────────┐             │
│           │ Direct Client fetch()        │             │
│           │ Splitwise REST API v3.0:     │             │
│           │ • get_current_user           │             │
│           │ • get_friends / get_groups   │             │
│           │ • create_expense             │             │
│           └──────────────────────────────┘             │
└────────────────────────────────────────────────────────┘
```

### Proportional Math & Cent Reconciliation Rules
1. **Item Allocation**:
   $$\text{Subtotal}_p = \sum_{i \in \text{Items}_p} \frac{\text{Price}_i}{K_i}$$
   where $K_i$ is the number of participants sharing item $i$.

2. **Proportional Weight**:
   $$w_p = \frac{\text{Subtotal}_p}{\sum_k \text{Subtotal}_k}$$

3. **Proportional Additions**:
   $$\text{Tax}_p = \text{Tax} \times w_p, \quad \text{Tip}_p = \text{Tip} \times w_p, \quad \text{Fee}_p = \text{Fee} \times w_p$$

4. **Raw Total & Integer Cent Allocation**:
   $$\text{RawTotal}_p = \text{Subtotal}_p + \text{Tax}_p + \text{Tip}_p + \text{Fee}_p$$
   - Each participant's base cents: $\text{FloorCents}_p = \lfloor \text{RawTotal}_p \times 100 \rfloor$
   - Fractional remainder: $r_p = (\text{RawTotal}_p \times 100) - \text{FloorCents}_p$
   - Target cents: $\text{TargetCents} = \text{round}(\text{ReceiptTotal} \times 100)$
   - Discrepancy: $\Delta = \text{TargetCents} - \sum_p \text{FloorCents}_p$
   - Distribute the remaining $\Delta$ cents in descending order of $r_p$.
   - **Guarantees that the sum of all participant totals strictly equals the receipt total to the penny.**

---

## 📂 Repository Structure

```
MetaAI26/
├── manifest.json              # Chrome Manifest V3 configuration
├── background.js              # Background service worker & storage initializers
├── popup/
│   ├── popup.html             # Sleek Meta AI glassmorphism UI & modals
│   ├── popup.css              # Custom styling, dark mode, animations & responsive layout
│   ├── popup.js               # Event handlers, tab capture, Web Speech, UI orchestration
│   ├── meta-api.js            # Meta Model API (Muse Spark 1.3) client & math engine
│   ├── splitwise-api.js       # Splitwise REST API v3.0 client & name resolver
│   └── sample-data.js         # Embedded mock receipts, groups & friends for demo mode
├── icons/
│   ├── icon16.png             # 16x16 extension icon
│   ├── icon32.png             # 32x32 extension icon
│   ├── icon48.png             # 48x48 extension icon
│   └── icon128.png            # 128x128 extension icon
├── assets/
│   └── receipt-sample.svg     # Vector sample restaurant receipt
└── README.md                  # Documentation and hackathon guide
```

---

## 🛠️ Installation & Quickstart

### 1. Load Extension in Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** via the toggle switch in the top-right corner.
3. Click **Load unpacked**.
4. Select the `MetaAI26` directory.
5. Pin **SplitSmart AI** to your Chrome toolbar.

### 2. Instant Hackathon Evaluation (Offline Demo Mode)
By default, **Offline Demo Mode is enabled** so hackathon judges can test the full end-to-end flow immediately:
1. Click the **SplitSmart AI** icon in the toolbar.
2. Click **✨ Sample Receipt** (or click **📸 Capture Active Tab** on any receipt page).
3. The sample dictation prompt is pre-loaded:
   > *"Alex had ramen, Sarah and I shared gyoza, split tip and tax proportionally"*
4. Click **✨ Analyze with Muse Spark 1.3**.
5. Observe the **Penny-Perfect Cent Reconciliation**:
   - Subtotal: **$58.00**, Tax: **$5.51**, Tip: **$10.44**, Fees: **$2.00**, Total: **$75.95**.
   - **Alex**: $24.23 (Tonkotsu Ramen $16.50 + 1/3 Green Tea $2.00 + proportional additions).
   - **Me**: $31.10 (Spicy Miso $17.50 + 1/2 Gyoza $4.25 + 1/3 Green Tea $2.00 + proportional additions).
   - **Sarah**: $20.62 (Karaage $9.50 + 1/2 Gyoza $4.25 + 1/3 Green Tea $2.00 + proportional additions).
   - Total Sum: **$24.23 + $31.10 + $20.62 = $75.95** (Zero cent discrepancy!).
6. Select your Splitwise group and click **⚡ Sync Expense to Splitwise**.

### 3. Using Live API Keys
1. Click the **Settings (gear)** icon in the top header.
2. Toggle off **Offline Demo Mode**.
3. Enter your **Meta Model API Key** (configured for `muse-spark-1.3`).
4. Enter your **Splitwise API Key / Personal Access Token**.
5. Click **Save Settings**.

---

## 🏆 Hackathon Alignment

- **Category**: Meta Global AI Developer Hackathon 2026.
- **Model**: Meta Muse Spark 1.3.
- **Architecture**: 100% Serverless, zero server maintenance, zero intermediary latency, privacy-first (data flows directly between user and endpoints).
- **Compliance**: Chrome Manifest V3, Web Speech API, Content Security Policy compliant.

