/**
 * Handles audio transcription functionality.
 */
import { InvocationContext } from '../../types';
import { Content } from '../../types';
/**
 * AudioTranscriber handles transcription of audio files.
 */
export declare class AudioTranscriber {
    private initClient;
    constructor(initClient?: boolean);
    /**
     * Transcribes audio files from the invocation context.
     */
    transcribeFile(invocationContext: InvocationContext): Content[];
    /**
     * Transcribes audio data to text.
     */
    transcribeAudio(audioData: ArrayBuffer): Promise<string>;
}
//# sourceMappingURL=audio-transcriber.d.ts.map