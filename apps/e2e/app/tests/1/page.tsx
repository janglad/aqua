import { ClientOne } from "./client";
import { mutationOne, queryOne } from "./functions.aqua";

export default async function PageOne() {
  const queryRes = await queryOne.run({
    name: "hi",
  });

  const mutationRes = await mutationOne.run({
    name: "hi",
  });

  return (
    <div>
      <div>
        <h1 className="font-bold">Server</h1>
        <pre>{JSON.stringify(queryRes, null, 2)}</pre>
        <pre>{JSON.stringify(mutationRes, null, 2)}</pre>
      </div>
      <ClientOne />
    </div>
  );
}
