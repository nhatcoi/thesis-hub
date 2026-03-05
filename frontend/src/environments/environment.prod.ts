export const environment = {
  production: true,
  apiUrl: '/api',
  sso: {
    issuer: 'https://sso.phenikaa.edu.vn',
    clientId: '<PROD_SPA_CLIENT_ID>@thesis-management',
    scope: 'openid profile email urn:zitadel:iam:org:project:roles',
    redirectUri: 'https://thesis.phenikaa.edu.vn',
    postLogoutRedirectUri: 'https://thesis.phenikaa.edu.vn/login',
  },
};
