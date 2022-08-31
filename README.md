# DevBlog
Aplicação desenvolvida com Node.js, Express e MongoDB para fins de aprendizado. Esse projeto tem o propósito de avaliar os conhecimentos adquiridos na disciplina de Bancos de Dados II, do Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas, do IFPB/campus Cajazeiras


## Inicialização
Para inicializar a API vocês deverão:
1. Clonar o repositório
2. Alterar os parametros de conexão do arquivo .env que se encontra na raiz da aplicação

Exemplo do arquivo .env (trocar os valores das chaves pelos dados dos seus bancos mongo atlas e neo4j):
```
MONGOUSER='<userDB>'
MONGOPASSWORD='<passwordDB>'

NEO4J_HOST = ''
NEO4J_PORT = ''
NEO4J_USER =  ''
NEO4J_PASSWORD = ''
```

3. Execute ```npm install -y``` na raiz da aplicação
4. Execute ```npm start``` na raiz da aplicação
5. Através de um navegador de sua preferencia, acesse ```http://localhost:8081/```
