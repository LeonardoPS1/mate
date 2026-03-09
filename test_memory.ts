import { memory } from './src/agent/memory.js';
import fs from 'fs';

async function testMemory() {
  console.log("--- TEST DE MEMORIA MATE ---");
  
  const testUserId = 99999999;
  
  console.log("1. Limpiando historial previo para el usuario de prueba...");
  memory.clearHistory(testUserId);
  
  console.log("2. Agregando mensaje de usuario...");
  memory.addMessage({
    userId: testUserId,
    role: 'user',
    content: 'Hola Mate, este es un mensaje de prueba.'
  });
  
  console.log("3. Agregando respuesta del asistente...");
  memory.addMessage({
    userId: testUserId,
    role: 'assistant',
    content: '¡Hola! Recibí tu mensaje de prueba correctamente.'
  });
  
  console.log("4. Agregando llamado a herramienta simulado...");
  memory.addMessage({
    userId: testUserId,
    role: 'assistant',
    content: null,
    toolCalls: JSON.stringify([{ id: 'call_123', type: 'function', function: { name: 'get_current_time', arguments: '{}' } }])
  });

  console.log("5. Agregando respuesta de la herramienta...");
  memory.addMessage({
    userId: testUserId,
    role: 'tool',
    content: JSON.stringify({ time: new Date().toISOString() }),
    toolCallId: 'call_123'
  });

  console.log("\n--- HISTORIAL RECUPERADO DE SQLITE ---");
  const history = memory.getHistory(testUserId, 10);
  
  history.forEach(msg => {
    console.log(`[\${msg.role.toUpperCase()}] \${msg.createdAt}:`);
    if (msg.content) console.log(`  Content: \${msg.content}`);
    if (msg.toolCalls) console.log(`  Tool Calls: \${msg.toolCalls}`);
    if (msg.toolCallId) console.log(`  Tool ID: \${msg.toolCallId}`);
  });

  if (history.length === 4) {
    console.log("\n✅ RESULTADO: La memoria SQLITE persistente está FUNCIONANDO CORRECTAMENTE.");
  } else {
    console.error(`\n❌ ERROR: Se esperaban 4 mensajes, pero se encontraron \${history.length}`);
  }

  // Verificar archivo físico
  if (fs.existsSync('./memory.db')) {
    const stats = fs.statSync('./memory.db');
    console.log(`\n✅ Archivo físico ./memory.db creado correctamente. Tamaño: \${stats.size} bytes`);
  }
}

testMemory().catch(console.error);
