import { AquaRouter } from "aqua/router";
import { queryOne, mutationOne } from "./tests/1/functions.aqua";
import { queryTwo, mutationTwo } from "./tests/2/functions.aqua";

export const router = new AquaRouter([
  queryOne,
  mutationOne,
  queryTwo,
  mutationTwo,
]);
