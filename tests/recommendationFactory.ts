import { faker } from '@faker-js/faker';

export async function recommendation(){
    return{
        name: faker.lorem.word(10),
        youtubeLink: "https://www.youtube.com/watch?v=1DkDrVEK2rc"
    }
}