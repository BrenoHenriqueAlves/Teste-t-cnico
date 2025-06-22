import request from 'supertest';
import { app } from '../src/server';
import { prisma } from '../src/lib/prisma';
import path from 'path';
import axios from 'axios';
import { FileHandlerService } from '../src/services/fileHandlerService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../src/services/fileHandlerService');

describe('Lesson Plan API Endpoints', () => {

  beforeEach(async () => {
    await prisma.lessonPlan.deleteMany({});
    

    mockedAxios.post.mockResolvedValue({
      data: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                title: "Plano de Aula via Teste",
                yearGrade: "1º Ano",
                teacherName: "Prof. Teste",
                knowledgeArea: "Testes Automatizados",
                summary: "Um resumo gerado pelo teste.",
                objectives: "Garantir que a API crie registros corretamente.",
                // --- Campos não obrigatórios: ---
                skills: "Mocking, Integração Contínua",
                estimatedTime: "5 minutos",
                resources: "Jest, Supertest, Prisma",
                stepByStep: "1. Escrever o teste. 2. Rodar. 3. Ver passar."
              }),
            }],
          },
        }],
      },
    });

    (FileHandlerService.prototype.extractText as jest.Mock).mockResolvedValue('Este é o texto extraído do falso PDF.');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  const testFilePath = path.resolve(__dirname, 'test-file.pdf');
  beforeAll(() => {
    const fs = require('fs');
    if (!fs.existsSync(testFilePath)) {
      fs.writeFileSync(testFilePath, '');
    }
  });

  it('POST /api/lesson-plans/upload -> should create a lesson plan', async () => {
    const response = await request(app)
      .post('/api/lesson-plans/upload')
      .attach('file', testFilePath);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Plano de Aula via Teste');
    expect(response.body).toHaveProperty('objectives'); // Verifica se o campo existe

    const planInDb = await prisma.lessonPlan.findUnique({ where: { id: response.body.id } });
    expect(planInDb).not.toBeNull();
  });

  it('GET /api/lesson-plans -> should return a list of lesson plans', async () => {
    await request(app).post('/api/lesson-plans/upload').attach('file', testFilePath);
    const response = await request(app).get('/api/lesson-plans');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });

  it('PUT /api/lesson-plans/:id -> should update an existing lesson plan', async () => {
    const createResponse = await request(app).post('/api/lesson-plans/upload').attach('file', testFilePath);
    const planId = createResponse.body.id;
    const updatedData = { title: "Plano de Aula Atualizado", summary: "Resumo atualizado." };

    const response = await request(app)
      .put(`/api/lesson-plans/${planId}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe(updatedData.title);
  });
  
  it('DELETE /api/lesson-plans/:id -> should delete a lesson plan', async () => {
    const createResponse = await request(app).post('/api/lesson-plans/upload').attach('file', testFilePath);
    const planId = createResponse.body.id;

    const response = await request(app).delete(`/api/lesson-plans/${planId}`);

    expect(response.status).toBe(204);
    const planInDb = await prisma.lessonPlan.findUnique({ where: { id: planId } });
    expect(planInDb).toBeNull();
  });
});