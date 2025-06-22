'use client';

import { useState, useEffect, useCallback } from 'react';
import { List, Typography, Spin, Card, Flex, App, Button, Modal, Tooltip } from 'antd';
import axios from 'axios';
import { UploadLessonPlan } from '@/components/UploadLessonPlan';
import Link from 'next/link';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface LessonPlan {
  id: string;
  title: string;
  knowledgeArea: string | null;
  createdAt: string;
}

export default function HomePage() {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { message, modal } = App.useApp();

  const fetchLessonPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/lesson-plans`);
      setLessonPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch lesson plans:', error);
      message.error('Falha ao carregar os planos de aula.');
    } finally {
      setIsLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchLessonPlans();
  }, [fetchLessonPlans]);

  const handleDelete = (id: string, title: string) => {
    modal.confirm({
      title: 'Confirmar Exclusão',
      content: `Tem certeza que deseja excluir permanentemente o plano de aula "${title}"? Esta ação não pode ser desfeita.`,
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/lesson-plans/${id}`);
          message.success(`O plano "${title}" foi excluído com sucesso.`);
          fetchLessonPlans();
        } catch (error) {
          console.error('Failed to delete lesson plan:', error);
          message.error('Falha ao excluir o plano de aula.');
        }
      },
    });
  };

  return (
    <Card>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <Title level={2}>Bem-vindo ao Gerenciador de Planos de Aula</Title>
        <Paragraph type="secondary" style={{ fontSize: '16px', maxWidth: '700px', margin: 'auto' }}>
          Transforme seus documentos antigos em planos de aula modernos e estruturados.
          Faça o upload de um arquivo `.pdf` ou `.docx`, deixe a IA extrair e organizar o conteúdo,
          edite como quiser e gere um novo PDF padronizado com um clique.
        </Paragraph>
      </div>

      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Meus Planos de Aula</Title>
        <UploadLessonPlan onUploadSuccess={fetchLessonPlans} />
      </Flex>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={lessonPlans}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Tooltip title="Editar e Visualizar" key="list-edit">
                  <Link href={`/lesson-plan/${item.id}`} passHref>
                    <Button type="text" icon={<EditOutlined />} />
                  </Link>
                </Tooltip>,
                <Tooltip title="Excluir" key="list-delete">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, item.title);
                    }}
                  />
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                title={<Link href={`/lesson-plan/${item.id}`}>{item.title}</Link>}
                description={`Área do Conhecimento: ${item.knowledgeArea || 'Não definida'} - Criado em: ${new Date(item.createdAt).toLocaleDateString('pt-BR')}`}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
