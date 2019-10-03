import * as MockSocket  from 'mock-socket';
global.MockWebSocket = MockSocket.WebSocket;
global.WebSocket = MockSocket.WebSocket;
export default MockSocket.WebSocket;
