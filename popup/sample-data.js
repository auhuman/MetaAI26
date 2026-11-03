/**
 * SplitSmart AI - Sample Data & Demo Assets
 * Meta Global AI Developer Hackathon 2026
 */

export const SAMPLE_RECEIPT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 500" width="380" height="500">
  <rect width="100%" height="100%" fill="%23f8fafc"/>
  <rect x="20" y="20" width="340" height="460" rx="8" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1"/>
  <text x="190" y="60" font-family="monospace" font-size="18" font-weight="bold" fill="%230f172a" text-anchor="middle">RAMEN ICHIRAN &amp; GRILL</text>
  <text x="190" y="80" font-family="monospace" font-size="11" fill="%2364748b" text-anchor="middle">1088 Silicon Valley Blvd</text>
  <text x="190" y="98" font-family="monospace" font-size="10" fill="%2394a3b8" text-anchor="middle">Order #4082 • Nov 02, 2026</text>
  <line x1="40" y1="115" x2="340" y2="115" stroke="%23cbd5e1" stroke-dasharray="4,4"/>
  <text x="45" y="145" font-family="monospace" font-size="13" fill="%231e293b">1x Tonkotsu Ramen</text>
  <text x="335" y="145" font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a" text-anchor="end">$16.50</text>
  <text x="45" y="175" font-family="monospace" font-size="13" fill="%231e293b">1x Spicy Miso Ramen</text>
  <text x="335" y="175" font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a" text-anchor="end">$17.50</text>
  <text x="45" y="205" font-family="monospace" font-size="13" fill="%231e293b">1x Pork Gyoza (6pc)</text>
  <text x="335" y="205" font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a" text-anchor="end">$8.50</text>
  <text x="45" y="235" font-family="monospace" font-size="13" fill="%231e293b">1x Karaage Chicken</text>
  <text x="335" y="235" font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a" text-anchor="end">$9.50</text>
  <text x="45" y="265" font-family="monospace" font-size="13" fill="%231e293b">3x Iced Green Tea</text>
  <text x="335" y="265" font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a" text-anchor="end">$6.00</text>
  <line x1="40" y1="285" x2="340" y2="285" stroke="%23cbd5e1" stroke-dasharray="4,4"/>
  <text x="45" y="310" font-family="monospace" font-size="12" fill="%2364748b">Subtotal</text>
  <text x="335" y="310" font-family="monospace" font-size="12" fill="%23334155" text-anchor="end">$58.00</text>
  <text x="45" y="335" font-family="monospace" font-size="12" fill="%2364748b">Tax (9.5%)</text>
  <text x="335" y="335" font-family="monospace" font-size="12" fill="%23334155" text-anchor="end">$5.51</text>
  <text x="45" y="360" font-family="monospace" font-size="12" fill="%2364748b">Tip (18%)</text>
  <text x="335" y="360" font-family="monospace" font-size="12" fill="%23334155" text-anchor="end">$10.44</text>
  <text x="45" y="385" font-family="monospace" font-size="12" fill="%2364748b">Service Fee</text>
  <text x="335" y="385" font-family="monospace" font-size="12" fill="%23334155" text-anchor="end">$2.00</text>
  <line x1="40" y1="405" x2="340" y2="405" stroke="%230f172a" stroke-width="1.5"/>
  <text x="45" y="435" font-family="monospace" font-size="15" font-weight="bold" fill="%230f172a">TOTAL</text>
  <text x="335" y="435" font-family="monospace" font-size="17" font-weight="900" fill="%230f172a" text-anchor="end">$75.95</text>
  <text x="190" y="468" font-family="sans-serif" font-size="10" fill="%230284c7" text-anchor="middle">Meta Global AI Hackathon • SplitSmart AI</text>
</svg>`;

export const SAMPLE_DICTATION = "Alex had ramen, Sarah and I shared gyoza, Sarah got karaage, and we all shared green tea. Split tip and tax proportionally.";

export const MOCK_RECEIPT_ITEMS = [
  { name: "Tonkotsu Ramen", price: 16.50, assigned_to: ["Alex"] },
  { name: "Spicy Miso Ramen", price: 17.50, assigned_to: ["Me"] },
  { name: "Pork Gyoza (6pc)", price: 8.50, assigned_to: ["Sarah", "Me"] },
  { name: "Karaage Chicken", price: 9.50, assigned_to: ["Sarah"] },
  { name: "Iced Green Tea (x3)", price: 6.00, assigned_to: ["Alex", "Sarah", "Me"] }
];

export const MOCK_RECEIPT_METRICS = {
  restaurant: "Ramen Ichiran & Grill",
  subtotal: 58.00,
  tax: 5.51,
  tip: 10.44,
  fees: 2.00,
  total: 75.95
};

export const MOCK_SPLITWISE_USER = {
  id: 101,
  first_name: "You",
  last_name: "(Current User)",
  email: "developer@meta-hackathon.ai",
  default_currency: "USD"
};

export const MOCK_SPLITWISE_FRIENDS = [
  {
    id: 202,
    first_name: "Alex",
    last_name: "Chen",
    email: "alex.chen@example.com",
    registration_status: "confirmed"
  },
  {
    id: 303,
    first_name: "Sarah",
    last_name: "Kim",
    email: "sarah.kim@example.com",
    registration_status: "confirmed"
  },
  {
    id: 404,
    first_name: "David",
    last_name: "Patel",
    email: "david.p@example.com",
    registration_status: "confirmed"
  }
];

export const MOCK_SPLITWISE_GROUPS = [
  {
    id: 9001,
    name: "🍜 Hackathon Foodies",
    group_type: "dining",
    members: [
      { id: 101, first_name: "You", last_name: "(Current User)" },
      { id: 202, first_name: "Alex", last_name: "Chen" },
      { id: 303, first_name: "Sarah", last_name: "Kim" }
    ]
  },
  {
    id: 9002,
    name: "🏠 Roommates & Trips",
    group_type: "house",
    members: [
      { id: 101, first_name: "You", last_name: "(Current User)" },
      { id: 202, first_name: "Alex", last_name: "Chen" },
      { id: 404, first_name: "David", last_name: "Patel" }
    ]
  },
  {
    id: 0,
    name: "Non-group expense (Direct Friends)",
    group_type: "other",
    members: []
  }
];

