import axios, {AxiosInstance} from 'axios';
import moxios from 'moxios';

describe('auth0 client', () => {
    beforeEach(function () {
        // import and pass your custom axios instance to this method
        // @ts-ignore
        moxios.install(axios as AxiosInstance); // @fixme: might be better to do dependency injection.
        moxios.stubRequest('/userinfo', {
            response: {
                your: true,
                json: true,
                fields: true,
            }
        });
    });

    afterEach(function () {
        // import and pass your custom axios instance to this method
        // @ts-ignore
        moxios.uninstall(axios as AxiosInstance);
    });

    it('gets stubbed content', async () => {
        let response = await axios.get('/userinfo');

        expect(response.data['your']).toBe(true);
        expect(response.data['json']).toBe(true);
        expect(response.data['fields']).toBe(true);
    });

});
