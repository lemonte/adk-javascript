"use strict";
/**
 * Event system types and interfaces
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPersistenceMode = exports.EventDeliveryMode = exports.EventStatus = exports.EventPriority = void 0;
/**
 * Event priority levels
 */
var EventPriority;
(function (EventPriority) {
    EventPriority["LOW"] = "low";
    EventPriority["MEDIUM"] = "medium";
    EventPriority["HIGH"] = "high";
    EventPriority["CRITICAL"] = "critical";
})(EventPriority || (exports.EventPriority = EventPriority = {}));
/**
 * Event status
 */
var EventStatus;
(function (EventStatus) {
    EventStatus["PENDING"] = "pending";
    EventStatus["PROCESSING"] = "processing";
    EventStatus["PROCESSED"] = "processed";
    EventStatus["FAILED"] = "failed";
    EventStatus["CANCELLED"] = "cancelled";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
/**
 * Event delivery modes
 */
var EventDeliveryMode;
(function (EventDeliveryMode) {
    EventDeliveryMode["FIRE_AND_FORGET"] = "fire_and_forget";
    EventDeliveryMode["AT_LEAST_ONCE"] = "at_least_once";
    EventDeliveryMode["EXACTLY_ONCE"] = "exactly_once";
})(EventDeliveryMode || (exports.EventDeliveryMode = EventDeliveryMode = {}));
/**
 * Event persistence modes
 */
var EventPersistenceMode;
(function (EventPersistenceMode) {
    EventPersistenceMode["NONE"] = "none";
    EventPersistenceMode["MEMORY"] = "memory";
    EventPersistenceMode["DISK"] = "disk";
    EventPersistenceMode["DATABASE"] = "database";
})(EventPersistenceMode || (exports.EventPersistenceMode = EventPersistenceMode = {}));
//# sourceMappingURL=types.js.map