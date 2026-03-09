import { memory } from './src/agent/memory.js';

async function testFirebaseMemory() {
  console.log("--- TEST DE MEMORIA FIREBASE ---");
  
  const testUserId = 88888888;
  
  console.log("1. Limpiando historial previo en Firestore...");
  await memory.clearHistory(testUserId);
  
  console.log("2. Agregando mensaje de usuario...");
  await memory.addMessage({
    userId: testUserId,
    role: 'user',
    content: 'Hola Firebase, este es un mensaje de prueba en la nube.'
  });
  
  console.log("3. Agregando respuesta del asistente...");
  await memory.addMessage({
    userId: testUserId,
    role: 'assistant',
    content: '¡Hola! Recibí tu mensaje en Firestore correctamente.'
  });
  
  console.log("\n--- HISTORIAL RECUPERADO DE CLOUD FIRESTORE ---");
  const history = await memory.getHistory(testUserId, 10);
  
  history.forEach(msg => {
    console.log(`[\${msg.role.toUpperCase()}] \${msg.createdAt ? 'Timestamp' : 'Now'}:`);
    if (msg.content) console.log(`  Content: \${msg.content}`);
    if (msg.toolCalls) console.log(`  Tool Calls: \${msg.toolCalls}`);
    if (msg.toolCallId) console.log(`  Tool ID: \${msg.toolCallId}`);
  });

  if (history.length === 2) {
    console.log("\n✅ RESULTADO: La memoria de Firebase Firestore está FUNCIONANDO CORRECTAMENTE.");
  } else {
    console.error(`\n❌ ERROR: Se esperaban 2 mensajes, pero se encontraron \${history.length}`);
  }
}

testFirebaseMemory().then(() => {
  console.log("Test completely finished.");
  process.exit(0);
}).catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
