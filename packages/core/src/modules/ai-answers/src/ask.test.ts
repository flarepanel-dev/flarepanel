// The shapes the SDK gives for both providers' web search answers, from
// canned provider responses: inline citations come first, then search results.
import { describe, expect, it } from 'bun:test';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { collectSources } from './ask';

const json = (body: unknown) => async () =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

describe('collectSources', () => {
  it('reads an OpenAI Responses answer with web search', async () => {
    const openai = createOpenAI({
      apiKey: 'sk-test',
      fetch: json({
        id: 'resp_1',
        object: 'response',
        created_at: 1,
        status: 'completed',
        model: 'gpt-5.4-mini',
        output: [
          {
            type: 'web_search_call',
            id: 'ws_1',
            status: 'completed',
            action: {
              type: 'search',
              query: 'q',
              sources: [{ type: 'url', url: 'https://plausible.io/' }],
            },
          },
          {
            type: 'message',
            id: 'msg_1',
            role: 'assistant',
            status: 'completed',
            content: [
              {
                type: 'output_text',
                text: 'Plausible and FlarePanel.',
                annotations: [
                  {
                    type: 'url_citation',
                    url: 'https://flarepanel.dev/',
                    title: 'FlarePanel',
                    start_index: 0,
                    end_index: 5,
                  },
                ],
              },
            ],
          },
        ],
        usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
      }) as never,
    });
    const result = await generateText({
      model: openai('gpt-5.4-mini'),
      tools: { web_search: openai.tools.webSearch({}) },
      prompt: 'q',
      maxRetries: 0,
    });
    expect(result.text).toBe('Plausible and FlarePanel.');
    expect(collectSources(result).map((s) => s.url)).toEqual([
      'https://flarepanel.dev/',
      'https://plausible.io/',
    ]);
  });

  it('reads an Anthropic answer with web search', async () => {
    const anthropic = createAnthropic({
      apiKey: 'sk-ant-test',
      fetch: json({
        id: 'msg_1',
        type: 'message',
        role: 'assistant',
        model: 'claude-haiku-5-5',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 1, output_tokens: 1 },
        content: [
          {
            type: 'server_tool_use',
            id: 'srvtoolu_1',
            name: 'web_search',
            input: { query: 'q' },
          },
          {
            type: 'web_search_tool_result',
            tool_use_id: 'srvtoolu_1',
            content: [
              {
                type: 'web_search_result',
                url: 'https://umami.is/',
                title: 'Umami',
                encrypted_content: 'x',
                page_age: null,
              },
            ],
          },
          {
            type: 'text',
            text: 'Umami, then FlarePanel.',
            citations: [
              {
                type: 'web_search_result_location',
                url: 'https://flarepanel.dev/',
                title: 'FP',
                encrypted_index: 'x',
                cited_text: 'c',
              },
            ],
          },
        ],
      }) as never,
    });
    const result = await generateText({
      model: anthropic('claude-haiku-5-5'),
      tools: { web_search: anthropic.tools.webSearch_20250305({ maxUses: 3 }) },
      prompt: 'q',
      maxRetries: 0,
    });
    expect(collectSources(result).map((s) => s.url)).toEqual([
      'https://flarepanel.dev/',
      'https://umami.is/',
    ]);
  });
});
