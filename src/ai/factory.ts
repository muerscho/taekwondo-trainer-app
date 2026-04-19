import { AiConfig } from '@/domain/types';
import { AIProvider } from './AIProvider';
import { ClaudeProvider } from './ClaudeProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { decryptApiKey } from '@/security/keyStore';

export async function buildProvider(cfg: AiConfig): Promise<AIProvider | null> {
  if (!cfg.apiKeyCipher || !cfg.apiKeyIv) return null;
  const apiKey = await decryptApiKey(cfg.apiKeyIv, cfg.apiKeyCipher);
  const base = { apiKey, model: cfg.model, providerId: cfg.provider, baseUrl: cfg.customEndpointUrl ?? undefined };
  switch (cfg.provider) {
    case 'Claude': return new ClaudeProvider(base);
    case 'OpenAI': return new OpenAIProvider(base);
    case 'Custom': return new OpenAIProvider(base);
  }
}
