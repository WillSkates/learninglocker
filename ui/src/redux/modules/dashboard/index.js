import * as blankDashboard from './blankDashboard';
import * as curatrStarter from './curatrStarter';
import * as gettingStarted from './gettingStarted';

/*
 * Sagas
 */
/* eslint-disable import/prefer-default-export */
export const sagas = [
  ...blankDashboard.sagas,
  ...curatrStarter.sagas,
  ...gettingStarted.sagas,
];
