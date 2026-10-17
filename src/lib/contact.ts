import { absoluteUrl, siteUrl } from "./site";

export const PROJECT_LABELS: Record<string, string> = {
  portrait: "Portrait Session",
  automotive: "Automotive",
  other: "Special Requests",
};

// Discord rejects embed field values over 1024 characters; the form's maxLength matches.
export const CONTACT_LIMITS = { name: 200, email: 254, phone: 40, project: 100, message: 1024 } as const;

export type ContactMessage = Record<keyof typeof CONTACT_LIMITS, string>;

function field(input: Record<string, unknown>, key: keyof ContactMessage) {
  const value = input[key];
  return typeof value === "string" ? value.trim().slice(0, CONTACT_LIMITS[key]) : "";
}

/** Validates a contact form submission. Throws an Error whose message is safe to show the visitor. */
export function parseContactMessage(input: Record<string, unknown>): ContactMessage {
  const message = {
    name: field(input, "name"),
    email: field(input, "email"),
    phone: field(input, "phone"),
    project: field(input, "project"),
    message: field(input, "message"),
  };
  if (!message.name) throw new Error("Missing required fields.");
  if (!message.email && !message.phone) throw new Error("Please provide an email address or phone number.");
  if (!message.message) throw new Error("Missing required fields.");
  return message;
}

export function buildDiscordPayload(values: ContactMessage, now = new Date()) {
  return {
    username: "Contact Form Bot",
    allowed_mentions: { parse: [] as string[] },
    embeds: [
      {
        color: 0xf5c518,
        author: {
          name: "Website: Photography Portfolio",
          url: absoluteUrl("/"),
          icon_url: absoluteUrl("/favicon.ico"),
        },
        title: "New Message...",
        description: "You got a new message!",
        footer: { text: `Generated from ${new URL(siteUrl).host}/#contact` },
        timestamp: now.toISOString(),
        fields: [
          { name: "Contact Name", value: values.name, inline: true },
          ...(values.email ? [{ name: "Email", value: values.email, inline: true }] : []),
          ...(values.phone ? [{ name: "Phone", value: values.phone, inline: true }] : []),
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
