export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  sso: {
    issuer: 'http://localhost:18080',
    clientId: '362708277525544962@thesis_management_system',
    scope: 'openid profile email urn:zitadel:iam:org:project:roles',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200/login',
  },
};
