import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { FileHandlerService } from '../services/fileHandlerService';
import { AIStructurerService } from '../services/aiStructurerService';
import { PDFGeneratorService } from '../services/pdfGeneratorService';
import fs from 'fs/promises';

const fileHandler = new FileHandlerService();
const aiStructurer = new AIStructurerService();
const pdfGenerator = new PDFGeneratorService();

export const lessonPlanController = {
  uploadAndProcess: async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const { path: filePath, mimetype } = req.file;

    try {
      const text = await fileHandler.extractText(filePath, mimetype);
      const structuredData = await aiStructurer.structureText(text);

      const newLessonPlan = await prisma.lessonPlan.create({
        data: {
          ...structuredData,
          originalFilePath: filePath,
          originalFileMimeType: mimetype,
        },
      });

      res.status(201).json(newLessonPlan);
    } catch (error: any) {
      await fs.unlink(filePath).catch(err => console.error("Failed to delete temp file", err));
      console.error(error);
      res.status(500).json({ error: error.message || 'An internal server error occurred.' });
    }
  },
  
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const lessonPlans = await prisma.lessonPlan.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(lessonPlans);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve lesson plans.' });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const lessonPlan = await prisma.lessonPlan.findUnique({ where: { id } });
      if (!lessonPlan) {
        res.status(404).json({ error: 'Lesson plan not found.' });
        return;
      }
      res.status(200).json(lessonPlan);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve the lesson plan.' });
    }
  },

   update: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedLessonPlan = await prisma.lessonPlan.update({
        where: { id },
        data: { 
          title: data.title,
          yearGrade: data.yearGrade,
          teacherName: data.teacherName,
          knowledgeArea: data.knowledgeArea,
          summary: data.summary,
          objectives: data.objectives,
          skills: data.skills,
          estimatedTime: data.estimatedTime,
          resources: data.resources,
          stepByStep: data.stepByStep,
        }
      });
      res.status(200).json(updatedLessonPlan);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update the lesson plan.' });
    }
  },

  improveWithAI: async (req: Request, res: Response): Promise<void> => {
    try {
      const currentPlan = req.body;

      // Validação básica
      if (!currentPlan || !currentPlan.title) {
        res.status(400).json({ error: 'Invalid lesson plan data provided.' });
        return;
      }
      
      const improvedPlan = await aiStructurer.improvePlan(currentPlan);
      res.status(200).json(improvedPlan);

    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Failed to improve the lesson plan.' });
    }
  },

  deleteById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      //Encontra o plano de aula para obter os caminhos dos arquivos
      const lessonPlan = await prisma.lessonPlan.findUnique({
        where: { id },
      });

      if (!lessonPlan) {
        res.status(404).json({ error: 'Lesson plan not found.' });
        return;
      }

      await prisma.lessonPlan.delete({
        where: { id },
      });

      //Tenta apagar os arquivos
      if (lessonPlan.originalFilePath) {
        await fs.unlink(lessonPlan.originalFilePath).catch(err => 
          console.warn(`Could not delete original file: ${lessonPlan.originalFilePath}`, err.message)
        );
      }
      if (lessonPlan.generatedPdfPath) {
        await fs.unlink(lessonPlan.generatedPdfPath).catch(err => 
          console.warn(`Could not delete generated file: ${lessonPlan.generatedPdfPath}`, err.message)
        );
      }

      res.status(204).send();

    } catch (error: any) {
      console.error('Failed to delete lesson plan:', error);
      res.status(500).json({ error: 'An internal server error occurred while deleting the plan.' });
    }
  },

  generatePdf: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const lessonPlan = await prisma.lessonPlan.findUnique({ where: { id } });

      if (!lessonPlan) {
        res.status(404).json({ error: 'Lesson plan not found.' });
        return;
      }

      const pdfPath = await pdfGenerator.generate(lessonPlan);
      
      await prisma.lessonPlan.update({
        where: { id },
        data: { generatedPdfPath: pdfPath }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${id}.pdf`);
      res.sendFile(pdfPath);

    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Failed to generate PDF.' });
    }
  },

  getOriginalFile: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const lessonPlan = await prisma.lessonPlan.findUnique({ where: { id } });

      if (!lessonPlan || !lessonPlan.originalFilePath) {
        res.status(404).json({ error: 'Original file not found.' });
        return;
      }
      
      await fs.access(lessonPlan.originalFilePath);
      res.sendFile(lessonPlan.originalFilePath);
    } catch (error) {
      res.status(404).json({ error: 'File not found on server.' });
    }
  }
};