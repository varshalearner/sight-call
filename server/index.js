const { Server } = require("socket.io");

// port on which socket server run
const io = new Server(8000, {
  cors: true,
});

const nameToSocketIdMap = new Map();
const socketidTonameMap = new Map();

//event listener
io.on("connection", (socket) => {
  console.log(`Socket connected ${socket.id}`);
  //jab frontend se ye event call hoga tb ye action hoga

  //ye entry krke jaiga name to map wali
  socket.on("room:join", (data) => {
    // console.log(data);
    // data destructure
    const { name, room } = data;
    // mapping set
    nameToSocketIdMap.set(name, socket.id);
    socketidTonameMap.set(socket.id, name);
    // jis user ne data bja usiko bjo ye
    io.to(room).emit("user:joined", { name, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });
  
  socket.on("user:call", ({ to, offer }) => {
    // Get the name of the caller (current user)
    const callerName = socketidTonameMap.get(socket.id);
    io.to(to).emit("incomming:call", { from: socket.id, offer, callerName });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    // Get the name of the caller (current user)
    const callerName = socketidTonameMap.get(socket.id);
    io.to(to).emit("call:accepted", { from: socket.id, ans, callerName });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    // Get the name of the caller (current user)
    const callerName = socketidTonameMap.get(socket.id);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer, callerName });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    // Get the name of the caller (current user) 
    
    const callerName = socketidTonameMap.get(socket.id);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans, callerName });
  });
});
