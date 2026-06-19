// Real reconciliation captured from the three agents running against live SAP S/4HANA
// (PO 4500000021, pulled over MCP). Used by the self-contained reconciliation view so the
// demo always renders — the numbers here are the agents' actual outputs, not invented.

export type ReconLine = {
  item: string;
  material: string;
  description: string;
  poQty: string;
  poPrice: string;
  supplierQty: string;
  supplierPrice: string;
  matchBasis: string;
  matchConfidence: number;
  category: string; // none | price-variance | quantity-variance | over-delivery | ...
  varianceAmount: string;
  explanation: string;
  proposal: string;
};

export type PreparedUpdate = {
  entity: string;
  purchaseOrder: string;
  poItem: string;
  field: string;
  currentValue: string;
  newValue: string;
  readyToPost: boolean;
  summary: string;
};

export type ReconCase = {
  purchaseOrder: string;
  companyCode: string;
  supplier: string;
  currency: string;
  invoice: string;
  source: string; // the real S/4 system of record (generic label — no internal id)
  overallStatus: string;
  confidence: number;
  lines: ReconLine[];
  prepared: PreparedUpdate;
};

export const reconCase: ReconCase = {
  purchaseOrder: "4500000021",
  companyCode: "1110",
  supplier: "11300001",
  currency: "GBP",
  invoice: "INV-88231",
  source: "SAP S/4HANA Cloud · API_PURCHASEORDER_PROCESS_SRV (live, via MCP)",
  overallStatus: "variance-found",
  confidence: 0.95,
  lines: [
    {
      item: "10",
      material: "RM27",
      description: "RAW27, PD, Packaging Box",
      poQty: "50 PC",
      poPrice: "25.00",
      supplierQty: "50 PC",
      supplierPrice: "27.50",
      matchBasis: "material",
      matchConfidence: 1.0,
      category: "price-variance",
      varianceAmount: "+10%",
      explanation: "Supplier unit price exceeds the PO price by 10% (25.00 → 27.50 GBP/ea).",
      proposal: "Review and confirm the supplier price, or reject the surcharge / renegotiate.",
    },
    {
      item: "20",
      material: "RM16",
      description: "RAW16, PD",
      poQty: "5 PC",
      poPrice: "2.00",
      supplierQty: "6 PC",
      supplierPrice: "2.00",
      matchBasis: "material",
      matchConfidence: 1.0,
      category: "over-delivery",
      varianceAmount: "+20%",
      explanation: "Supplier delivered/invoiced 20% more than ordered (5 → 6 PC).",
      proposal: "Verify the over-delivery tolerance; accept and update the PO quantity, or request a correction.",
    },
  ],
  prepared: {
    entity: "A_PurchaseOrderItem",
    purchaseOrder: "4500000021",
    poItem: "20",
    field: "OrderQuantity",
    currentValue: "5",
    newValue: "6",
    readyToPost: true,
    summary: "On approval: update PO item 20 order quantity from 5 to 6 PC in S/4HANA.",
  },
};

export const agentPipeline = [
  { name: "matching-agent", role: "pulls the live PO + aligns supplier lines to PO items (MCP → S/4)" },
  { name: "variance-agent", role: "classifies each discrepancy, scores confidence, proposes a correction" },
  { name: "posting-prep-agent", role: "turns the approved correction into the S/4 update payload" },
];
