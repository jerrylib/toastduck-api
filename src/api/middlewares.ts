import { defineMiddlewares } from "@medusajs/framework/http";
import multer from "multer";

// Store uploaded files in memory so the route handler can write them to /static
const upload = multer({ storage: multer.memoryStorage() });

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/static-upload",
      middlewares: [upload.array("files", 20)],
    },
  ],
});
