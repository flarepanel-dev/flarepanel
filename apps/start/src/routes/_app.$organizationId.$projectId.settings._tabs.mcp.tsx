import { createFileRoute } from '@tanstack/react-router';
import { ExternalLinkIcon, PlusIcon } from 'lucide-react';
import type React from 'react';
import type { ReactNode } from 'react';
import { BrandLogo, type BrandLogoId } from '@/components/brand-logos';
import CopyInput from '@/components/forms/copy-input';
import Syntax from '@/components/syntax';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAppContext } from '@/hooks/use-app-context';
import { pushModal } from '@/modals';
import { cn } from '@/utils/cn';

export const Route = createFileRoute(
  '/_app/$organizationId/$projectId/settings/_tabs/mcp'
)({
  component: Component,
});

const TOKEN_PLACEHOLDER = 'BASE64_TOKEN';
const DOCS_URL = 'https://docs.flarepanel.dev/features/mcp';

interface AiClient {
  id: string;
  name: string;
  /** Hosted edition only: the tool's own mark beside its name. */
  logo: BrandLogoId;
  description: React.ReactNode;
  configFile?: string;
  language: 'json' | 'bash';
  snippet: (mcpUrl: string) => string;
}

const buildClients = (mcpEndpoint: string): AiClient[] => {
  const url = mcpEndpoint;
  const headers = { Authorization: `Bearer ${TOKEN_PLACEHOLDER}` };
  // Fallback for clients that can't send headers.
  const urlWithToken = `${mcpEndpoint}?token=${TOKEN_PLACEHOLDER}`;

  return [
    {
      id: 'claude-desktop',
      logo: 'claude',
      name: 'Claude Desktop',
      description: (
        <>
          Add the following block to <code>claude_desktop_config.json</code>.
          You can open it from{' '}
          <strong>Settings → Developer → Edit Config</strong>.
        </>
      ),
      configFile:
        'macOS: ~/Library/Application Support/Claude/claude_desktop_config.json',
      language: 'json',
      snippet: () =>
        JSON.stringify(
          {
            mcpServers: {
              flarepanel: {
                type: 'streamable-http',
                url,
                headers,
              },
            },
          },
          null,
          2
        ),
    },
    {
      id: 'claude-code',
      logo: 'claude',
      name: 'Claude Code (CLI)',
      description: (
        <>
          Run this once in your terminal. If your setup can't pass headers, use{' '}
          <code>"{urlWithToken}"</code> as the URL instead and drop the{' '}
          <code>--header</code> flag.
        </>
      ),
      language: 'bash',
      snippet: () =>
        `claude mcp add --transport http flarepanel ${url} \\\n  --header "Authorization: Bearer ${TOKEN_PLACEHOLDER}"`,
    },
    {
      id: 'cursor',
      logo: 'cursor',
      name: 'Cursor',
      description: (
        <>
          Add the server to your global config at{' '}
          <code>~/.cursor/mcp.json</code> or your project config at{' '}
          <code>.cursor/mcp.json</code>.
        </>
      ),
      configFile: '~/.cursor/mcp.json',
      language: 'json',
      snippet: () =>
        JSON.stringify(
          {
            mcpServers: {
              flarepanel: {
                url,
                transport: 'streamable-http',
                headers,
              },
            },
          },
          null,
          2
        ),
    },
    {
      id: 'windsurf',
      logo: 'windsurf',
      name: 'Windsurf',
      description: (
        <>
          Add the server to <code>~/.codeium/windsurf/mcp_config.json</code>.
          Windsurf accepts both <code>serverUrl</code> and <code>url</code>.
        </>
      ),
      configFile: '~/.codeium/windsurf/mcp_config.json',
      language: 'json',
      snippet: () =>
        JSON.stringify(
          {
            mcpServers: {
              flarepanel: {
                serverUrl: url,
                headers,
              },
            },
          },
          null,
          2
        ),
    },
    {
      id: 'vscode',
      logo: 'vscode',
      name: 'VS Code (Copilot)',
      description: (
        <>
          Add the server to <code>.vscode/mcp.json</code> in your workspace, or
          to your user-level MCP config.
        </>
      ),
      configFile: '.vscode/mcp.json',
      language: 'json',
      snippet: () =>
        JSON.stringify(
          {
            servers: {
              flarepanel: {
                type: 'http',
                url,
                headers,
              },
            },
          },
          null,
          2
        ),
    },
    {
      id: 'raycast',
      logo: 'raycast',
      name: 'Raycast',
      description: (
        <>
          Copy the JSON below, then run the <strong>Install Server</strong>{' '}
          command in Raycast — it auto-fills the form from your clipboard. The
          install form takes a URL only, so the token goes in the query string.
        </>
      ),
      language: 'json',
      snippet: () =>
        JSON.stringify(
          {
            name: 'flarepanel',
            transport: 'streamable-http',
            url: urlWithToken,
          },
          null,
          2
        ),
    },
  ];
};

