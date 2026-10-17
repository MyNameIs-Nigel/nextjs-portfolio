import { buildDiscordPayload, parseContactMessage, type ContactMessage } from "@/lib/contact";
import { privateJson, readJson } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContactResponse = { ok: true } | { ok: false; error: string };

function reply(body: ContactResponse, status = 200): Response {
  return privateJson(body, status);
}

export async function POST(req: Request): Promise<Response> {
  let input: Record<string, unknown>;
  try {
    input = await readJson(req);
  } catch {
    return reply({ ok: false, error: "Malformed request body." }, 400);
  }

  let message: ContactMessage;
  try {
    message = parseContactMessage(input);
  } catch (error) {
    return reply({ ok: false, error: (error as Error).message }, 400);
  }

  const webhook = process.env.DISCORD_WEBHOOK;
  if (!webhook) {
    return reply({ ok: false, error: "The contact channel is not configured." }, 500);
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildDiscordPayload(message)),
    });
    if (!res.ok) {
      return reply({ ok: false, error: "The message could not be delivered." }, 502);
    }
  } catch {
    return reply({ ok: false, error: "The message could not be delivered." }, 502);
  }

  return reply({ ok: true });
}
