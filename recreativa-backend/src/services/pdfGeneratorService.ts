import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { LessonPlan } from '@prisma/client';

const BRAND_COLOR = '#005A9C';
const ACCENT_COLOR = '#4A90E2';
const TEXT_COLOR = '#333333';
const FONT_NORMAL = 'Helvetica';
const FONT_BOLD = 'Helvetica-Bold';
const HEADER_FIRST_PAGE_HEIGHT = 120;
const HEADER_SUBSEQUENT_HEIGHT = 100;
const PAGE_MARGIN_X = 50;
const PAGE_MARGIN_BOTTOM = 50;

export class PDFGeneratorService {
  public generate(lessonPlan: LessonPlan): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const generatedPath = path.resolve(__dirname, '..', '..', 'uploads', 'generated');
        const filePath = path.join(generatedPath, `${lessonPlan.id}.pdf`);

        const doc = new PDFDocument({
          size: 'A4',
          margins: { 
            top: HEADER_FIRST_PAGE_HEIGHT + 30,
            bottom: PAGE_MARGIN_BOTTOM,
            left: PAGE_MARGIN_X, 
            right: PAGE_MARGIN_X 
          },
          bufferPages: true,
        });

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        //FLUXO PRINCIPAL 
        this.addMainContent(doc, lessonPlan);
        
        this.finalizePages(doc, lessonPlan);

        doc.end();

        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);
      } catch (err: any) {
        console.error("Erro fatal ao iniciar a geração do PDF:", err);
        reject(err);
      }
    });
  }

  private generateHeader(doc: PDFKit.PDFDocument, lessonPlan: LessonPlan, isFirstPage: boolean) {
    const headerImagePath = path.resolve(__dirname, '..', '..', 'assets', 'header-background.png');
    const imageExists = fs.existsSync(headerImagePath);
    const height = isFirstPage ? HEADER_FIRST_PAGE_HEIGHT : HEADER_SUBSEQUENT_HEIGHT;
    
    const textStartX = PAGE_MARGIN_X; 
    const textWidth = doc.page.width - (PAGE_MARGIN_X * 2);

    if (imageExists) {
      doc.image(headerImagePath, 0, 0, { width: doc.page.width, height });
    } else {
      doc.rect(0, 0, doc.page.width, height).fill(BRAND_COLOR);
    }
    
    doc.fillColor('black');
    if (isFirstPage) {
      doc.fillColor(BRAND_COLOR).font(FONT_BOLD).fontSize(22).text(lessonPlan.title, textStartX, 38, { width: textWidth, align: 'center' });
      
      doc.fillColor(BRAND_COLOR).font(FONT_BOLD).fontSize(11).text(`  ${lessonPlan.knowledgeArea || 'N/A'}`, textStartX, 15, { width: textWidth, align: 'center' });
      doc.fillColor(BRAND_COLOR).font(FONT_BOLD).fontSize(11).text(` Professor (a) ${lessonPlan.teacherName || 'N/A'}`, textStartX, 110, { width: textWidth, align: 'right' });
      doc.fillColor(BRAND_COLOR).font(FONT_BOLD).fontSize(11).text(` ${lessonPlan.yearGrade || 'N/A'}`, textStartX, 110, { width: textWidth, align: 'left' });
    } else {
      doc.fillColor(BRAND_COLOR).font(FONT_BOLD).fontSize(15).text(`Professor(a): ${lessonPlan.teacherName || 'N/A'}`, textStartX, 50);
      doc.fillColor(BRAND_COLOR).font(FONT_BOLD).fontSize(15).text(` ${lessonPlan.yearGrade || 'N/A'}`, textStartX, 50, { width: textWidth, align: 'right' });
      
    }
  }

  private generateFooter(doc: PDFKit.PDFDocument) {
    doc.save();
    const yPosition = doc.page.height - PAGE_MARGIN_BOTTOM + 20;
    
    doc.strokeColor(ACCENT_COLOR)
       .lineWidth(0.5)
       .moveTo(PAGE_MARGIN_X, yPosition)
       .lineTo(doc.page.width - PAGE_MARGIN_X, yPosition)
       .stroke();
    
    doc.restore();
  }
  
  private addMainContent(doc: PDFKit.PDFDocument, lessonPlan: LessonPlan) {
    doc.fillColor(TEXT_COLOR).fontSize(12).font(FONT_NORMAL);
    //doc.font(FONT_BOLD).text('Área do Conhecimento: ', { continued: true }).font(FONT_NORMAL).text(lessonPlan.knowledgeArea || 'Não especificado');
    //doc.moveDown(0.5);
    //doc.font(FONT_BOLD).text('Tempo Estimado: ', { continued: true }).font(FONT_NORMAL).text(lessonPlan.estimatedTime || 'Não especificado');
    doc.moveDown(2);

    this.addSection(doc, 'Resumo da Atividade', lessonPlan.summary);
    this.addSection(doc, 'Objetivos', lessonPlan.objectives);
    this.addSection(doc, 'Habilidades Trabalhadas', lessonPlan.skills);
    this.addSection(doc, 'Recursos Necessários', lessonPlan.resources);
    this.addSection(doc, 'Passo a Passo da Atividade', lessonPlan.stepByStep);
    
    doc.page.margins.top = HEADER_SUBSEQUENT_HEIGHT + 30;
  }

  private addSection(doc: PDFKit.PDFDocument, title: string, content: string | null | undefined) {
    if (!content) return;
    
    doc.font(FONT_BOLD).fontSize(16).fillColor(BRAND_COLOR).text(title, { paragraphGap: 5 });
    
    doc.strokeColor(ACCENT_COLOR)
       .lineWidth(1)
       .moveTo(doc.x, doc.y)
       .lineTo(doc.page.width - PAGE_MARGIN_X, doc.y)
       .stroke();
    doc.moveDown(1);

    doc.font(FONT_NORMAL).fontSize(12).fillColor(TEXT_COLOR).text(content, {
      align: 'justify',
      paragraphGap: 10
    });
    doc.moveDown(2);
  }

  private finalizePages(doc: PDFKit.PDFDocument, lessonPlan: LessonPlan) {
    const range = doc.bufferedPageRange();
    const totalPages = range.count;

    for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        const isFirstPage = i === 0;

        this.generateHeader(doc, lessonPlan, isFirstPage);

        this.generateFooter(doc);
    }
  }
}