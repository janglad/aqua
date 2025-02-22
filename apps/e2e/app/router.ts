import { AquaRouter } from "aqua/router";
import { queryOne, mutationOne } from "./tests/one/functions.aqua";

export const router = new AquaRouter([queryOne, mutationOne]);
