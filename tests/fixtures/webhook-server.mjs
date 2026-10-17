import http from "node:http";

// Records webhook deliveries in memory so the contact form can be tested without Discord.
export async function startWebhookFixture() {
  const deliveries = [];
  const server = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    deliveries.push({ method: request.method, url: request.url, body: JSON.parse(Buffer.concat(chunks).toString() || "null") });
    response.writeHead(204).end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, deliveries, url: `http://127.0.0.1:${server.address().port}/webhook` };
}
