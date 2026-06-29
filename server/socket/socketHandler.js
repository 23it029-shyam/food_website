const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room for order tracking
    socket.on('joinOrder', (orderId) => {
      socket.join(orderId);
      console.log(`Socket ${socket.id} joined room order:${orderId}`);
    });

    // Leave room
    socket.on('leaveOrder', (orderId) => {
      socket.leave(orderId);
      console.log(`Socket ${socket.id} left room order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Emit order status update to a specific order tracking room
const emitOrderStatus = (orderId, status, message) => {
  if (io) {
    const data = {
      status,
      timestamp: new Date(),
      message
    };
    io.to(orderId).emit('orderUpdate', data);
    console.log(`Order status update sent to order:${orderId}:`, data);
  } else {
    console.warn('Socket.io is not initialized yet. Order status could not be sent.');
  }
};

module.exports = { initSocket, emitOrderStatus };
