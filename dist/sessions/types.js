"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionEventType = exports.SessionState = void 0;
/**
 * Session state enumeration
 */
var SessionState;
(function (SessionState) {
    SessionState["ACTIVE"] = "active";
    SessionState["INACTIVE"] = "inactive";
    SessionState["EXPIRED"] = "expired";
    SessionState["TERMINATED"] = "terminated";
})(SessionState || (exports.SessionState = SessionState = {}));
/**
 * Session event types
 */
var SessionEventType;
(function (SessionEventType) {
    SessionEventType["SESSION_CREATED"] = "session_created";
    SessionEventType["SESSION_UPDATED"] = "session_updated";
    SessionEventType["SESSION_DELETED"] = "session_deleted";
    SessionEventType["SESSION_EXPIRED"] = "session_expired";
    SessionEventType["SESSION_ACTIVATED"] = "session_activated";
    SessionEventType["SESSION_DEACTIVATED"] = "session_deactivated";
    SessionEventType["EVENT_ADDED"] = "event_added";
    SessionEventType["MEMORY_UPDATED"] = "memory_updated";
})(SessionEventType || (exports.SessionEventType = SessionEventType = {}));
//# sourceMappingURL=types.js.map