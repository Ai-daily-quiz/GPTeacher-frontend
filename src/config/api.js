const isDev = import.meta.env.DEV;

export const EXPRESS_API_URL = isDev
  ? 'http://localhost:4000'
  : 'http://quiz-app-staging-env-env.eba-wjkxxmtb.ap-northeast-2.elasticbeanstalk.com';
