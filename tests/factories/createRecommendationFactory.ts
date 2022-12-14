import {prisma} from '../../src/database'
import { recommendation } from './recommendationFactory'
import { faker } from '@faker-js/faker';

export async function createRecommendation(){
    const recommendation = await prisma.recommendation.create({
        data:{
            name: faker.lorem.word(10),
            youtubeLink: "https://www.youtube.com/watch?v=nhZyPQzx7JI&t=284s"
        }
    })
    return recommendation
}

export async function create(){
const datas = await recommendation()
const recommendation2 = await prisma.recommendation.create({data:datas})
return recommendation2
}