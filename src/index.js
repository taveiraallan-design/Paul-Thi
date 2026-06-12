// Worker do Paul-Thi
// Serve o site estatico (via ASSETS) e responde a API de produtos.
//
// Rotas:
//   GET    /api/products            -> lista publica de produtos (usada pelo site)
//   POST   /api/admin/login          -> login admin, retorna token de sessao
//   POST   /api/admin/products       -> cria produto (precisa token admin)
//   PUT    /api/admin/products/:id   -> edita produto (precisa token admin)
//   DELETE /api/admin/products/:id   -> remove produto (precisa token admin)
//
// Autenticacao admin: faz POST /api/admin/login com { "password": "..." }.
// Se a senha bater com o secret ADMIN_PASSWORD, retorna um token assinado
// valido por 2 horas. As rotas /api/admin/* exigem esse token no header
// "Authorization: Bearer <token>".
// Configure o secret com: wrangler secret put ADMIN_PASSWORD

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function rowToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    cat: row.cat,
    icon: row.icon,
    image: row.image,
    price: row.price,
    rating: row.rating,
    reviews: row.reviews,
    badge: row.badge,
    desc: row.description,
    specs: row.specs ? JSON.parse(row.specs) : {}
  };
}

// --- Autenticacao por token assinado (HMAC) ---

async function hmac(env, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.ADMIN_PASSWORD),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function createToken(env) {
  const exp = Date.now() + 1000 * 60 * 60 * 2; // valido por 2 horas
  const sig = await hmac(env, String(exp));
  return `${exp}.${sig}`;
}

async function checkAdmin(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return false;

  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Date.now() > Number(exp)) return false;

  const expectedSig = await hmac(env, exp);
  return sig === expectedSig;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/products" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM products ORDER BY id"
      ).all();
      return jsonResponse(results.map(rowToProduct));
    }

    if (path === "/api/admin/login" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const senha = body.password;

      if (senha && env.ADMIN_PASSWORD && senha === env.ADMIN_PASSWORD) {
        const token = await createToken(env);
        return jsonResponse({ ok: true, token });
      }

      return jsonResponse({ error: "Senha invalida" }, 401);
    }

    if (path.startsWith("/api/admin/products")) {
      if (!(await checkAdmin(request, env))) {
        return jsonResponse({ error: "Nao autorizado" }, 401);
      }

      if (path === "/api/admin/products" && request.method === "POST") {
        const body = await request.json();
        const result = await env.DB.prepare(
          `INSERT INTO products (name, cat, icon, image, price, rating, reviews, badge, description, specs)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          body.name,
          body.cat,
          body.icon || "",
          body.image || "",
          body.price || 0,
          body.rating || 0,
          body.reviews || 0,
          body.badge || null,
          body.desc || "",
          JSON.stringify(body.specs || {})
        ).run();

        return jsonResponse({ ok: true, id: result.meta.last_row_id });
      }

      const matchId = path.match(/^\/api\/admin\/products\/(\d+)$/);
      if (matchId && request.method === "PUT") {
        const id = matchId[1];
        const body = await request.json();
        await env.DB.prepare(
          `UPDATE products SET
             name = ?, cat = ?, icon = ?, image = ?, price = ?,
             rating = ?, reviews = ?, badge = ?, description = ?, specs = ?,
             updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        ).bind(
          body.name,
          body.cat,
          body.icon || "",
          body.image || "",
          body.price || 0,
          body.rating || 0,
          body.reviews || 0,
          body.badge || null,
          body.desc || "",
          JSON.stringify(body.specs || {}),
          id
        ).run();

        return jsonResponse({ ok: true });
      }

      if (matchId && request.method === "DELETE") {
        const id = matchId[1];
        await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
        return jsonResponse({ ok: true });
      }

      return jsonResponse({ error: "Rota nao encontrada" }, 404);
    }

    return env.ASSETS.fetch(request);
  }
};