"use strict";
/**
 * Event types and interfaces for the ADK JavaScript SDK
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = void 0;
// Export event-related types
__exportStar(require("./event"), exports);
__exportStar(require("./event-actions"), exports);
/**
 * Event types enumeration
 */
var EventType;
(function (EventType) {
    EventType["AGENT_START"] = "agent_start";
    EventType["AGENT_END"] = "agent_end";
    EventType["MODEL_REQUEST"] = "model_request";
    EventType["MODEL_RESPONSE"] = "model_response";
    EventType["TOOL_CALL"] = "tool_call";
    EventType["TOOL_RESPONSE"] = "tool_response";
    EventType["ITERATION_START"] = "iteration_start";
    EventType["ITERATION_END"] = "iteration_end";
    EventType["ERROR"] = "error";
})(EventType || (exports.EventType = EventType = {}));
//# sourceMappingURL=index.js.map