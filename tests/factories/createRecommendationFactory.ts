import {prisma} from '../../src/database'

export async function createRecommendation(){
    const recommendation = await prisma.recommendation.create({
        data:{
            name: "música para meditar",
            youtubeLink: "https://www.youtube.com/watch?v=nhZyPQzx7JI&t=284s"
        }
    })
    return recommendation
}