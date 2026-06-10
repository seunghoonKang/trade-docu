export {
  saveDeal,
  getDealBundle,
  listDeals,
  listDealSummaries,
  deleteDeal,
  issueDocument,
  ensureDefaultShipment,
  createShipment,
  updateShipmentAllocations,
  updateShipmentCharges,
  deleteShipment,
  setDealStatus,
} from "./api";
export type { DealBundle, IssueDocumentParams } from "./api";
export { formToDeal, dealToForm } from "./lib/mapping";
export {
  computeBalance,
  remainingAllocations,
  nextSeq,
  suggestDocNo,
} from "./lib/balance";
export type { ItemBalance, DealBalance } from "./lib/balance";
export { buildDealSummaries, matchesDealSummary } from "./lib/summary";
export type { DealSummary, DealDocRef } from "./lib/summary";
