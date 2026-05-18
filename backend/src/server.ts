import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(`Gigflow API listening on port ${env.PORT}`);
});
