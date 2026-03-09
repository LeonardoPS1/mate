import { memory } from './src/agent/memory.js';
import fs from 'fs';

async function testMemory() {
  const testUserId = 99999999;
  
  memory.clearHistory(testUserId);
  
  memory.addMessage({
    userId: testUserId,
    role: 'user',
    content: 'Hola Mate, este es un mensaje de prueba.'
  });
  
  memory.addMessage({
    userId: testUserId,
    role: 'assistant',
    content: '¡Hola! Recibí tu mensaje de prueba correctamente.'
  });
  
  const history = memory.getHistory(testUserId, 10);
  
  const results = {
    historyCount: history.length,
    messages: history,
    dbExists: fs.existsSync('./memory.db'),
    dbSize: fs.existsSync('./memory.db') ? fs.statSync('./memory.db').size : 0
  };

  fs.writeFileSync('memory_test_results.json', JSON.stringify(results, null, 2));
}

testMemory().catch(e => {
  fs.writeFileSync('memory_test_results.json', JSON.stringify({ error: e.message }));
});
