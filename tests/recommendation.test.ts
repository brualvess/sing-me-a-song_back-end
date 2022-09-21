import {prisma} from '../src/database'
import supertest from 'supertest';
import app from '../src/app'
import {recommendation} from './factories/recommendationFactory'
import {createRecommendation} from './factories/createRecommendationFactory' 

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
         const create = await createRecommendation()
         const findId= await prisma.recommendation.findFirst({
            where: { name: create.name }
          });
        const result = await server.post(`/recommendations/${findId.id}/upvote`)
        expect(result.status).toBe(200);
    })
    it('Deve retornar 404 caso vote em uma música inválida', async()=>{
        const result = await server.post(`/recommendations/-1/upvote`)
        expect(result.status).toBe(404);
    })
})

describe('Testa POST /recommendations/:id/downvote', ()=>{
    it('Deve retornar 200 caso dê downvote na recomendação', async()=>{
      const create = await createRecommendation()
      const findId= await prisma.recommendation.findFirst({
        where: { name: create.name }
      });
      const result = await server.post(`/recommendations/${findId.id}/downvote`)
        expect(result.status).toBe(200);
    })
})



describe('Testa GET /recommendations/:id', ()=>{
    it('Deve retornar 200 e uma array com a recomendação', async()=>{
        const create = await createRecommendation()
        const findId= await prisma.recommendation.findFirst({
          where: { name: create.name }
        });
        const result = await server.get(`/recommendations/${findId.id}`)
        expect(result.status).toBe(200);
        expect(result.body).not.toBeNull();
        expect(result.body).toBeInstanceOf(Object)
    })
    it('Deve retornar 404 caso passe um id passe um id inválido', async()=>{
        const result = await server.post(`/recommendations/-30`)
        expect(result.status).toBe(404);
    })
})
