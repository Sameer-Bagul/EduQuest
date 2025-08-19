export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface VoiceRecorderOptions {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onStart?: () => void;
  onStop?: () => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
}

export class VoiceRecorder {
  private recognition: any = null;
  private isRecording = false;
  private options: VoiceRecorderOptions;

  constructor(options: VoiceRecorderOptions) {
    this.options = options;
    this.setupRecognition();
  }

  private setupRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      this.options.onError?.('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.options.language || 'en-US';
    this.recognition.continuous = this.options.continuous ?? true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isRecording = true;
      this.options.onStart?.();
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      this.options.onStop?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        transcript += result[0].transcript;
        if (result.isFinal) {
          isFinal = true;
        }
      }

      this.options.onTranscript(transcript, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      this.options.onError?.(event.error);
    };
  }

  start() {
    if (!this.recognition) {
      this.options.onError?.('Speech recognition not available');
      return;
    }

    if (this.isRecording) {
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      this.options.onError?.('Failed to start recording');
    }
  }

  stop() {
    if (!this.recognition || !this.isRecording) {
      return;
    }

    try {
      this.recognition.stop();
    } catch (error) {
      this.options.onError?.('Failed to stop recording');
    }
  }

  isSupported() {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }

  getRecordingState() {
    return this.isRecording;
  }
}
