import { AIProvider, AIProviderConfig } from './AIProvider';

export class OpenAIProvider extends AIProvider {
  constructor(cfg: AIProviderConfig) { super(cfg); }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      const r = await this.text('Antworte mit OK.', 'Du bist ein kurzer Assistent.');
      return { ok: r.toLowerCase().includes('ok') };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  async text(prompt: string, systemPrompt?: string): Promise<string> {
    const base = this.cfg.baseUrl?.replace(/\/$/, '') || 'https://api.openai.com';
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cfg.apiKey}`
      },
      body: JSON.stringify({
        model: this.cfg.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: 1024
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI API ${res.status}: ${txt}`);
    }
    const json = await res.json() as { choices: Array<{ message: { content: string } }> };
    return json.choices[0]?.message.content ?? '';
  }
}
