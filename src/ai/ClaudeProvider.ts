import { AIProvider, AIProviderConfig } from './AIProvider';

export class ClaudeProvider extends AIProvider {
  constructor(cfg: AIProviderConfig) { super(cfg); }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await this.call('Ping', 'Antworte mit dem Wort "OK".');
      return { ok: res.toLowerCase().includes('ok') };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  async text(prompt: string, systemPrompt?: string): Promise<string> {
    return this.call(prompt, systemPrompt);
  }

  private async call(prompt: string, system?: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.cfg.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: this.cfg.model,
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Claude API ${res.status}: ${txt}`);
    }
    const json = await res.json() as { content: Array<{ type: string; text: string }> };
    return json.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
  }
}
