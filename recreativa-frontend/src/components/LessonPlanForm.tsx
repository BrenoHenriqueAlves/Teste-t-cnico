'use client';

import React, { useImperativeHandle } from 'react';
import { Form, Input, Button, Row, Col, FormInstance } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { TextArea } = Input;

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
}

interface LessonPlanFormProps {
  initialData: LessonPlanData;
  onFinish: (values: Omit<LessonPlanData, 'id'>) => Promise<any>;
  isSaving: boolean;
}

export interface FormHandle {
  getFieldsValue: () => any;
  setFieldsValue: (values: any) => void;
  validateFields: () => Promise<any>;
}

export const LessonPlanForm = React.forwardRef<FormHandle, LessonPlanFormProps>(
  ({ initialData, onFinish, isSaving }, ref) => {
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
      getFieldsValue() {
        return form.getFieldsValue();
      },
      setFieldsValue(values) {
        form.setFieldsValue(values);
      },
      validateFields() {
        return form.validateFields(); 
      }
    }));

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 24 }}
        initialValues={initialData}
      >
        {/* Adicionando regras de validação aos campos obrigatórios */}
        <Form.Item name="title" label="Título da Atividade" rules={[{ required: true, message: 'O título é obrigatório.' }]}>
          <Input />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="teacherName" label="Professor(a)">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="yearGrade" label="Ano/Série">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
            <Col span={12}>
            <Form.Item name="knowledgeArea" label="Área do Conhecimento">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
              <Form.Item name="estimatedTime" label="Tempo Estimado">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="summary" label="Resumo da Atividade">
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item name="objectives" label="Objetivos" rules={[{ required: true, message: 'Os objetivos são obrigatórios.' }]}>
          <TextArea rows={4} placeholder="Liste os objetivos de aprendizagem..."/>
        </Form.Item>

        <Form.Item name="skills" label="Habilidades Trabalhadas">
          <TextArea rows={4} placeholder="Liste as habilidades, uma por linha..."/>
        </Form.Item>

        <Form.Item name="resources" label="Recursos Necessários">
          <TextArea rows={4} placeholder="Liste os recursos, um por linha..."/>
        </Form.Item>

        <Form.Item name="stepByStep" label="Passo a Passo da Atividade" rules={[{ required: true, message: 'O passo a passo é obrigatório.' }]}>
          <TextArea rows={8} placeholder="Descreva detalhadamente cada etapa da atividade..."/>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isSaving} icon={<SaveOutlined />}>
            Salvar Alterações
          </Button>
        </Form.Item>
      </Form>
    );
  }
);

LessonPlanForm.displayName = 'LessonPlanForm';