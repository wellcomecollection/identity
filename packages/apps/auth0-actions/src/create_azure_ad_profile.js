async function createAzureAdProfile(accessToken, context, callback) {
  const axios = require('axios');

  try {
    fetchUserProfile(accessToken).then((userProfile) => {
      callback(null, {
        user_id: userProfile.id,
        email: userProfile.mail,
        name: userProfile.givenName + ' ' + userProfile.surname,
        given_name: userProfile.givenName,
        family_name: userProfile.surname,
      });
    });
  } catch (error) {
    callback(error);
  }

  async function fetchUserProfile(accessToken) {
    // Auth0's OAuth 2.0 integration scripts don't seem to support environment variables, so we have to hard code
    // API hostname.
    return axios
      .get(
        'https://graph.microsoft.com/v1.0/me?$select=id,givenName,surname,mail',
        {
          headers: {
            Authorization: 'Bearer ' + accessToken,
          },
          validateStatus: (status) => status === 200,
        }
      )
      .then((response) => response.data);
  }
}
