'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Button, Spin, Alert, Card, Row, Col, Typography, Flex, App } from 'antd';
import { FilePdfOutlined, ArrowLeftOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { DocumentPreview } from '@/components/DocumentPreview';
import { LessonPlanForm, FormHandle } from '@/components/LessonPlanForm';

const { Title } = Typography;

interface LessonPlanData {
  id: string;
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
  originalFileMimeType?: string;
}

export default function LessonPlanPage() {
  const formRef = useRef<FormHandle>(null);
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();

  const [lessonPlan, setLessonPlan] = useState<LessonPlanData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const fetchLessonPlan = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/lesson-plans/${id}`);
          setLessonPlan(response.data);
        } catch (err) {
          setError('Plano de aula não encontrado ou falha ao carregar.');
          console.error(err);
        }
      };
      fetchLessonPlan();
    }
  }, [id]);

  const performUpdate = async (values: Omit<LessonPlanData, 'id' | 'originalFileMimeType'>): Promise<boolean> => {
    setIsSaving(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/lesson-plans/${id}`, values);
      message.success('Plano de aula atualizado com sucesso!');
      return true;
    } catch (err) {
      message.error('Falha ao atualizar o plano de aula.');
      console.error(err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = async (values: Omit<LessonPlanData, 'id' | 'originalFileMimeType'>) => {
    await performUpdate(values);
  };

  const handleImproveWithAI = async () => {
    if (!formRef.current) return;

    try {
      await formRef.current.validateFields();
      setIsImproving(true);
      const currentValues = formRef.current.getFieldsValue();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/lesson-plans/${id}/improve`,
        currentValues
      );
      formRef.current.setFieldsValue(response.data);
      message.success('Plano de aula aprimorado com a ajuda da IA!');

    } catch (errorInfo: any) {
      if (errorInfo.errorFields) {
        message.error('Por favor, preencha todos os campos obrigatórios antes de aprimorar com a IA.');
      } else {
        message.error('Falha ao aprimorar o plano de aula com a IA.');
        console.error(errorInfo);
      }
    } finally {
      setIsImproving(false);
    }
  };
  const handleGeneratePdf = async () => {
    if (!formRef.current) {
      message.error('Formulário não está pronto.');
      return;
    }
    setIsGeneratingPdf(true);

    const currentValues = formRef.current.getFieldsValue();
    const wasSaveSuccessful = await performUpdate(currentValues);

    if (!wasSaveSuccessful) {
      setIsGeneratingPdf(false);
      message.warning('O PDF não pôde ser gerado porque as alterações não foram salvas.');
      return;
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/lesson-plans/${id}/generate-pdf`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `plano_de_aula_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('PDF gerado e download iniciado!');
    } catch (err) {
      message.error('Falha ao gerar o PDF.');
      console.error(err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  if (error) {
    return <Alert message="Erro" description={error} type="error" showIcon />;
  }

  return (
    <>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => router.push('/')} 
        style={{ marginBottom: 16 }}
      >
        Voltar para a lista
      </Button>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card>
            {!lessonPlan ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                <Flex justify="space-between" align="center">
                  <Title level={3} style={{margin: 0}}>Editar Plano de Aula</Title>
                  <Button
                    type="primary"
                    icon={<FilePdfOutlined />}
                    loading={isGeneratingPdf}
                    onClick={handleGeneratePdf}
                  >
                    {isGeneratingPdf ? 'Salvando e Gerando...' : 'Gerar PDF Padronizado'}
                  </Button>
                </Flex>
                
                <Button
                  type="dashed"
                  icon={<ThunderboltOutlined />}
                  loading={isImproving}
                  onClick={handleImproveWithAI}
                  style={{ width: '100%', margin: '16px 0' }}
                >
                  {isImproving ? 'Aprimorando com a IA...' : 'Melhorar Plano de Aula com IA'}
                </Button>
                
                <LessonPlanForm
                  ref={formRef}
                  initialData={lessonPlan}
                  onFinish={handleFormSubmit}
                  isSaving={isSaving}
                />
              </>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
            {lessonPlan && (
              <DocumentPreview 
                lessonPlanId={lessonPlan.id} 
                mimeType={lessonPlan.originalFileMimeType} 
              />
            )}
        </Col>
      </Row>
    </>
  );
}