function Component() {
  const { apiUrl } = useAppContext();
  const mcpEndpoint = `${apiUrl}/mcp`;
  const clients = buildClients(mcpEndpoint);

  return (
    <div className="col gap-6">
      <div className="col gap-2">
        {/* The hosted edition shows the title in the coloured tab banner. */}
        <h2 className="hosted:hidden font-semibold text-lg">MCP Server</h2>
        <p className="hosted:rounded-lg hosted:border hosted:border-[color-mix(in_oklab,var(--chart-2)_35%,var(--border))] hosted:bg-[color-mix(in_oklab,var(--chart-2)_8%,var(--card))] hosted:p-3 hosted:text-foreground/80 text-muted-foreground text-sm">
          Connect any MCP-compatible AI client (Claude, Cursor, Windsurf, …) to
          your FlarePanel data. A <strong>read</strong> client reads this
          project only and cannot change anything. A <strong>root</strong>{' '}
          client reads every project in the workspace and can also create, edit
          and delete dashboards and reports, so keep its token private.
        </p>
      </div>

      <Step number={1}>
        <div className="col gap-2">
          <CopyInput label="Endpoint" value={mcpEndpoint} />
          <p className="text-muted-foreground text-xs">
            Send your token as an <code>Authorization: Bearer</code> header,
            with <code>base64(clientId:clientSecret)</code> in place of{' '}
            <code>{TOKEN_PLACEHOLDER}</code>. Clients that can't set headers
            take it as a <code>?token=</code> query param instead.
          </p>
        </div>
      </Step>

      <Step number={2}>
        <div className="col gap-3 rounded-lg border hosted:border-[color-mix(in_oklab,var(--tab-accent)_35%,var(--border))] bg-def-200 hosted:bg-[color-mix(in_oklab,var(--tab-accent)_8%,var(--card))] p-4">
          <div className="col gap-1">
            <div className="font-medium">Need a token?</div>
            <p className="text-muted-foreground text-sm">
              Only <code>read</code> and <code>root</code> clients can
              authenticate with MCP. Create one and copy the MCP token from the
              success screen — it's only shown once.
            </p>
          </div>
          <div>
            <Button icon={PlusIcon} onClick={() => pushModal('AddClient')}>
              Create MCP client
            </Button>
          </div>
        </div>
      </Step>

      <Step number={3}>
        <div className="col gap-2">
          <div className="font-medium">Configure your AI client</div>
          <Accordion className="rounded-lg border" collapsible type="single">
            {clients.map((client) => (
              <AccordionItem className="px-4" key={client.id} value={client.id}>
                <AccordionTrigger>
                  <span className="flex items-center gap-3">
                    <span className="hosted:flex hidden size-7 shrink-0 items-center justify-center rounded-md border bg-def-100">
                      <BrandLogo className="size-4" id={client.logo} />
                    </span>
                    {client.name}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="col gap-3">
                  <p className="text-muted-foreground text-sm">
                    {client.description}
                  </p>
                  {client.configFile && (
                    <p className="text-muted-foreground text-xs">
                      <span className="font-medium">Config file:</span>{' '}
                      <code>{client.configFile}</code>
                    </p>
                  )}
                  <Syntax
                    className="border"
                    code={client.snippet(mcpEndpoint)}
                    language={client.language}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Step>

      <a
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'hosted:ml-12 self-start'
        )}
        href={DOCS_URL}
        rel="noreferrer"
        target="_blank"
      >
        <ExternalLinkIcon className="mr-2 h-4 w-4" />
        Read the full MCP docs
      </a>
    </div>
  );
}

/** Hosted edition: a numbered, coloured step marker; self-hosted shows none. */
function Step({ number, children }: { number: number; children: ReactNode }) {
  return (
    <div className="hosted:grid hosted:grid-cols-[2rem_minmax(0,1fr)] hosted:gap-4">
      <div
        aria-hidden
        className="hosted:flex hidden size-8 items-center justify-center rounded-full bg-(--tab-accent) font-semibold text-sm text-white"
      >
        {number}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
