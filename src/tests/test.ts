import fetch from '../index';

!(async () => {

    const res = await fetch('http://localhost:8000/test/redirect');

    // tslint:disable-next-line: no-console
    console.log(res);
    console.log(res.json());

})();