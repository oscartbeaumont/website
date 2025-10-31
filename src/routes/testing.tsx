import { env } from "cloudflare:workers";

export async function GET() {
  const value = await env.KV.get('count');

  const count = parseInt(value || '0', 10);

  await env.KV.put('count', (count + 1).toString());

  return new Response(`Count: ${count}`);
}
