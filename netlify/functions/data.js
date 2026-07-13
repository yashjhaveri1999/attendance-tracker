const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const store = getStore({
    name: "attendance",
    siteID: process.env.BLOBS_SITE_ID,
    token: process.env.BLOBS_TOKEN
  });
  const params = event.queryStringParameters || {};

  try {
    if (event.httpMethod === "GET") {
      const key = params.key;
      const prefix = params.prefix;

      if (key) {
        const value = await store.get(key);
        return { statusCode: 200, body: JSON.stringify({ value }) };
      }
      if (prefix !== undefined) {
        const { blobs } = await store.list({ prefix });
        return { statusCode: 200, body: JSON.stringify({ keys: blobs.map((b) => b.key) }) };
      }
      return { statusCode: 400, body: JSON.stringify({ error: "key or prefix required" }) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (!body.key) {
        return { statusCode: 400, body: JSON.stringify({ error: "key required" }) };
      }
      await store.set(body.key, body.value);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, body: "Method not allowed" };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
