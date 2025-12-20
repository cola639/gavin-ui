import { Form, Input, InputNumber, Modal, Radio, Select } from 'antd';
import React, { useEffect } from 'react';
import type { QuartzJobRow } from './type';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Partial<QuartzJobRow> | null;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
};

const QuartzModal: React.FC<Props> = ({ open, mode, initial, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({
      jobName: initial?.jobName ?? '',
      jobGroup: initial?.jobGroup ?? 'DEFAULT',
      invokeTarget: initial?.invokeTarget ?? '',
      cronExpression: initial?.cronExpression ?? '',
      misfirePolicy: initial?.misfirePolicy ?? 1,
      concurrent: initial?.concurrent ?? 1,
      status: initial?.status ?? '0'
    });
  }, [open, form, initial]);

  return (
    <Modal
      title={isEdit ? 'Edit Task' : 'New Task'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={isEdit ? 'Save' : 'Create'}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={async (vals) => {
          await onSubmit(vals);
        }}
      >
        <Form.Item label="Task Name" name="jobName" rules={[{ required: true, message: 'Please input task name' }]}>
          <Input placeholder="Please input task name" />
        </Form.Item>

        <Form.Item label="Task Group" name="jobGroup" rules={[{ required: true }]}>
          <Select options={[{ value: 'DEFAULT', label: 'DEFAULT' }]} />
        </Form.Item>

        <Form.Item label="Invoke Target" name="invokeTarget" rules={[{ required: true, message: 'Please input invoke target' }]}>
          <Input placeholder="ryTask.ryParams('testJob')" />
        </Form.Item>

        <Form.Item label="Cron Expression" name="cronExpression" rules={[{ required: true, message: 'Please input cron expression' }]}>
          <Input placeholder="0/15 * * * * ?" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item label="Misfire Policy" name="misfirePolicy">
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item label="Concurrent" name="concurrent">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </div>

        <Form.Item label="Status" name="status">
          <Radio.Group>
            <Radio value="0">Normal</Radio>
            <Radio value="1">Paused</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuartzModal;
