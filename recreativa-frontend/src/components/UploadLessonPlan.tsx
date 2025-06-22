'use client';

import { useState } from 'react';
import { Upload, Button, message, App } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface UploadLessonPlanProps {
  onUploadSuccess: () => void;
}

export function UploadLessonPlan({ onUploadSuccess }: UploadLessonPlanProps) {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const { message } = App.useApp(); 

  const handleUpload = async (options: any) => {
    const { onSuccess, onError, file } = options;
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/lesson-plans/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      onSuccess(response.data);
      message.success(`${file.name} processado com sucesso!`);
      onUploadSuccess(); 
      router.push(`/lesson-plan/${response.data.id}`);
    } catch (err) {
      onError(err);
      console.error(err);
      message.error('Falha ao processar o arquivo. Verifique o console.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Upload
      customRequest={handleUpload}
      showUploadList={false}
      accept=".pdf,.docx"
      disabled={isUploading}
    >
      <Button icon={<UploadOutlined />} type="primary" loading={isUploading}>
        {isUploading ? 'Processando...' : 'Enviar Plano de Aula (.pdf ou .docx)'}
      </Button>
    </Upload>
  );
}