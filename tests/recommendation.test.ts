import {prisma} from '../src/database'
import supertest from 'supertest';
import app from '../src/app'
import {recommendation} from './recommendationFactory'

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "recommendations"`;
});
const server = supertest(app)

describe('Testa POST /recommendations', ()=>{
    it('Deve retornar 201 caso insira uma recomendação válida', async()=>{
        const datas = await recommendation()
        const result = await server.post('/recommendations').send(datas);
        const addRecommendation = await prisma.recommendation.findFirst({
            where: { name: datas.name }
          });
          expect(result.status).toBe(201);
          expect(addRecommendation).not.toBeNull();

    })
    it('Deve retornar 422 caso não informe o nome', async()=>{
        const result = await server.post('/recommendations').send({
            youtubeLink: "https://www.youtube.com/watch?v=KaQk6CmzRv0"
        })
        expect(result.status).toBe(422);
    })
})
