import { Modal, message } from 'antd';
import React, { useMemo, useState } from 'react';

import { createMenu } from '@/apis/menu';
import Dropdown from '@/components/form/dropdown/Dropdown';
import TextInput from '@/components/form/input/TextInput';
import IconPicker from '@/components/Icons/IconPicker';

type Errors = Partial<Record<'menuName' | 'path' | 'orderNum', string>>;

export type NewModuleModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  parentId?: number;
};

type Option = { label: string; value: string };

const TRUE_FALSE: Option[] = [
  { label: 'True', value: 'True' },
  { label: 'False', value: 'False' }
];

const STATUS: Option[] = [
  { label: 'Normal', value: 'Normal' },
  { label: 'Disabled', value: 'Disabled' }
];

// If backend expects 'M' instead, change here
const MENU_TYPE_MODULE = 'Module';

const NewModuleModal: React.FC<NewModuleModalProps> = ({ open, onClose, onCreated, parentId = 0 }) => {
  const [submitting, setSubmitting] = useState(false);

  const [menuName, setMenuName] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('');
  const [orderNum, setOrderNum] = useState('0');

  const [isFrame, setIsFrame] = useState<'True' | 'False'>('False');
  const [isCache, setIsCache] = useState<'True' | 'False'>('False');
  const [visible, setVisible] = useState<'True' | 'False'>('True');
  const [status, setStatus] = useState<'Normal' | 'Disabled'>('Normal');

  const [errors, setErrors] = useState<Errors>({});

  const canSubmit = useMemo(() => !submitting, [submitting]);

  const resetForm = () => {
    setMenuName('');
    setPath('');
    setIcon('bug');
    setOrderNum('0');
    setIsFrame('False');
    setIsCache('False');
    setVisible('True');
    setStatus('Normal');
    setErrors({});
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!menuName.trim()) e.menuName = 'Please enter module name.';
    if (!path.trim()) e.path = 'Please enter path.';
    else if (!path.startsWith('/')) e.path = "Path must start with '/'.";
    if (orderNum.trim() === '') e.orderNum = 'Please enter order number.';
    else if (Number.isNaN(Number(orderNum))) e.orderNum = 'Order number must be a valid number.';
    return e;
  };

  const clearError = (k: keyof Errors) => setErrors((prev) => ({ ...prev, [k]: undefined }));

  const handleCancel = () => {
    if (submitting) return;
    onClose();
    resetForm();
  };

  const handleOk = async () => {
    const e = validate();
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;

    const payload = {
      parentId,
      icon: icon?.trim() || undefined,
      menuType: MENU_TYPE_MODULE,
      menuName: menuName.trim(),
      orderNum: Number(orderNum),
      isFrame,
      isCache,
      visible,
      status,
      path: path.trim()
    };

    setSubmitting(true);
    try {
      await createMenu(payload);
      message.success('Module created');
      onClose();
      resetForm();
      onCreated?.();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('CREATE_MODULE_FAILED', err, payload);
      message.error('Create module failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="New Module"
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Create"
      confirmLoading={submitting}
      okButtonProps={{ disabled: !canSubmit }}
      destroyOnClose
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-[24px]">
        <TextInput
          label="Name"
          value={menuName}
          onChange={(e) => {
            setMenuName(e.target.value);
            clearError('menuName');
          }}
          error={errors.menuName}
          placeholder="e.g., test-category"
        />

        <TextInput
          label="Path"
          value={path}
          onChange={(e) => {
            setPath(e.target.value);
            clearError('path');
          }}
          error={errors.path}
          placeholder="e.g., /test-category"
        />

        {/* ✅ same height as your other inputs */}
        <IconPicker label="Icon" value={icon} onChange={setIcon} />

        {/* <TextInput
          label="Order"
          type="number"
          value={orderNum}
          onChange={(e) => {
            setOrderNum(e.target.value);
            clearError('orderNum');
          }}
          error={errors.orderNum}
          placeholder="0"
        /> */}

        <Dropdown label="Visible" value={visible} onChange={(v) => setVisible(v as any)} options={TRUE_FALSE} />
        <Dropdown label="Status" value={status} onChange={(v) => setStatus(v as any)} options={STATUS} />
        <Dropdown label="Is Frame" value={isFrame} onChange={(v) => setIsFrame(v as any)} options={TRUE_FALSE} />
        <Dropdown label="Is Cache" value={isCache} onChange={(v) => setIsCache(v as any)} options={TRUE_FALSE} />
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Request defaults: parentId={parentId}, menuType="{MENU_TYPE_MODULE}", isFrame/isCache default "False", visible default "True", status default
        "Normal".
      </div>
    </Modal>
  );
};

export default NewModuleModal;
