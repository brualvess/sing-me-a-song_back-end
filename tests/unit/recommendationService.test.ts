import { jest } from '@jest/globals';
import { recommendationService } from '../../src/services/recommendationsService'
import { recommendationRepository } from '../../src/repositories/recommendationRepository'
import {notFoundError} from "../../src/utils/errorUtils";
import { recommendation } from '../factories/recommendationFactory'




beforeEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});

describe('Testes unitários recommendations service', () => {
  it('Criar uma recomendação', async () => {
    const datas = await recommendation()

    jest.spyOn(recommendationRepository, 'findByName').
      mockImplementationOnce((): any => (null))

    jest.spyOn(recommendationRepository, 'create').
      mockImplementationOnce((): any => (null))

    await recommendationService.insert(datas)

    expect(recommendationRepository.findByName).toBeCalled()
    expect(recommendationRepository.create).toBeCalled()
  })

  it('Não deve criar uma recomendação duplicada', async () => {
    const recommendation = {
      name: 'músicas aleatórias',
      youtubeLink: 'https://www.youtube.com/watch?v=OqCtxOvVLog'
    }

    jest
      .spyOn(recommendationRepository, 'findByName')
      .mockImplementationOnce((): any => {
        return {
          name: 'músicas aleatórias',
          youtubeLink: 'https://www.youtube.com/watch?v=OqCtxOvVLog'
        }
      })

    const promise = recommendationService.insert(recommendation)

    expect(promise).rejects.toEqual({
      type: "conflict",
      message: "Recommendations names must be unique"
    })

  })

  it('Votar em uma recomendação', async () => {
    const recommendation = {
      id: 1,
      name: 'galinha pintdinha',
      youtubeLink: 'https://www.youtube.com/watch?v=5P8GcCpmGYQ',
      score: 0
    }

    jest.spyOn(recommendationRepository, 'find')
      .mockImplementationOnce((): any => recommendation)

    jest.spyOn(recommendationRepository, 'updateScore')
      .mockImplementationOnce((): any => (null))


    await recommendationService.upvote(1)

    expect(recommendationRepository.find).toBeCalled()
    expect(recommendationRepository.updateScore).toHaveBeenCalledWith(recommendation.id, "increment")
  })

  it('Votar em uma recomendação inválida', async () => {
    const recommendation = {
      id: 1,
      name: 'galinha pintdinha',
      youtubeLink: 'https://www.youtube.com/watch?v=5P8GcCpmGYQ',
      score: 0
    }

    jest.spyOn(recommendationRepository, 'find')
      .mockResolvedValueOnce(null)

    jest.spyOn(recommendationRepository, 'updateScore')
      .mockImplementationOnce((): any => (null))

    await expect(
      recommendationService.upvote(recommendation.id)
    ).rejects.toEqual(notFoundError(''))

    expect(recommendationRepository.find).toHaveBeenCalledWith(
      recommendation.id)

  })

  it('Voto negativo em uma recomendação', async () => {
    const recommendation = {
      id: 1,
      name: 'galinha pintdinha',
      youtubeLink: 'https://www.youtube.com/watch?v=5P8GcCpmGYQ',
      score: 0
    }

    jest.spyOn(recommendationRepository, 'find')
      .mockImplementationOnce((): any => recommendation)

    jest.spyOn(recommendationRepository, 'updateScore')
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          name: 'galinha pintdinha',
          youtubeLink: 'https://www.youtube.com/watch?v=5P8GcCpmGYQ',
          score: -1
        }
      })


    await recommendationService.downvote(1)

    expect(recommendationRepository.find).toBeCalled()
    expect(recommendationRepository.updateScore).toHaveBeenCalledWith(recommendation.id, "decrement")
  })
  it('Remover recomendação abaixo de -5', async () => {
    const recommendation = {
      id: 6,
      name: 'rock',
      youtubeLink: 'https://www.youtube.com/watch?v=5P8GcCpmGYQ',
      score: -5
    }

    jest.spyOn(recommendationRepository, 'updateScore')
      .mockImplementationOnce((): any => {
        return {
          id: 6,
          name: 'rock',
          youtubeLink: 'https://www.youtube.com/watch?v=5P8GcCpmGYQ',
          score: -6
        }
      })
    jest.spyOn(recommendationRepository, 'find')
      .mockImplementationOnce((): any => recommendation)

    jest.spyOn(recommendationRepository, 'remove')
      .mockImplementationOnce((): any => (null))

    await recommendationService.downvote(6)

    expect(recommendationRepository.updateScore).toBeCalled()
    expect(recommendationRepository.find).toBeCalled()
    expect(recommendationRepository.remove).toBeCalled()

  })

  it('Voto negativo em recomendação inválida', async () => {
    const recommendation = {
      id: 1,
      name: 'galinha pintdinha',
      youtubeLink: 'https://www.youtube.com/watch?v=5P8GcCpmGYQ',
      score: 0
    }

    jest.spyOn(recommendationRepository, 'find')
      .mockResolvedValueOnce(null)

    jest.spyOn(recommendationRepository, 'updateScore')
      .mockImplementationOnce((): any => (null))

    await expect(
      recommendationService.downvote(recommendation.id)
    ).rejects.toEqual(notFoundError(''))

    expect(recommendationRepository.find).toHaveBeenCalledWith(
      recommendation.id)
  })

  it('Buscar todas as recomendações', async () => {
    const arrayRecommendations = []
    for (let i = 0; i < 22; i++) {
      arrayRecommendations.push(await recommendation())
    }
    jest.spyOn(recommendationRepository, 'findAll')
      .mockImplementationOnce((): any => arrayRecommendations)

    const promise = recommendationService.get()

    expect(promise).resolves.toEqual(arrayRecommendations)
    expect(recommendationRepository.findAll).toBeCalled()
  })

  it('Buscar os x mais votados', async () => {
    const recommendations = [
      {
        id: 1,
        name: 'Músicas infantis',
        youtubeLink: 'https://www.youtube.com/watch?v=n9ykiGpGgbU',
        score: 698
      },
      {
        id: 5,
        name: 'Músicas sertaneja',
        youtubeLink: 'https://www.youtube.com/watch?v=emebYetcx2M',
        score: 200
      }
    ]
    jest.spyOn(recommendationRepository, 'getAmountByScore')
      .mockImplementationOnce((): any => recommendations)

    const promise = recommendationService.getTop(2)
    expect(promise).resolves.toEqual(recommendations)
    expect(recommendationRepository.getAmountByScore).toBeCalled()
  })
  it('Get random', async () => {
    const recommendations = [
      {
        id: 1,
        name: 'Músicas infantis',
        youtubeLink: 'https://www.youtube.com/watch?v=n9ykiGpGgbU',
        score: 15
      },
      {
        id: 5,
        name: 'Músicas sertaneja',
        youtubeLink: 'https://www.youtube.com/watch?v=emebYetcx2M',
        score: 6
      }
    ]

    jest.spyOn(Math, 'random').mockImplementation(() => {
      return 1
    })

    jest.spyOn(recommendationRepository, 'findAll')
      .mockImplementationOnce((): any => recommendations)

    const promise = recommendationService.getRandom()

    expect(promise).resolves.toEqual(recommendation[0])
    expect(Math.random).toBeCalled()
    expect(recommendationRepository.findAll).toBeCalled()

  })

  it('Buscar recomendação por id', async () => {
    const recommendation = {
      id: 7,
      name: 'lofi',
      youtubeLink: 'https://www.youtube.com/watch?v=TYqd1uZyydU',
      score: 2
    }
    jest.spyOn(recommendationRepository, 'find')
      .mockImplementationOnce((): any => recommendation)

    const promise = recommendationService.getById(recommendation.id)
    expect(promise).resolves.toEqual(recommendation)
    expect(recommendationRepository.find).toBeCalled()
  })
  it('Buscar recomendação inválida', async () => {
    const recommendation = {
      id: 1,
      name: 'galinha pintdinha',
      youtubeLink: 'https://www.youtube.com/watch?v=5P8GcCpmGYQ',
      score: 0
    }

    jest.spyOn(recommendationRepository, 'find')
      .mockResolvedValueOnce(null)

    await expect(
      recommendationService.getById(recommendation.id)
    ).rejects.toEqual(notFoundError(''))

    expect(recommendationRepository.find).toHaveBeenCalledWith(
      recommendation.id)

  })

  it('Pegar filtro', async () => {
    const result = recommendationService.getScoreFilter(0.2)
    expect(result).toEqual("gt")
  })

  it('Pegar recomendação aleatória', async () => {
    jest.spyOn(recommendationRepository, 'findAll')
      .mockResolvedValue([])

    jest.spyOn(Math, 'random').mockImplementation(() => {
      return 1
    })

    await expect(
      recommendationService.getRandom()
    ).rejects.toEqual(notFoundError(''))

    expect(recommendationRepository.findAll).toBeCalled()
    expect(Math.random).toBeCalled()

  })
})












