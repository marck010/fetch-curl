import * as express from "express";
import * as bodyParser from "body-parser";
import * as libUrl from "url";
import * as spdy from "spdy";
import * as fs from "fs";

const route = express.Router();

export class Server {
  public express = express();

  constructor() {
    this.createBodyParseMiddleware();
    this.configRoutes();
  }

  public static http1() {
    const server = new Server();
    return new Promise((resolve, reject) => {
      server.express
        .listen(process.env.SERVER_PORT, () => {
          resolve("success");
        })
        .on("error", error => {
          resolve(error);
        });
    });
  }

  public static http2() {
    const port = parseInt(process.env.SERVER_PORT) + 1;
    const server = new Server();
    const options = {
      key: fs.readFileSync(__dirname + "/ssl/localhost/privkey.pem"),
      cert: fs.readFileSync(__dirname + "/ssl/localhost/fullchain.pem")
    };

    return new Promise((resolve, reject) => {

      spdy.createServer(options, server.express)
        .listen(port, error => {
          if (error) {
            reject(error);
          } else {
            resolve("success");
          }
        });
    });

  }

  private createBodyParseMiddleware() {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
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

    this.express.use("/", route);
  }
}
