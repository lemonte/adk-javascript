"use strict";
/**
 * Flow types and interfaces
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowEventType = exports.FlowExecutionMode = exports.FlowPriority = exports.FlowStatus = void 0;
/**
 * Flow execution status
 */
var FlowStatus;
(function (FlowStatus) {
    FlowStatus["PENDING"] = "pending";
    FlowStatus["RUNNING"] = "running";
    FlowStatus["COMPLETED"] = "completed";
    FlowStatus["FAILED"] = "failed";
    FlowStatus["CANCELLED"] = "cancelled";
    FlowStatus["PAUSED"] = "paused";
})(FlowStatus || (exports.FlowStatus = FlowStatus = {}));
/**
 * Flow execution priority
 */
var FlowPriority;
(function (FlowPriority) {
    FlowPriority["LOW"] = "low";
    FlowPriority["NORMAL"] = "normal";
    FlowPriority["HIGH"] = "high";
    FlowPriority["CRITICAL"] = "critical";
})(FlowPriority || (exports.FlowPriority = FlowPriority = {}));
/**
 * Flow execution mode
 */
var FlowExecutionMode;
(function (FlowExecutionMode) {
    FlowExecutionMode["SEQUENTIAL"] = "sequential";
    FlowExecutionMode["PARALLEL"] = "parallel";
    FlowExecutionMode["CONDITIONAL"] = "conditional";
    FlowExecutionMode["LOOP"] = "loop";
})(FlowExecutionMode || (exports.FlowExecutionMode = FlowExecutionMode = {}));
/**
 * Flow event types
 */
var FlowEventType;
(function (FlowEventType) {
    FlowEventType["FLOW_STARTED"] = "flow_started";
    FlowEventType["FLOW_COMPLETED"] = "flow_completed";
    FlowEventType["FLOW_FAILED"] = "flow_failed";
    FlowEventType["FLOW_CANCELLED"] = "flow_cancelled";
    FlowEventType["FLOW_PAUSED"] = "flow_paused";
    FlowEventType["FLOW_RESUMED"] = "flow_resumed";
    FlowEventType["STEP_STARTED"] = "step_started";
    FlowEventType["STEP_COMPLETED"] = "step_completed";
    FlowEventType["STEP_FAILED"] = "step_failed";
    FlowEventType["STEP_SKIPPED"] = "step_skipped";
})(FlowEventType || (exports.FlowEventType = FlowEventType = {}));
//# sourceMappingURL=types.js.map