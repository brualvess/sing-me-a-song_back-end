import { prisma } from '../src/database'
import supertest from 'supertest';
import app from '../src/app'
import { recommendation } from './factories/recommendationFactory'
import {
    createRecommendation,
    create as createRecommendation2
} from './factories/createRecommendationFactory'
import { create } from 'domain';


beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "recommendations"`;
});
const server = supertest(app)

describe('Testa POST /recommendations', () => {
    it('Deve retornar 201 caso insira uma recomendação válida', async () => {
        const datas = await recommendation()
        const result = await server.post('/recommendations').send(datas);
        const addRecommendation = await prisma.recommendation.findFirst({
            where: { name: datas.name }
        });
        expect(result.status).toBe(201);
        expect(addRecommendation).not.toBeNull();

    })
    it('Deve retornar 422 caso não informe o nome', async () => {
        const result = await server.post('/recommendations').send({
            youtubeLink: "https://www.youtube.com/watch?v=KaQk6CmzRv0"
        })
        expect(result.status).toBe(422);
    })
})
describe('Testa POST /recommendations/:id/upvote', () => {
    it('Deve retornar 200 caso vote em uma música recomendada', async () => {
        const create = await createRecommendation()
        const findId = await prisma.recommendation.findFirst({
            where: { name: create.name }
        });
        const result = await server.post(`/recommendations/${findId.id}/upvote`)
        expect(result.status).toBe(200);
    })
    it('Deve retornar 404 caso vote em uma música inválida', async () => {
        const result = await server.post(`/recommendations/-1/upvote`)
        expect(result.status).toBe(404);
    })
})

describe('Testa POST /recommendations/:id/downvote', () => {
    it('Deve retornar 200 caso dê downvote na recomendação', async () => {
        const create = await createRecommendation()
        const findId = await prisma.recommendation.findFirst({
            where: { name: create.name }
        });
        const result = await server.post(`/recommendations/${findId.id}/downvote`)
        expect(result.status).toBe(200);
    })
})

describe('Testa GET /recommendations', () => {
    it('Deve retornar status 200 e as últimas 10 recomendações', async () => {
        const createRecommendation = await createRecommendation2()
        for (let i = 0; i < 10; i++) {
            createRecommendation
        }
        const result = await server.get('/recommendations')
        expect(result.status).toBe(200);
        expect(result.body).not.toBeNull();
        expect(result.body).toBeInstanceOf(Object)
    })

})

describe('Testa GET /recommendations/:id', () => {
    it('Deve retornar 200 e um array com a recomendação', async () => {
        const create = await createRecommendation()
        const findId = await prisma.recommendation.findFirst({
            where: { name: create.name }
        });
        const result = await server.get(`/recommendations/${findId.id}`)
        expect(result.status).toBe(200);
        expect(result.body).not.toBeNull();
        expect(result.body).toBeInstanceOf(Object)
    })
    it('Deve retornar 404 caso passe um id inválido', async () => {
        const result = await server.get(`/recommendations/-30`)
        expect(result.status).toBe(404);
    })
})
describe('Testa GET /recommendations/random', () => {
    it('Pega uma recomendação aleatória', async () => {
        const recommendation = await createRecommendation()
        await createRecommendation2()
        const findId = await prisma.recommendation.findFirst({
            where: { name: recommendation.name }
        });

        for (let i = 0; i < 15; i++) {
            await server.post(`/recommendations/${findId.id}/upvote`)
        }
        const result = await server.get('/recommendations/random')
        expect(result.status).toBe(200);
        expect(result.body).not.toBeNull();
    })
    it('Caso não exista música cadastrada retornar status 404', async () => {
        const result = await server.get('/recommendations/random')
        expect(result.status).toBe(404);
    })
})
describe('Testa GET /recommendations/top/:amount', () => {
    it('Deve retornar 200 e as músicas com maior número de pontos', async () => {
        const recommendation1 = await createRecommendation()
        const recommendation2 = await createRecommendation2()
        const findId1 = await prisma.recommendation.findFirst({
            where: { name: recommendation1.name }
        });
        const findId2 = await prisma.recommendation.findFirst({
            where: { name: recommendation2.name }
        });
        for (let i = 0; i < 550; i++) {
            await server.post(`/recommendations/${findId1.id}/upvote`)
        }
        for (let i = 0; i < 350; i++) {
            await server.post(`/recommendations/${findId2.id}/upvote`)
        }
        const result = await server.get('/recommendations/top/2')
        expect(result.status).toBe(200);
        expect(result.body).not.toBeNull();
    })
})