"use strict";
/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteMode = void 0;
/**
 * Write mode indicating what levels of write operations are allowed in BigQuery.
 */
var WriteMode;
(function (WriteMode) {
    /**
     * No write operations are allowed.
     *
     * This mode implies that only read (i.e. SELECT query) operations are allowed.
     */
    WriteMode["BLOCKED"] = "blocked";
    /**
     * Only protected write operations are allowed in a BigQuery session.
     *
     * In this mode write operations in the anonymous dataset of a BigQuery session
     * are allowed. For example, a temporary table can be created, manipulated and
     * deleted in the anonymous dataset during Agent interaction, while protecting
     * permanent tables from being modified or deleted. To learn more about BigQuery
     * sessions, see https://cloud.google.com/bigquery/docs/sessions-intro.
     */
    WriteMode["PROTECTED"] = "protected";
    /**
     * All write operations are allowed.
     *
     * This mode allows all write operations including creating, modifying and
     * deleting permanent tables and datasets. Use this mode with caution.
     */
    WriteMode["UNRESTRICTED"] = "unrestricted";
})(WriteMode || (exports.WriteMode = WriteMode = {}));
//# sourceMappingURL=config.js.map