export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

type ContactBody = {
  name: string;
  email: string;
  phone: string;
  project: string;
  message: string;
};

type ContactResponse = { ok: true } | { ok: false; error: string };

function reply(body: ContactResponse, status = 200): Response {
  return Response.json(body, { status, headers: JSON_HEADERS });
}

const PROJECT_LABELS: Record<string, string> = {
  portrait: "Portrait Session",
  automotive: "Automotive",
  other: "Special Requests",
};

function buildDiscordPayload(values: ContactBody) {
  const contactFields = [
    ...(values.email ? [{ name: "Email", value: values.email, inline: true }] : []),
    ...(values.phone ? [{ name: "Phone", value: values.phone, inline: true }] : []),
  ];

  return {
    username: "Contact Form Bot",
    allowed_mentions: { parse: [] as string[] },
    embeds: [
      {
        color: 0xf5c518,
        author: {
          name: "Website: Photography Portfolio",
          url: "https://ndsironwood.com/",
          icon_url: "https://ndsironwood.com/favicon.ico",
        },
        title: "New Message...",
        description: "You got a new message!",
        footer: { text: "Generated from ndsironwood.com/#contact" },
        timestamp: new Date().toISOString(),
        fields: [
          { name: "Contact Name", value: values.name, inline: true },
          ...contactFields,
          {
            name: "Project Type",
            value: (PROJECT_LABELS[values.project] ?? values.project) || "*none specified*",
            inline: true,
          },
          { name: "Message", value: values.message, inline: false },
        ],
      },
    ],
  };
}

export async function POST(req: Request): Promise<Response> {
  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return reply({ ok: false, error: "Malformed request body." }, 400);
  }

  if (typeof data !== "object" || data === null) {
    return reply({ ok: false, error: "Invalid request body." }, 400);
  }

  const { name, email, phone, project, message } = data as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) {
    return reply({ ok: false, error: "Missing required fields." }, 400);
  }

  const emailVal = typeof email === "string" ? email.trim() : "";
  const phoneVal = typeof phone === "string" ? phone.trim() : "";

  if (!emailVal && !phoneVal) {
    return reply({ ok: false, error: "Please provide an email address or phone number." }, 400);
  }

  if (typeof message !== "string" || !message.trim()) {
    return reply({ ok: false, error: "Missing required fields." }, 400);
  }

  const webhook = process.env.DISCORD_WEBHOOK;
  if (!webhook) {
    return reply({ ok: false, error: "The contact channel is not configured." }, 500);
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        buildDiscordPayload({
          name: name.trim(),
          email: emailVal,
          phone: phoneVal,
          project: typeof project === "string" ? project.trim() : "",
          message: message.trim().slice(0, 1024),
        }),
      ),
    });
    if (!res.ok) {
      return reply({ ok: false, error: "The message could not be delivered." }, 502);
    }
  } catch {
    return reply({ ok: false, error: "The message could not be delivered." }, 502);
  }

  return reply({ ok: true });
}
