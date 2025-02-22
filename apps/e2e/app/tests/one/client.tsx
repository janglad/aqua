"use client";

import { useEffect, useState } from "react";
import { mutationOne, queryOne } from "./functions.aqua";

export function ClientOne() {
  const [queryRes, setQueryRes] = useState<any>(null);
  const [mutationRes, setMutationRes] = useState<any>(null);

  useEffect(() => {
    queryOne.run({ name: "hi" }).then(setQueryRes);
    mutationOne.run({ name: "hi" }).then(setMutationRes);
  }, []);

  return (
    <div>
      <h1 className="font-bold">Client</h1>
      <pre>{JSON.stringify(queryRes, null, 2)}</pre>
      <pre>{JSON.stringify(mutationRes, null, 2)}</pre>
    </div>
  );
}
