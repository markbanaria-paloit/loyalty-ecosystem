/**
 * Campaign studio routes — the chat-driven campaign customisation surface.
 *
 * The client posts the whole conversation each turn (the agent is stateless
 * here) and gets back the assistant's reply plus the tool activity, so the UI
 * can show what was inspected and changed.
 */
import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { runClaudeTurn } from '../studio/agent.js';
import { runOfflineTurn } from '../studio/offline.js';
import { olAdmin, OpenLoyaltyAdminError } from '../studio/olAdmin.js';

export const studioRouter = Router();

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .min(1)
    .max(50),
});

studioRouter.get('/api/studio/context', async (_req, res) => {
  try {
    const [tiers, campaigns, categories] = await Promise.all([
      olAdmin.tiers(),
      olAdmin.campaigns(),
      olAdmin.categories(),
    ]);
    res.json({
      mode: config.studio.anthropicApiKey ? 'claude' : 'offline',
      model: config.studio.anthropicApiKey ? config.studio.model : null,
      storeCode: olAdmin.storeCode,
      tiers,
      campaigns,
      categories,
    });
  } catch (err) {
    const status = err instanceof OpenLoyaltyAdminError ? err.status : 502;
    res.status(status >= 400 && status < 500 ? status : 502).json({
      message: err instanceof Error ? err.message : 'Upstream error',
    });
  }
});

studioRouter.post('/api/studio/chat', async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'messages[] is required' });
    return;
  }

  try {
    const reply = config.studio.anthropicApiKey
      ? await runClaudeTurn(parsed.data.messages)
      : await runOfflineTurn(parsed.data.messages);
    res.json(reply);
  } catch (err) {
    if (err instanceof OpenLoyaltyAdminError) {
      res.status(502).json({ message: `OpenLoyalty: ${err.message}` });
      return;
    }
    // Surface the model's own error text — auth and quota problems are the
    // common case here and the message is the useful part.
    res.status(502).json({
      message: err instanceof Error ? err.message : 'Campaign studio failed',
    });
  }
});

/** Campaign list for the side panel, refreshed after each turn. */
studioRouter.get('/api/studio/campaigns', async (_req, res) => {
  try {
    res.json({ campaigns: await olAdmin.campaigns() });
  } catch (err) {
    res.status(502).json({
      message: err instanceof Error ? err.message : 'Upstream error',
    });
  }
});
