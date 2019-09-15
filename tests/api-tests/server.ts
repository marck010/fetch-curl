import * as express from "express";
import * as bodyParser from "body-parser";
import * as libUrl from "url";

const route = express.Router();

export class Server {
  public app = express();

  constructor() {
    this.createBodyParseMiddleware();
    this.configRoutes();
  }

  public static start() {
    const server = new Server();
    return new Promise((resolve, reject) => {
      server.app
        .listen(8000, () => {
          resolve("success");
        })
        .on("error", error => {
          resolve(error);
        });
    });
  }

  private createBodyParseMiddleware() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  private getResponse(req: express.Request) {
    return {
      headers: req.headers,
      body: req.body,
      query: req.query,
      url: req.url,
      method: req.method
    };
  }
  private configRoutes() {
    route.get("/test/get/ok", (req, res, next) => {
      try {
        res.status(200);
        res.setHeader("location", req.originalUrl);
        res.json(this.getResponse(req));
      } catch (error) {
        next(error);
      }
    });

    route.get("/test/get/redirect", (req, res, next) => {
      const maxRedirects: number = parseInt(req.query.maxRedirects) || 0;
      let countRedir: number = parseInt(req.query.countRedir) || 0;
      try {
        res.status(countRedir < maxRedirects ? 301 : 200);

        const url = libUrl.parse(req.url);
        const location = `${
          url.pathname
        }?countRedir=${++countRedir}&maxRedirects=${maxRedirects}`;

        res.setHeader("location", location);
        res.json(this.getResponse(req));
      } catch (error) {
        next(error);
      }
    });

    route.post("/test/post/ok", (req, res, next) => {
      try {
        res.status(200);
        res.json(this.getResponse(req));
      } catch (error) {
        next(error);
      }
    });

    this.app.use("/", route);
  }
}
