import axios, {AxiosInstance} from "axios";

export default class Auth0Client {

  private static readonly USER_ID_PREFIX: string = "auth0|p";

  private readonly apiRoot: string;
  private readonly apiAudience: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(apiRoot: string, clientId: string, apiAudience: string, clientSecret: string) {
    this.apiRoot = apiRoot;
    this.apiAudience = apiAudience;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async validateAccessToken(accessToken: string): Promise<Auth0Profile> {
    const instance = this.getInstanceOnBehalfOf(accessToken);
    return instance.get('/userinfo', {
      validateStatus: status => status === 200
    }).then(response => {
      return {
        userId: this.extractPatronId(response.data.sub),
        email: response.data.email
      }
    });
  }

  private getInstanceOnBehalfOf(accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: this.apiRoot,
      headers: {
        Authorization: 'Bearer ' + accessToken
      },
    });
  }

  private extractPatronId(sub: string): string {
    return sub.slice(sub.indexOf(Auth0Client.USER_ID_PREFIX) + Auth0Client.USER_ID_PREFIX.length);
  }
}

interface Auth0Profile {
  userId: string;
  email: string;
}
