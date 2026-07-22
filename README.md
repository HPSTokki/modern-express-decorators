<h1>Modern ExpressJS Decorators</h1>
<hr>

##### **Partly Vibecoded**

<p>I made this modern expressjs decorator because I just dislike a bit of messy code. This handy add-on allows me and others to just make class based controllers, and use decorators to assign paths, then register it in the express

**Back then:**

```javascript
import express from "express";

const app = express();

app.get("/", async (req, res) => {
  res.send("Hello World");
});
```

This can get messy as the codebase grows, surely you can separate it into services, controllers, models so on. But those individualities can also get messy

**With decorators**:

```javascript
"src/controller/*.ts";

import { Get } from "modern-express-decorators";

export class HealthCheckController {
  @Get("/")
  async function(req, res) {
    res.send("Hello World!");
  }
}

("src/index.ts");

import { HealthCheckController } from "src/controller/*.ts";
import { registerRouter } from "modern-express-decorators";
import express from "express";

const router = express.Router();
registerRouter(router, HealthCheckController);

app.use("/api", router);
```

## To be added features:

- ~~DTO/Validation Schema on decorators~~ ✅
- Middleware Support (though one can pass on function itself)
- Performance enhancement
- Probably automatically allowing OpenAPI documentation support(?)

#### Anyone can freely fork or remake this, I just made this purely for myself to use for some side hobbies, expect bugs
