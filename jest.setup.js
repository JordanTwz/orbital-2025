import 'cross-fetch/polyfill';  // Adds global fetch to Node environment
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();