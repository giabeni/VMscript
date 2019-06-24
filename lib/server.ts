import app from "./app";
import { Tester } from '../tests/Tester';
const port = 4040;
app.listen(port, function() {
  console.log('Express server listening on port ' + port);

  console.log('Iniciando Máquina Virtual');
  
  Tester.testFile1();

  console.log('Finalizado! Veja os logs na pasta /logs \n\n');
  console.log('Pressione CTRL + C para sair');
});