// Worker do Paul-Thi
// Serve o site estatico (via ASSETS) e responde a API de produtos.
//
// Rotas:
//   GET    /api/products            -> lista publica de produtos (usada pelo site)
//   POST   /api/admin/products       -> cria produto (precisa senha admin)
//   PUT    /api/admin/products/:id   -> edita produto (precisa senha admin)
//   DELETE /api/admin/products/:id   -> remove produto (precisa senha admin)
//
// Autenticacao admin: header "X-Admin-Password" precisa bater com o secret ADMIN_PASSWORD.
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

function checkAdmin(request, env) {
  const senha = request.headers.get("X-Admin-Password");
  return senha && env.ADMIN_PASSWORD && senha === env.ADMIN_PASSWORD;
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

    if (path.startsWith("/api/admin/products")) {
      if (!checkAdmin(request, env)) {
        return jsonResponse({ error: "Senha invalida" }, 401);
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