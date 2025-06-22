
import { AIStructurerService } from '../src/services/aiStructurerService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AIStructurerService', () => {
    it('should construct without error if GEMINI_API_KEY is set', () => {
    // garantir que a variável de ambiente foi carregada
    expect(() => new AIStructurerService()).not.toThrow();
  });

  it('should call Gemini API and parse the response', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        candidates: [{
          content: { parts: [{ text: JSON.stringify({ title: 'Improved Plan' }) }] },
        }],
      },
    });
    
    const aiService = new AIStructurerService();
    const result = await aiService.improvePlan({} as any);
    expect(result.title).toBe('Improved Plan');
  });
  it('should call Gemini API with a correct prompt and parse the JSON response', async () => {

    const fakeApiResponse = {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                title: 'Plano de Aula Aprimorado',
                summary: 'Um resumo detalhado.',
              }),
            }],
          },
        }],
      },
    };
    mockedAxios.post.mockResolvedValue(fakeApiResponse);
    
    const aiService = new AIStructurerService();
    const currentPlan = { title: 'Plano Simples', summary: 'Resumo inicial' } as any;

    const result = await aiService.improvePlan(currentPlan);

    expect(mockedAxios.post).toHaveBeenCalled(); // Verifica se o post foi chamado
    expect(result).toHaveProperty('title', 'Plano de Aula Aprimorado');
    expect(result).toHaveProperty('summary', 'Um resumo detalhado.');
  });

  it('should throw an error if the Gemini API call fails', async () => {
    // Simula falha na API
    mockedAxios.post.mockRejectedValue(new Error('API is down'));
    
    const aiService = new AIStructurerService();
    const currentPlan = { title: 'Plano Simples' } as any;

    // Espera uma exceção
    await expect(aiService.improvePlan(currentPlan)).rejects.toThrow('Failed to get an improved response from the AI.');
  });
});