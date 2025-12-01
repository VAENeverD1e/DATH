import '@testing-library/jest-dom';
// Optional: MSW setup placeholder
// import { setupServer } from 'msw/node';
// const server = setupServer();
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

process.env.REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';