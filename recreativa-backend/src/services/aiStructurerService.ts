import axios from 'axios';

export interface IStructuredLessonPlan {
  title: string;
  yearGrade: string;
  teacherName: string;
  knowledgeArea: string;
  summary: string;
  objectives: string;
  skills: string;
  estimatedTime: string;
  resources: string;
  stepByStep: string;
}

export class AIStructurerService {
  private readonly apiKey: string;
  private readonly apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the environment variables.");
    }
  }

  // Limpar o texto para evitar problemas de formatação na API.
  private cleanText(text: string): string {
    let cleanedText = text
      .replace(/"/g, '\\"')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\s+/g, ' ');

    return cleanedText;
  }

  // Repara a sintaxe do JSON.
  private repairAndParseJson(text: string): any { 
    let jsonString = text;

    const match = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      jsonString = match[1];
    }
    
    jsonString = jsonString.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    jsonString = jsonString.replace(/'([a-zA-Z0-9_]+)':/g, '"$1":');
    jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');

    try {
      return JSON.parse(jsonString);
    } catch (error: any) {
      console.error("Falha ao fazer o parse do JSON mesmo após a tentativa de reparo. Resposta da IA:", text);
      throw new Error(`Invalid JSON response from AI: ${error.message}`);
    }
  }

  /**
   * *** NOVA FUNÇÃO DE NORMALIZAÇÃO ***
   * Garante que todos os campos do plano de aula sejam strings,
   * convertendo arrays ou objetos para um formato de string legível.
   */
  private normalizePlanFields(data: any): IStructuredLessonPlan {
    const normalizedData: IStructuredLessonPlan = {} as IStructuredLessonPlan;
    const fields: (keyof IStructuredLessonPlan)[] = [
      'title', 'yearGrade', 'teacherName', 'knowledgeArea', 'summary', 
      'objectives', 'skills', 'estimatedTime', 'resources', 'stepByStep'
    ];

    for (const field of fields) {
      const value = data[field];
      if (typeof value === 'string') {
        normalizedData[field] = value;
      } else if (Array.isArray(value)) {
        normalizedData[field] = value
          .map(item => {
            if (typeof item === 'object' && item !== null) {
              return item.description || item.text || item.item || JSON.stringify(item);
            }
            return String(item);
          })
          .join('\n');
      } else if (typeof value === 'object' && value !== null) {
        // Se for um objeto, converte para uma string JSON formatada
        normalizedData[field] = JSON.stringify(value, null, 2);
      } else {
        normalizedData[field] = value ? String(value) : '';
      }
    }
    return normalizedData;
  }

  public async structureText(text: string): Promise<IStructuredLessonPlan> {
    const cleanedText = this.cleanText(text);

    const prompt = `
      Você é um assistente especialista em pedagogia. Sua tarefa é analisar o texto de um plano de aula e estruturá-lo em um formato JSON.
      Extraia as seguintes informações do texto abaixo. Seja o mais detalhado possível e mantenha o conteúdo idêntico ao original.

      - title: O Título da Atividade.
      - yearGrade: O ano ou série para o qual o plano se destina (ex: "3º ano do Ensino Médio").
      - teacherName: O nome do professor(a) que criou o plano, se houver.
      - knowledgeArea: A(s) área(s) do conhecimento envolvida(s) (ex: "Matemática e suas Tecnologias", "Artes"). Quando o termo "SEQUÊNCIA DIDÁTICA" estiver presente, ele deve ser interpretado como parte da descrição da área de conhecimento, e não como parte do título. Nesse caso, registre primeiramente a(s) área(s) de conhecimento e, ao final, acrescente o sufixo: "- SEQUÊNCIA DIDÁTICA".
      - summary: Um resumo ou descrição geral da atividade em um parágrafo.
      - objectives: Os objetivos de aprendizagem. Junte todos em um único parágrafo ou lista com quebras de linha (\\n).
      - skills: As habilidades (ex: da BNCC) trabalhadas. Liste as habilidades, separando-as com quebras de linha (\\n).
      - estimatedTime: O tempo total estimado para a atividade (ex: "50 minutos", "2 aulas de 45 min").
      - resources: Os recursos e materiais necessários. Liste os itens, separando-os com quebras de linha (\\n).
      - stepByStep: O passo a passo detalhado da atividade. Descreva cada etapa de forma clara e estruturada, como um texto longo, usando quebras de linha (\\n) para separar os passos. Se houver critérios de avaliação por passo, inclua-os na descrição do passo.
      
      O texto do plano de aula é:
      ---
      ${cleanedText}
      ---

      Retorne APENAS o objeto JSON com as chaves exatas: "title", "yearGrade", "teacherName", "knowledgeArea", "summary", "objectives", "skills", "estimatedTime", "resources", "stepByStep".
      Se alguma informação não for encontrada, retorne uma string vazia para o campo correspondente.
    `;

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const responseText = response.data.candidates[0].content.parts[0].text;
      const rawStructuredData = this.repairAndParseJson(responseText);
      const normalizedData = this.normalizePlanFields(rawStructuredData);

      return normalizedData;

    } catch (error: any) {
      if (error.response) {
        console.error("Gemini API Error Response:", JSON.stringify(error.response.data, null, 2));
      } else {
        console.error("Error message:", error.message);
      }
      console.error("Error calling Gemini API:", error.message);
      throw new Error("Failed to get a structured response from the AI.");
    }
  }
  
  public async improvePlan(currentPlan: IStructuredLessonPlan): Promise<IStructuredLessonPlan> {
    const currentPlanJson = JSON.stringify(currentPlan, null, 2);

    const prompt = `
      Você é um especialista em design instrucional e pedagogia criativa.
      Sua tarefa é pegar o plano de aula em formato JSON a seguir e aprimorá-lo significativamente.
      Seja criativo, detalhado e focado em engajamento.

      Instruções para aprimoramento:
      1.  **Objetivos**: Refine os objetivos para que sejam mais claros, mensuráveis e alinhados com taxonomias de aprendizagem. Se possível, retorne como uma lista de strings.
      2.  **Habilidades**: Sugira habilidades socioemocionais ou do século 21 que possam ser trabalhadas. Se possível, retorne como uma lista de strings.
      3.  **Passo a Passo (stepByStep)**: Elabore as etapas. Adicione detalhes, sugira perguntas para instigar os alunos, e inclua dicas de gerenciamento de tempo.
      4.  **Recursos**: Sugira recursos digitais ou alternativos que possam enriquecer a aula (vídeos, apps, etc.). Se possível, retorne como uma lista de strings.
      5.  **Consistência**: Mantenha o tema e o conteúdo central do plano original, mas enriqueça-o.

      Aqui está o plano de aula atual:
      \`\`\`json
      ${currentPlanJson}
      \`\`\`

      Retorne APENAS o objeto JSON aprimorado, mantendo exatamente a mesma estrutura e as mesmas chaves do objeto original. Não adicione nenhuma explicação ou texto antes ou depois do JSON.
    `;

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const responseText = response.data.candidates[0].content.parts[0].text;
      
      const rawImprovedData = this.repairAndParseJson(responseText);
      const normalizedImprovedData = this.normalizePlanFields(rawImprovedData);

      return normalizedImprovedData;

    } catch (error: any) {
      console.error("Error calling Gemini API for improvement:", error.response?.data || error.message);
      throw new Error("Failed to get an improved response from the AI.");
    }
  }
}