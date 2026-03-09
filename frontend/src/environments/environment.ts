export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  sso: {
    issuer: 'https://sso.openpka.site',
    clientId: '362708277525544962@thesis_management_system',
    scope: 'openid profile email offline_access urn:zitadel:iam:org:project:roles',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200/login',
  },
};
