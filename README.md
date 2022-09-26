# Sing-me-a-song
Este projeto é a implementação de testes unitários e de integração de uma aplicação de recomendação anônimas de músicas. Quanto mais as pessoas curtirem uma recomendação, maior a chance dela ser recomendada para outras pessoas.

## Testes
### Unitário
Tem como objetivo testar a menor parte de um sistema, em geral, um método. É independente de outros testes, valida somente uma funcionalidade e não deve ter dependência externas (internet, banco de dados, variáveis de ambiente entre outros). Foi testada a camada service com 100% de coverage, para rodar os testes abra o terminal na pasta do projeto e digite os seguintes comando 

```
$ npm install 
$ npm run test:unit
```
### Integração
Tendo todos os módulos previamente testados de maneira unitária, é hora de testar como eles se integram, no teste de integração é onde garantimos que todos módulos que funcionam nos testes unitários, quando combinados, seguem o fluxo de dados esperado, exemplo:

## Criação de uma recomendação

Neste teste é esperado que ao enviar os dados corretos seja criada uma recomendação, retornando status 201

``` json
 it('Deve retornar 201 caso insira uma recomendação válida', async () => {
        const datas = await recommendation()
        const result = await server.post('/recommendations').send(datas);
        const addRecommendation = await prisma.recommendation.findFirst({
            where: { name: datas.name }
        });
        expect(result.status).toBe(201);
        expect(addRecommendation).not.toBeNull();

    })
    
```

Também serão testados alguns casos de erros como por exemplo quando tenta criar uma recomendação sem enviar o nome

``` json
it('Deve retornar 422 caso não informe o nome', async () => {
        const result = await server.post('/recommendations').send({
            youtubeLink: "https://www.youtube.com/watch?v=KaQk6CmzRv0"
        })
        expect(result.status).toBe(422);
    })

```

Para rodar os testes abra o terminal e digite os comandos a seguir:

``` json
$ npm install
$ npm run test:integration
```