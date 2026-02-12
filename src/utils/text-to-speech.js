class TTSManager {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.loadVoices();
    
    // Crucial for Chrome/Edge
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  loadVoices() {
    this.voices = this.synth.getVoices();
  }

  /**
   * @param {string} text 
   * @param {string} langCode - e.g., 'ur', 'en', 'es'
   */
  speak(text, langCode = 'en', rate = 0.9) {
    if (!text) return;
    
    // Stop any current speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 1. Try to find the best matching voice
    // We check if the voice language starts with our langCode (e.g., 'ur' matches 'ur-PK')
    let voice = this.voices.find((v) => 
      v.lang.toLowerCase().startsWith(langCode.toLowerCase())
    );

    // 2. Fallback: If 'ur' fails, try 'hi' (Hindi) as it sounds similar for Urdu text
    if (!voice && langCode === 'ur') {
      voice = this.voices.find((v) => v.lang.startsWith('hi'));
    }

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      // If no specific voice found, at least set the lang attribute
      utterance.lang = langCode;
      console.warn(`No specific voice found for: ${langCode}. Using system default.`);
    }

    utterance.rate = rate;
    utterance.pitch = 1;
    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
  }
}

export const tts = new TTSManager();