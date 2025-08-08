"use strict";
// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemorySessionService = void 0;
const uuid_1 = require("uuid");
/**
 * An in-memory implementation of the session service.
 *
 * It is not suitable for multi-threaded production environments. Use it for
 * testing and development only.
 */
class InMemorySessionService {
    constructor() {
        // A map from app name to a map from user ID to a map from session ID to session
        this.sessions = new Map();
        // A map from app name to a map from user ID to a map from key to the value
        this.userState = new Map();
        // A map from app name to a map from key to the value
        this.appState = new Map();
    }
    /**
     * Creates a new session.
     */
    async createSession({ appName, userId, state = {}, sessionId }) {
        const finalSessionId = sessionId?.trim() || (0, uuid_1.v4)();
        const session = {
            id: finalSessionId,
            appName,
            userId,
            state,
            events: [],
            lastUpdateTime: Date.now() / 1000 // Convert to seconds like Python version
        };
        // Initialize nested maps if they don't exist
        if (!this.sessions.has(appName)) {
            this.sessions.set(appName, new Map());
        }
        const appSessions = this.sessions.get(appName);
        if (!appSessions.has(userId)) {
            appSessions.set(userId, new Map());
        }
        const userSessions = appSessions.get(userId);
        userSessions.set(finalSessionId, session);
        // Return a deep copy with merged state
        return this.mergeState(appName, userId, { ...session });
    }
    /**
     * Gets a session by ID.
     */
    async getSession({ appName, userId, sessionId, config }) {
        const appSessions = this.sessions.get(appName);
        if (!appSessions)
            return null;
        const userSessions = appSessions.get(userId);
        if (!userSessions)
            return null;
        const session = userSessions.get(sessionId);
        if (!session)
            return null;
        // Apply filtering based on config
        let filteredSession = { ...session };
        if (config) {
            let events = [...session.events];
            if (config.afterTimestamp) {
                events = events.filter(event => event.timestamp > config.afterTimestamp);
            }
            if (config.numRecentEvents && config.numRecentEvents > 0) {
                events = events.slice(-config.numRecentEvents);
            }
            filteredSession.events = events;
        }
        return this.mergeState(appName, userId, filteredSession);
    }
    /**
     * Lists all sessions for a user.
     */
    async listSessions({ appName, userId }) {
        const appSessions = this.sessions.get(appName);
        if (!appSessions) {
            return { sessions: [] };
        }
        const userSessions = appSessions.get(userId);
        if (!userSessions) {
            return { sessions: [] };
        }
        const sessions = Array.from(userSessions.values()).map(session => ({
            ...session,
            events: [] // Don't include events in list response
        }));
        return { sessions };
    }
    /**
     * Deletes a session.
     */
    async deleteSession({ appName, userId, sessionId }) {
        const appSessions = this.sessions.get(appName);
        if (!appSessions)
            return;
        const userSessions = appSessions.get(userId);
        if (!userSessions)
            return;
        userSessions.delete(sessionId);
    }
    /**
     * Adds an event to a session.
     */
    async addEvent({ appName, userId, sessionId, event }) {
        const session = await this.getSession({ appName, userId, sessionId });
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        session.events.push(event);
        session.lastUpdateTime = Date.now() / 1000;
        // Update the stored session
        const userSessions = this.sessions.get(appName)?.get(userId);
        if (userSessions) {
            userSessions.set(sessionId, session);
        }
    }
    /**
     * Merges app and user state into the session.
     */
    mergeState(appName, userId, session) {
        const mergedState = { ...session.state };
        // Merge app state
        const appStateMap = this.appState.get(appName);
        if (appStateMap) {
            Object.assign(mergedState, Object.fromEntries(appStateMap));
        }
        // Merge user state
        const userStateMap = this.userState.get(appName)?.get(userId);
        if (userStateMap) {
            Object.assign(mergedState, Object.fromEntries(userStateMap));
        }
        return {
            ...session,
            state: mergedState
        };
    }
    /**
     * Sets app-level state.
     */
    async setAppState(appName, key, value) {
        if (!this.appState.has(appName)) {
            this.appState.set(appName, new Map());
        }
        this.appState.get(appName).set(key, value);
    }
    /**
     * Sets user-level state.
     */
    async setUserState(appName, userId, key, value) {
        if (!this.userState.has(appName)) {
            this.userState.set(appName, new Map());
        }
        const appUserState = this.userState.get(appName);
        if (!appUserState.has(userId)) {
            appUserState.set(userId, new Map());
        }
        appUserState.get(userId).set(key, value);
    }
}
exports.InMemorySessionService = InMemorySessionService;
//# sourceMappingURL=in-memory-session-service.js.map