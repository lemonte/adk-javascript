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
exports.AudioTranscriber = void 0;
/**
 * AudioTranscriber handles transcription of audio files.
 */
class AudioTranscriber {
    constructor(initClient = false) {
        this.initClient = initClient;
    }
    /**
     * Transcribes audio files from the invocation context.
     */
    transcribeFile(invocationContext) {
        // TODO: Implement audio transcription logic
        // This would handle transcribing audio files to text
        // For now, return empty array
        return [];
    }
    /**
     * Transcribes audio data to text.
     */
    async transcribeAudio(audioData) {
        // TODO: Implement actual audio transcription
        // This would use a speech-to-text service
        throw new Error('Audio transcription not implemented yet');
    }
}
exports.AudioTranscriber = AudioTranscriber;
//# sourceMappingURL=audio-transcriber.js.map