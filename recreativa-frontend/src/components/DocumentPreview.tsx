'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { renderAsync } from 'docx-preview';
import { Spin, Alert, Typography } from 'antd';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const { Title, Text } = Typography;

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

interface DocumentPreviewProps {
  lessonPlanId: string;
  mimeType?: string;
}

export function DocumentPreview({ lessonPlanId, mimeType }: DocumentPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);

  const docxContainerRef = useRef<HTMLDivElement>(null); 
  const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/lesson-plans/${lessonPlanId}/original-file`;

  useEffect(() => {
    if (!lessonPlanId || !mimeType) {
      setIsLoading(false);
      return;
    }
    
    // Só busca o blob se for um .docx
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setIsLoading(true);
      setError(null);
      axios.get(fileUrl, { responseType: 'blob' })
        .then(response => {
          setFileBlob(response.data);
        })
        .catch(err => {
          console.error("Erro ao buscar o blob do .docx:", err);
          setError("Não foi possível carregar o arquivo para preview.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
        setIsLoading(false);
    }
  }, [lessonPlanId, mimeType, fileUrl]);


  useEffect(() => {
    if (fileBlob && mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && docxContainerRef.current) {
      // Limpa o container antes de renderizar para evitar duplicatas
      docxContainerRef.current.innerHTML = ''; 

      renderAsync(fileBlob, docxContainerRef.current)
        .catch(err => {
          console.error("Erro ao renderizar o .docx:", err);
          setError("Falha ao exibir o preview do documento Word.");
        });
    }
  }, [fileBlob, mimeType]); 


  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ padding: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Spin size="large" />
          <Text style={{ marginTop: 16 }}>Carregando Preview...</Text>
        </div>
      );
    }

    if (error) {
      return <Alert message="Erro" description={error} type="error" showIcon />;
    }

    if (mimeType === 'application/pdf') {
      return (
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={null} // O loading principal já cuida disso
          error={<Alert message="Erro" description="Não foi possível carregar o preview do PDF." type="error" showIcon />}
        >
          {Array.from(new Array(numPages || 0), (el, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} renderTextLayer={false} />
          ))}
        </Document>
      );
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return <div ref={docxContainerRef} className="docx-preview-container" />;
    }

    return <Alert message="Preview não disponível" description={`O tipo de arquivo (${mimeType}) não é suportado.`} type="warning" showIcon />;
  };

  return (
    <div>
      <Title level={4}>Preview do Documento Original</Title>
      <div style={{ border: '1px solid #d9d9d9', height: '70vh', overflowY: 'auto', padding: '10px', background: '#fff' }}>
        {renderContent()}
      </div>
    </div>
  );
}