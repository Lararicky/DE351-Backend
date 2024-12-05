const setupSocket = (server) => {
    const io = require('socket.io')(server, {
      cors: {
        origin: '*', // หรือ URL ของ Frontend
        methods: ['GET', 'POST']
      }
    });
  
    io.on('connection', (socket) => {
      console.log('User connected');
  
      // เมื่อผู้ใช้ส่งคอลแลปใหม่
      socket.on('sendCollab', (data) => {
        console.log('Collaboration received:', data);
  
        // ส่งข้อมูลคอลแลปให้ผู้ใช้คนอื่น
        io.emit('newCollab', data);
      });
  
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  
    return io;
  };
  
  module.exports = setupSocket;
  