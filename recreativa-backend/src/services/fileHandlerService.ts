import path from 'path';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export class FileHandlerService {
  public async extractText(filePath: string, mimeType: string): Promise<string> {
    const buffer = await fs.readFile(filePath);

    if (mimeType === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    }

    throw new Error('Unsupported file type for text extraction.');
  }
}