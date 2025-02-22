import { router } from "../router";

export const POST = async (req: Request) => {
  console.log("POST");
  return router.handleRequest(req);
};
export const GET = async (req: Request) => {
  console.log("GET");
  return router.handleRequest(req);
};
