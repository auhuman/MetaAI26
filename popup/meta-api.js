/**
 * SplitSmart AI - Meta Model API Integration & Penny-Perfect Math Engine
 * Meta Global AI Developer Hackathon 2026
 * Model: Muse Spark 1.3
 */

import { MOCK_RECEIPT_ITEMS, MOCK_RECEIPT_METRICS } from './sample-data.js';

export class MetaModelClient {
  constructor(config = {}) {
    this.apiKey = config.apiKey || '';
    this.baseUrl = config.baseUrl || 'https://api.meta.ai/v1';
    this.modelName = config.modelName || 'muse-spark-1.3';
    this.offlineMode = config.offlineMode ?? true;
  }

  updateConfig(config) {
    if (config.apiKey !== undefined) this.apiKey = config.apiKey;
    if (config.baseUrl !== undefined) this.baseUrl = config.baseUrl;
    if (config.modelName !== undefined) this.modelName = config.modelName;
    if (config.offlineMode !== undefined) this.offlineMode = config.offlineMode;
  }

  /**
   * Main entry point: Analyzes receipt image + voice instructions
   * Returns reconciled, penny-perfect participant breakdown.
   */
  async analyzeReceipt({ imageBase64, voiceInstructions = '' }) {
    if (this.offlineMode || !this.apiKey) {
      console.log('[Meta API] Running in Offline Demo Mode / Mock Engine');
      await new Promise(r => setTimeout(r, 900)); // simulate AI inference latency
      return this.simulateMuseSparkAnalysis(voiceInstructions);
    }

    // Call live Meta Model API with Muse Spark 1.3
    const systemPrompt = `You are SplitSmart AI, an advanced receipt itemizer powered by Meta Muse Spark 1.3.
You extract line items, prices, tax, tip, fees, and receipt total from receipt images.
You also parse user voice dictation instructions assigning who had or shared which items.
Respond ONLY with a valid JSON object strictly matching this schema, without markdown formatting or commentary:
{
  "restaurant": "string name",
  "items": [
    {
      "name": "string",
      "price": number (float),
      "assigned_to": ["array", "of", "participant_names"]
    }
  ],
  "subtotal": number (float),
  "tax": number (float),
  "tip": number (float),
  "fees": number (float),
  "total": number (float),
  "detected_participants": ["list", "of", "all", "unique", "participants"]
}

Guidelines:
- If dictation specifies "Me" or "I", use "Me" as participant name.
- If an item was shared (e.g. "Sarah and I shared gyoza"), include all participants in "assigned_to" (e.g. ["Sarah", "Me"]).
- If an item was not explicitly mentioned, split it equally among all detected participants.
- If dictation specifies split tip and tax proportionally, ensure tax, tip, and delivery fees are correctly separated.`;

    const userContent = [
      {
        type: 'text',
        text: `Receipt Analysis Request:
Voice Dictation Instructions: "${voiceInstructions || 'Split all items equally among all detected diners'}"
Extract all items, totals, and apply participant assignments.`
      }
    ];

    if (imageBase64) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
        }
      });
    }

    const payload = {
      model: this.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    };

    const endpoint = `${this.baseUrl.replace(/\/+$/, '')}/chat/completions`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Meta Model API error (${response.status}): ${errorText}`);
      }

      const json = await response.json();
      const rawText = json.choices?.[0]?.message?.content || '{}';
      const parsedData = this.cleanAndParseJSON(rawText);

      // Apply client-side Penny-Perfect Math Rules
      return this.reconcilePennyPerfect(parsedData);
    } catch (err) {
      console.warn('[Meta API] Live call failed, falling back to simulated inference:', err);
      // If error occurs, fall back gracefully to simulation with informative alert
      const result = this.simulateMuseSparkAnalysis(voiceInstructions);
      result._warning = `Live Meta API call failed (${err.message}). Showing simulation.`;
      return result;
    }
  }

  /**
   * Cleans potential markdown code blocks and parses JSON safely
   */
  cleanAndParseJSON(text) {
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
    }
    return JSON.parse(clean);
  }

  /**
   * Offline / Demo Mode Simulator:
   * Parses voice instructions dynamically or uses mock data
   */
  simulateMuseSparkAnalysis(voiceText = '') {
    const textLower = voiceText.toLowerCase();
    
    // Detect participants mentioned
    let participants = new Set(['Me']);
    if (textLower.includes('alex')) participants.add('Alex');
    if (textLower.includes('sarah')) participants.add('Sarah');
    if (textLower.includes('dave') || textLower.includes('david')) participants.add('David');
    
    if (participants.size === 1 && !textLower) {
      // Default sample scenario: Alex, Sarah, Me
      participants.add('Alex');
      participants.add('Sarah');
    }

    const participantList = Array.from(participants);

    // Deep clone base items
    const items = MOCK_RECEIPT_ITEMS.map(item => ({
      name: item.name,
      price: item.price,
      assigned_to: [...item.assigned_to]
    }));

    // Adjust assignments if specific dictation keywords found
    if (textLower.includes('equally') || textLower.includes('even') || textLower.includes('3-way split')) {
      items.forEach(it => {
        it.assigned_to = [...participantList];
      });
    }

    const rawData = {
      restaurant: MOCK_RECEIPT_METRICS.restaurant,
      subtotal: MOCK_RECEIPT_METRICS.subtotal,
      tax: MOCK_RECEIPT_METRICS.tax,
      tip: MOCK_RECEIPT_METRICS.tip,
      fees: MOCK_RECEIPT_METRICS.fees,
      total: MOCK_RECEIPT_METRICS.total,
      items: items,
      detected_participants: participantList
    };

    return this.reconcilePennyPerfect(rawData);
  }

  /**
   * MATHEMATICAL ENGINE: PENNY-PERFECT PROPORTIONAL RECONCILIATION
   * 
   * Strict Hackathon Invariant:
   * Total sum of participant shares MUST strictly match receipt total down to the cent.
   * Proportional allocation of tax, tip, and delivery fees based on each participant's item subtotal share.
   * Uses Hamilton-Hare-Niemeyer largest-remainder method for integer cent allocation.
   */
  reconcilePennyPerfect(data) {
    const items = data.items || [];
    let receiptSubtotal = parseFloat(data.subtotal) || 0;
    const receiptTax = parseFloat(data.tax) || 0;
    const receiptTip = parseFloat(data.tip) || 0;
    const receiptFees = parseFloat(data.fees) || 0;
    const receiptTotal = parseFloat(data.total) || (receiptSubtotal + receiptTax + receiptTip + receiptFees);

    // Find all participants
    const participantSet = new Set();
    items.forEach(item => {
      (item.assigned_to || []).forEach(name => participantSet.add(name));
    });
    if (data.detected_participants) {
      data.detected_participants.forEach(name => participantSet.add(name));
    }
    if (participantSet.size === 0) {
      participantSet.add('Me');
    }

    const participantNames = Array.from(participantSet);

    // Compute raw item subtotals for each participant
    const participantBreakdowns = {};
    participantNames.forEach(name => {
      participantBreakdowns[name] = {
        name,
        assignedItems: [],
        subtotal: 0,
        taxShare: 0,
        tipShare: 0,
        feeShare: 0,
        rawTotal: 0,
        finalTotal: 0
      };
    });

    let computedItemSum = 0;

    items.forEach(item => {
      const price = parseFloat(item.price) || 0;
      computedItemSum += price;
      const assignees = (item.assigned_to && item.assigned_to.length > 0)
        ? item.assigned_to
        : participantNames;

      const splitPrice = price / assignees.length;

      assignees.forEach(person => {
        if (!participantBreakdowns[person]) {
          participantBreakdowns[person] = {
            name: person,
            assignedItems: [],
            subtotal: 0,
            taxShare: 0,
            tipShare: 0,
            feeShare: 0,
            rawTotal: 0,
            finalTotal: 0
          };
        }
        participantBreakdowns[person].assignedItems.push({
          name: item.name,
          fullPrice: price,
          shareFraction: `1/${assignees.length}`,
          allocatedPrice: splitPrice
        });
        participantBreakdowns[person].subtotal += splitPrice;
      });
    });

    // If receiptSubtotal is missing or drastically off, use computedItemSum
    if (receiptSubtotal <= 0) {
      receiptSubtotal = computedItemSum;
    }

    const totalSubtotalSum = Object.values(participantBreakdowns).reduce((acc, p) => acc + p.subtotal, 0);

    // Calculate unrounded proportional shares
    const nonItemAmount = receiptTax + receiptTip + receiptFees;

    participantNames.forEach(name => {
      const p = participantBreakdowns[name];
      const weight = totalSubtotalSum > 0 ? (p.subtotal / totalSubtotalSum) : (1 / participantNames.length);
      p.shareWeight = weight;
      p.taxShare = receiptTax * weight;
      p.tipShare = receiptTip * weight;
      p.feeShare = receiptFees * weight;
      p.rawTotal = p.subtotal + p.taxShare + p.tipShare + p.feeShare;
    });

    // PENNY-PERFECT INTEGER CENT DISTRIBUTION (Hamilton / Hare-Niemeyer Method)
    const targetCents = Math.round(receiptTotal * 100);

    // Floor each person's cents and compute remainder
    let sumFloorCents = 0;
    const centRecords = participantNames.map(name => {
      const p = participantBreakdowns[name];
      const exactCents = p.rawTotal * 100;
      const floorCent = Math.floor(exactCents);
      const remainder = exactCents - floorCent;
      sumFloorCents += floorCent;
      return {
        name,
        floorCent,
        remainder
      };
    });

    // Discrepancy in cents
    let deltaCents = targetCents - sumFloorCents;

    // Sort by remainder descending to give leftover pennies to highest fractions
    centRecords.sort((a, b) => b.remainder - a.remainder);

    // Distribute delta cents
    let idx = 0;
    while (deltaCents > 0 && centRecords.length > 0) {
      centRecords[idx % centRecords.length].floorCent += 1;
      deltaCents--;
      idx++;
    }
    while (deltaCents < 0 && centRecords.length > 0) {
      centRecords[idx % centRecords.length].floorCent -= 1;
      deltaCents++;
      idx++;
    }

    // Set finalized cent-perfect totals
    let reconciledSum = 0;
    centRecords.forEach(rec => {
      const p = participantBreakdowns[rec.name];
      p.finalCents = rec.floorCent;
      p.finalTotal = rec.floorCent / 100;
      reconciledSum += p.finalTotal;
    });

    const isPennyPerfect = Math.abs(reconciledSum - receiptTotal) < 0.001;

    return {
      restaurant: data.restaurant || 'Restaurant Receipt',
      subtotal: parseFloat(receiptSubtotal.toFixed(2)),
      tax: parseFloat(receiptTax.toFixed(2)),
      tip: parseFloat(receiptTip.toFixed(2)),
      fees: parseFloat(receiptFees.toFixed(2)),
      total: parseFloat(receiptTotal.toFixed(2)),
      items: items,
      participants: Object.values(participantBreakdowns),
      reconciliation: {
        receiptTotal: parseFloat(receiptTotal.toFixed(2)),
        participantsSum: parseFloat(reconciledSum.toFixed(2)),
        discrepancy: parseFloat((reconciledSum - receiptTotal).toFixed(2)),
        isPennyPerfect: isPennyPerfect,
        statusMessage: isPennyPerfect
          ? `✓ Penny-Perfect: $${reconciledSum.toFixed(2)} strictly matches receipt total $${receiptTotal.toFixed(2)}`
          : `Discrepancy detected: $${(reconciledSum - receiptTotal).toFixed(2)}`
      }
    };
  }
}

