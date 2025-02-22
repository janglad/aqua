import type { AnyQuaFunction } from "./function/function";

export class AquaRouter {
  queryMap: Map<string, AnyQuaFunction> = new Map();
  mutationMap: Map<string, AnyQuaFunction> = new Map();

  constructor(functions: AnyQuaFunction[]) {
    for (const func of functions) {
      if (func.type === "query") {
        if (this.queryMap.has(func.id)) {
          throw new Error(`Duplicate query function id: ${func.id}`);
        }
        this.queryMap.set(func.id, func);
      } else {
        if (this.mutationMap.has(func.id)) {
          throw new Error(`Duplicate mutation function id: ${func.id}`);
        }
        this.mutationMap.set(func.id, func);
      }
    }
  }

  async handleRequest(req: Request) {
    const reqUrl = new URL(req.url);
    const requestPath = reqUrl.pathname;

    if (req.method !== "POST" && req.method !== "GET") {
      throw new Error(`Unsupported method ${req.method}`);
    }

    const handler =
      req.method === "POST"
        ? this.mutationMap.get(requestPath)
        : this.queryMap.get(requestPath);

    if (!handler) {
      throw new Error(`No handler found for ${requestPath}`);
    }

    const input =
      req.method === "POST"
        ? await req.json()
        : JSON.parse(reqUrl.searchParams.get("q")?.toString() ?? "{}");

    const res = await handler.run(input);
    return new Response(JSON.stringify(res), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
