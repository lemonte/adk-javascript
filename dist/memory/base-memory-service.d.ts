import { MemoryEntry } from './memory-entry';
import { Session } from '../sessions/session';
/**
 * Represents the response from a memory search.
 */
export interface SearchMemoryResponse {
    /**
     * A list of memory entries that relate to the search query.
     */
    memories: MemoryEntry[];
}
/**
 * Base class for memory services.
 *
 * The service provides functionalities to ingest sessions into memory so that
 * the memory can be used for user queries.
 */
export declare abstract class BaseMemoryService {
    /**
     * Adds a session to the memory service.
     *
     * A session may be added multiple times during its lifetime.
     *
     * @param session - The session to add.
     */
    abstract addSessionToMemory(session: Session): Promise<void>;
    /**
     * Searches for sessions that match the query.
     *
     * @param params - The search parameters.
     * @param params.appName - The name of the application.
     * @param params.userId - The id of the user.
     * @param params.query - The query to search for.
     * @returns A SearchMemoryResponse containing the matching memories.
     */
    abstract searchMemory(params: {
        appName: string;
        userId: string;
        query: string;
    }): Promise<SearchMemoryResponse>;
}
//# sourceMappingURL=base-memory-service.d.ts.map