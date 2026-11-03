/**
 * SplitSmart AI - Splitwise REST API v3.0 Client
 * Meta Global AI Developer Hackathon 2026
 * Fully client-side serverless fetch implementation.
 */

import {
  MOCK_SPLITWISE_USER,
  MOCK_SPLITWISE_FRIENDS,
  MOCK_SPLITWISE_GROUPS
} from './sample-data.js';

export class SplitwiseClient {
  constructor(config = {}) {
    this.apiKey = config.apiKey || '';
    this.baseUrl = config.baseUrl || 'https://secure.splitwise.com/api/v3.0';
    this.offlineMode = config.offlineMode ?? true;
    this.currentUser = null;
    this.friends = [];
    this.groups = [];
  }

  updateConfig(config) {
    if (config.apiKey !== undefined) this.apiKey = config.apiKey;
    if (config.baseUrl !== undefined) this.baseUrl = config.baseUrl;
    if (config.offlineMode !== undefined) this.offlineMode = config.offlineMode;
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json'
    };
  }

  /**
   * Resolves current user info (get_current_user)
   */
  async getCurrentUser() {
    if (this.offlineMode || !this.apiKey) {
      console.log('[Splitwise API] Offline Mode: Using mock current user');
      this.currentUser = MOCK_SPLITWISE_USER;
      return this.currentUser;
    }

    const url = `${this.baseUrl.replace(/\/+$/, '')}/get_current_user`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Splitwise get_current_user failed (${res.status}): ${await res.text()}`);
      }

      const data = await res.json();
      this.currentUser = data.user;
      return this.currentUser;
    } catch (err) {
      console.warn('[Splitwise API] Failed live get_current_user, falling back to mock:', err);
      this.currentUser = MOCK_SPLITWISE_USER;
      return this.currentUser;
    }
  }

  /**
   * Fetches friends list (get_friends)
   */
  async getFriends() {
    if (this.offlineMode || !this.apiKey) {
      this.friends = MOCK_SPLITWISE_FRIENDS;
      return this.friends;
    }

    const url = `${this.baseUrl.replace(/\/+$/, '')}/get_friends`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Splitwise get_friends failed (${res.status}): ${await res.text()}`);
      }

      const data = await res.json();
      this.friends = data.friends || [];
      return this.friends;
    } catch (err) {
      console.warn('[Splitwise API] Failed live get_friends, falling back to mock:', err);
      this.friends = MOCK_SPLITWISE_FRIENDS;
      return this.friends;
    }
  }

  /**
   * Fetches groups list (get_groups)
   */
  async getGroups() {
    if (this.offlineMode || !this.apiKey) {
      this.groups = MOCK_SPLITWISE_GROUPS;
      return this.groups;
    }

    const url = `${this.baseUrl.replace(/\/+$/, '')}/get_groups`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Splitwise get_groups failed (${res.status}): ${await res.text()}`);
      }

      const data = await res.json();
      this.groups = data.groups || [];
      return this.groups;
    } catch (err) {
      console.warn('[Splitwise API] Failed live get_groups, falling back to mock:', err);
      this.groups = MOCK_SPLITWISE_GROUPS;
      return this.groups;
    }
  }

  /**
   * Fuzzy matches a participant name (e.g. "Alex", "Sarah", "Me")
   * to Splitwise friends or the current user.
   */
  resolveParticipantToUser(participantName, currentUser, friendsList) {
    const pName = (participantName || '').trim().toLowerCase();

    // Check if it's the current user ("me", "i", "myself", "you")
    if (['me', 'i', 'myself', 'you'].includes(pName)) {
      return {
        matched: true,
        user: currentUser,
        displayName: `${currentUser.first_name} (You)`,
        isCurrentUser: true
      };
    }

    // Check friends list by first name, last name, or full name
    for (const friend of friendsList) {
      const firstName = (friend.first_name || '').toLowerCase();
      const lastName = (friend.last_name || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();

      if (firstName === pName || fullName.includes(pName) || pName.includes(firstName)) {
        return {
          matched: true,
          user: friend,
          displayName: `${friend.first_name} ${friend.last_name || ''}`.trim(),
          isCurrentUser: false
        };
      }
    }

    // If no match found, create a placeholder simulated user
    return {
      matched: false,
      user: {
        id: Math.floor(10000 + Math.random() * 90000),
        first_name: participantName,
        last_name: '',
        email: `${pName.replace(/\s+/g, '')}@example.com`
      },
      displayName: participantName,
      isCurrentUser: false
    };
  }

  /**
   * Creates an expense on Splitwise with owed and paid shares (create_expense)
   * 
   * @param {Object} options
   * @param {number} options.cost - Receipt total
   * @param {string} options.description - Expense title (e.g. "Dinner - SplitSmart AI")
   * @param {number|null} options.groupId - Selected group ID (or 0 for non-group)
   * @param {Array} options.participantShares - Array of { name, amount, userId }
   * @param {number} options.paidByUserId - User ID who paid the full bill
   */
  async createExpense({
    cost,
    description,
    groupId = null,
    participantShares = [],
    paidByUserId = null
  }) {
    if (!this.currentUser) {
      await this.getCurrentUser();
    }
    if (!this.friends || this.friends.length === 0) {
      await this.getFriends();
    }

    const payerId = paidByUserId || this.currentUser.id;

    // Build user shares payload
    const usersPayload = participantShares.map(p => {
      const isPayer = p.userId === payerId;
      return {
        user_id: p.userId,
        paid_share: isPayer ? cost.toFixed(2) : '0.00',
        owed_share: p.amount.toFixed(2)
      };
    });

    if (this.offlineMode || !this.apiKey) {
      console.log('[Splitwise API] Offline Mode: Simulating create_expense');
      await new Promise(r => setTimeout(r, 800)); // simulate network latency
      const mockExpenseId = Math.floor(500000 + Math.random() * 500000);
      return {
        success: true,
        offline: true,
        expense: {
          id: mockExpenseId,
          cost: cost.toFixed(2),
          description: description,
          currency_code: 'USD',
          date: new Date().toISOString(),
          users: usersPayload,
          repayments: participantShares
            .filter(p => p.userId !== payerId)
            .map(p => ({
              from: p.userId,
              to: payerId,
              amount: p.amount.toFixed(2)
            }))
        },
        message: `Expense successfully recorded! (Simulated ID: #${mockExpenseId})`
      };
    }

    // Splitwise API v3 format for create_expense
    // Form URL-encoded format is the standard for Splitwise v3
    const url = `${this.baseUrl.replace(/\/+$/, '')}/create_expense`;
    const params = new URLSearchParams();
    params.append('cost', cost.toFixed(2));
    params.append('description', description);
    params.append('details', 'Itemized & proportionally split via SplitSmart AI (Meta Muse Spark 1.3)');
    params.append('date', new Date().toISOString());

    if (groupId && parseInt(groupId, 10) > 0) {
      params.append('group_id', groupId.toString());
    }

    // Attach users__N__user_id, users__N__paid_share, users__N__owed_share
    usersPayload.forEach((u, index) => {
      params.append(`users__${index}__user_id`, u.user_id.toString());
      params.append(`users__${index}__paid_share`, u.paid_share);
      params.append(`users__${index}__owed_share`, u.owed_share);
    });

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await res.json();
      if (!res.ok || (data.errors && Object.keys(data.errors).length > 0)) {
        const errDetail = JSON.stringify(data.errors || data);
        throw new Error(`Splitwise API error (${res.status}): ${errDetail}`);
      }

      const created = data.expenses?.[0] || data.expense || data;
      return {
        success: true,
        offline: false,
        expense: created,
        message: `Expense #${created.id || 'created'} synced directly to Splitwise!`
      };
    } catch (err) {
      console.warn('[Splitwise API] Live create_expense failed:', err);
      throw err;
    }
  }
}

