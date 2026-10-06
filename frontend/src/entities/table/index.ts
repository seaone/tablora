export { type ColumnDraft, columnSchema } from "./model/column";
export { type ParticipantDraft, participantSchema } from "./model/participant";
export { type ConnectionStatus, useLiveTable } from "./model/use-live-table";
// Form dialogs live in the entity because several pages (create-table,
// table-judge) share the same column/participant form. They hold
// presentation + validation only; API calls stay in the consuming pages.
// ScoreFieldItem is an internal detail of ParticipantFormDialog, not a public API.
export { ColumnFormDialog, type ColumnFormValue } from "./ui/column-form-dialog";
export { COLUMN_TYPE_LABELS } from "./ui/column-type-labels";
export { ConnectionStatusBadge } from "./ui/connection-status-badge";
export { ParticipantFormDialog, type ParticipantFormValue } from "./ui/participant-form-dialog";
export { PreviewTable } from "./ui/preview-table";
