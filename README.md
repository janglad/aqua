# Aqua

Meant to completely blend the boundaries between client and server.

> [!IMPORTANT]
> Very much a work in progress.

```ts
import { AquaFunction } from "aqua";

export const myQuery = AquaFunction.query("myQuery")
  .input(
    z.object({
      name: z.string(),
    })
  )
  .handler(async (input) => aOk(`hello ${input.name}`));
```

You can then call this function on the client or server.

```ts
// Fetches on client, calls handler directly on server
const data = await myQuery.run({ name: "world" });
```

This enabled cool patterns like this:

```ts
import { getTodos } from "./todos.aqua";
import { queryOptions } from "@tanstack/react-query";

export const getTodoQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["todos", id],
    queryFn: () => getTodos.run({ id }),
  });

//   Server component

export function Todo({ id }: { id: string }) {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(getTodoQueryOptions(id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodoComponent id={id} />
    </HydrationBoundary>
  );
}

// Client component
export function TodoClient({ id }: { id: string }) {
  const { data } = useSuspenseQuery(getTodoQueryOptions(id));

  return <div>{data.title}</div>;
}
```

while also avoiding the issues like possible circular dependencies for RPC client/router for types and poor performance of the types with solutions like Hono RPC.

## What and why

Like server actions, but allows concurrent requests, GET endpoint and allows you to specify a URL for the endpoint. This makes it more friendly for self hosted solutions that don't have Vercel's skew protection.

## How to use

### Setup

wrap your next config with `withAquaPlugin`

```ts
import { withAquaPlugin } from "aqua/plugin";

export default withAquaPlugin(nextConfig);
```

create a router

```ts
import { AquaRouter } from "aqua/router";

export const router = new AquaRouter([
  // Mount your AquaFunctions here
]);
```

then create a route at `app/[...aqua]/route.ts`. This path can be customised by setting `NEXT_PUBLIC_AQUA_PATH_PREFIX` in your environment.

```ts
import { router } from "../router";

export const POST = async (req: Request) => {
  return router.handleRequest(req);
};
export const GET = async (req: Request) => {
  return router.handleRequest(req);
};
```

### Filename

All aqua functions must be declared in a filename ending in `.aqua.ts`.

### Input

Mandatory, accepts a `Standard Schema` compliant input schema (Zod, Valibot, Arktype, ...). Adds the following returntype to `run()`

```ts
type A = {
  ok: false;
  error: {
    _tag: "INPUT_PARSING";
    cause: StandardSchemaV1.FailureResult;
  };
};
```

### Handler

Takes in the input from the `input` schema. Must be an async function that returns a `{ok: true, data: D} | {ok: false, error: E}`. These can be constructed using `aOk` and `aErr`.

### Output

Optional, accepts a `Standard Schema` compliant output schema (Zod, Valibot, Arktype, ...). Changes the output data to be the output of the schema, also adds the following return type to `run()`

```ts
type A = {
  ok: false;
  error: {
    _tag: "OUTPUT_PARSING";
    cause: StandardSchemaV1.FailureResult;
  };
};
```

## How it works

On the one hand it makes use of conditional exports in `package.json`. This allows us to implement different logic for `.run()` (call the `handler` on the server, run `fetch` on the client).

On the other hand it also uses a Babel plugin to strip `input`, `output` and `handler` from the client bundle. It makes use of WebPack's `issuerLayer` to target the different environments. After this it depends on Webpack to strip unused imports from the client bundle (preventing issues when you say import `next/headers`). So far this seems to work really well but I'd still advise you to use `server-only` to give a runtime error when server code is imported on the client.
