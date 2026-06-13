/**
 * Stealth Processor Module
 * Removes AI-detectable patterns from LLM outputs
 * Implements perplexity smoothing, dynamic temperature, and human-like paraphrasing
 */

import { invokeLLM } from "./_core/llm";

interface StealthConfig {
  enablePerplexitySmoothing: boolean;
  enableDynamicTemperature: boolean;
  enableRepetitionPenalty: boolean;
  enableParaphrasing: boolean;
  minTemperature: number;
  maxTemperature: number;
  repetitionPenalty: number;
}

const defaultStealthConfig: StealthConfig = {
  enablePerplexitySmoothing: true,
  enableDynamicTemperature: true,
  enableRepetitionPenalty: true,
  enableParaphrasing: true,
  minTemperature: 0.7,
  maxTemperature: 1.3,
  repetitionPenalty: 1.2,
};

export class StealthProcessor {
  private config: StealthConfig;

  constructor(config: Partial<StealthConfig> = {}) {
    this.config = { ...defaultStealthConfig, ...config };
  }

  async process(
    text: string,
    language: "ar" | "en" = "ar",
    context?: string
  ): Promise<string> {
    let processed = text;

    if (this.config.enablePerplexitySmoothing) {
      processed = this.smoothPerplexity(processed);
    }

    if (this.config.enableParaphrasing) {
      processed = await this.paraphrase(processed, language, context);
    }

    if (this.config.enableRepetitionPenalty) {
      processed = this.applyRepetitionPenalty(processed);
    }

    processed = this.removeWatermarks(processed);
    processed = this.breakStatisticalPatterns(processed);

    return processed;
  }

  private smoothPerplexity(text: string): string {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
    const smoothed = sentences.map((sentence, index) => {
      const trimmed = sentence.trim();
      if (!trimmed) return "";

      if (index % 3 === 0) {
        return this.varyStartingPhrase(trimmed);
      } else if (index % 3 === 1) {
        return this.insertCasualMarkers(trimmed);
      }
      return trimmed;
    });

    return smoothed.filter((s) => s).join(". ") + ".";
  }

  private varyStartingPhrase(sentence: string): string {
    const variations = [
      "Indeed, " + sentence,
      "Notably, " + sentence,
      "Interestingly, " + sentence,
      "Furthermore, " + sentence,
      "In essence, " + sentence,
    ];

    return variations[Math.floor(Math.random() * variations.length)];
  }

  private insertCasualMarkers(sentence: string): string {
    const markers = ["you know", "kind of", "sort of", "I think", "perhaps"];
    const randomMarker = markers[Math.floor(Math.random() * markers.length)];

    if (Math.random() > 0.5) {
      return `${sentence}, ${randomMarker}.`;
    }
    return sentence;
  }

  private async paraphrase(
    text: string,
    language: "ar" | "en",
    context?: string
  ): Promise<string> {
    try {
      const systemPrompt =
        language === "ar"
          ? "أعد صياغة النص التالي بطريقة طبيعية وإنسانية دون تغيير المعنى الأساسي."
          : "Rephrase the following text in a natural, human-like way without changing the core meaning.";

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: context
              ? `Context: ${context}. Text to rephrase: ${text}`
              : `Rephrase: ${text}`,
          },
        ],
      });

      const content = response.choices?.[0]?.message?.content;
      return typeof content === "string" ? content : text;
    } catch (error) {
      console.warn("[StealthProcessor] Paraphrasing failed:", error);
      return text;
    }
  }

  private applyRepetitionPenalty(text: string): string {
    const words = text.split(/\s+/);
    const result: string[] = [];
    const recentWords = new Set<string>();
    const windowSize = 5;

    for (let i = 0; i < words.length; i++) {
      const word = words[i]!.toLowerCase();

      if (recentWords.has(word) && Math.random() < 0.3) {
        const synonym = this.findSynonym(word);
        result.push(synonym);
      } else {
        result.push(words[i]!);
      }

      recentWords.add(word);
      if (recentWords.size > windowSize) {
        const firstWord = words[i - windowSize]?.toLowerCase();
        if (firstWord) recentWords.delete(firstWord);
      }
    }

    return result.join(" ");
  }

  private findSynonym(word: string): string {
    const synonymMap: Record<string, string[]> = {
      the: ["a", "this", "that"],
      is: ["appears", "seems", "becomes"],
      very: ["quite", "rather", "fairly"],
      good: ["excellent", "fine", "nice"],
      bad: ["poor", "weak", "inferior"],
      important: ["significant", "crucial", "vital"],
      different: ["distinct", "varied", "diverse"],
      similar: ["alike", "comparable", "analogous"],
    };

    const synonyms = synonymMap[word];
    if (synonyms && synonyms.length > 0) {
      return synonyms[Math.floor(Math.random() * synonyms.length)];
    }
    return word;
  }

  private removeWatermarks(text: string): string {
    const watermarkPatterns = [
      /\b(I am an AI|I'm an AI|As an AI)\\b/gi,
      /\b(I cannot|I can't)\s+(provide|generate|create)/gi,
      /\b(However|Nevertheless|That being said),\s+I\s+(must|should)\s+(note|mention)/gi,
      /\b(It's important to note that|Please note that|I should mention that)\\b/gi,
    ];

    let processed = text;
    for (const pattern of watermarkPatterns) {
      processed = processed.replace(pattern, "");
    }

    return processed.trim();
  }

  private breakStatisticalPatterns(text: string): string {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());

    const modified = sentences.map((sentence, index) => {
      const trimmed = sentence.trim();
      if (!trimmed) return "";

      const length = trimmed.split(/\s+/).length;

      if (length > 20 && Math.random() > 0.5) {
        const parts = trimmed.split(/,|;/);
        if (parts.length > 1) {
          return parts.join(". ");
        }
      }

      if (length < 5 && index < sentences.length - 1) {
        const nextSentence = sentences[index + 1]?.trim();
        if (nextSentence && nextSentence.split(/\s+/).length < 10) {
          return `${trimmed}. ${nextSentence}`;
        }
      }

      return trimmed;
    });

    return modified.filter((s) => s).join(". ") + ".";
  }

  getDynamicTemperature(text: string): number {
    const length = text.split(/\s+/).length;
    const uniqueWords = new Set(text.toLowerCase().split(/\W+/)).size;
    const diversity = uniqueWords / length;

    if (diversity > 0.7) {
      return this.config.maxTemperature;
    } else if (diversity < 0.3) {
      return this.config.minTemperature;
    }

    const normalized = (diversity - 0.3) / 0.4;
    return (
      this.config.minTemperature +
      normalized * (this.config.maxTemperature - this.config.minTemperature)
    );
  }

  getTopP(): number {
    return 0.95;
  }

  getTopK(): number {
    return 50;
  }
}

export function createStealthProcessor(
  config?: Partial<StealthConfig>
): StealthProcessor {
  return new StealthProcessor(config);
}
