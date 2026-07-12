import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("attendance");
  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const key = url.searchParams.get("key");
      const prefix = url.searchParams.get("prefix");

      if (key) {
        const value = await store.get(key);
        return Response.json({ value });
      }
      if (prefix !== null) {
        const { blobs } = await store.list({ prefix });
        return Response.json({ keys: blobs.map((b) => b.key) });
      }
      return Response.json({ error: "key or prefix required" }, { status: 400 });
    }

    if (req.method === "POST") {
      const body = await req.json();
      if (!body || !body.key) {
        return Response.json({ error: "key required" }, { status: 400 });
      }
      await store.set(body.key, body.value);
      return Response.json({ ok: true });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config = { path: "/api/data" };
