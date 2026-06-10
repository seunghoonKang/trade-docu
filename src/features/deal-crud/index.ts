export {
  saveDeal,
  getDealBundle,
  listDeals,
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
