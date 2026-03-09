export const environment = {
  production: true,
  apiUrl: '/api',
  sso: {
    issuer: 'https://sso.openpka.site',
    clientId: '362708277525544962@thesis_management_system',
    scope: 'openid profile email offline_access urn:zitadel:iam:org:project:roles',
    redirectUri: 'https://thesis.openpka.site',
    postLogoutRedirectUri: 'https://thesis.openpka.site/login',
  },
};
