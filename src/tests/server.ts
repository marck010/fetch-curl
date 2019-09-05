import * as express from 'express';
import * as bodyParser from 'body-parser';

const route = express.Router();

class App {

    public app = express();

    constructor() {
        this.createBodyParseMiddleware();
        this.configRoutes();
    }

    private createBodyParseMiddleware() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    private configRoutes() {

        route.get('/test/redirect', (req, res, next) => {

            const filter = req;
            try {

                res.status(201);
                res.setHeader('location', req.originalUrl);
                res.json({
                    headers: filter.headers,
                    body: filter.body,
                    query: filter.query,
                    url: filter.url
                });

            } catch (error) {
                next(error);
            }
        });
        this.app.use('/', route);
    }

}

const app = new App().app;

app.listen(8000, () => {

    // tslint:disable-next-line: no-console
    console.log('App listening on port 8000!');

});
