import { createRequestHandler } from 'expo-server';

const handleRequest = createRequestHandler({
  build: './dist/server',
});

export default handleRequest;