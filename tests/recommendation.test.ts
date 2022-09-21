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
describe('Testa POST /recommendations/:id/upvote', ()=>{
    it('Deve retornar 200 caso vote em uma música recomendada', async()=>{
        const datas = await recommendation()
         await server.post('/recommendations').send(datas);
         const findId= await prisma.recommendation.findFirst({
            where: { name: datas.name }
          });
        const result = await server.post(`/recommendations/${findId.id}/upvote`)
        expect(result.status).toBe(200);
    })
    it('Deve retornar 404 caso vote em uma música inválida', async()=>{
        const result = await server.post(`/recommendations/-1/upvote`)
        expect(result.status).toBe(404);
    })
})
