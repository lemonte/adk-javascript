import { BaseMemoryService, SearchMemoryResponse } from './base-memory-service';
import { Session } from '../sessions/session';
/**
 * An in-memory memory service for prototyping purpose only.
 *
 * Uses keyword matching instead of semantic search.
 *
 * This class should be used for testing and development only.
 */
export declare class InMemoryMemoryService extends BaseMemoryService {
    private sessionEvents;
    /**
     * Keys are "{app_name}/{user_id}". Values are Maps of session_id to
     * session event lists.
     */
    addSessionToMemory(session: Session): Promise<void>;
    searchMemory(params: {
        appName: string;
        userId: string;
        query: string;
    }): Promise<SearchMemoryResponse>;
}
//# sourceMappingURL=in-memory-memory-service.d.ts.map