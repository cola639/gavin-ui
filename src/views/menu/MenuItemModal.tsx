import { Modal, message } from 'antd';
import React, { useMemo, useState } from 'react';

import { createMenu, updateMenu, type RawMenu } from '@/apis/menu';
import Dropdown from '@/components/form/dropdown/Dropdown';
import TextInput from '@/components/form/input/TextInput';
import IconPicker from '@/components/Icons/IconPicker';

type UiMenuType = 'Module' | 'Menu' | 'Function';
type Errors = Partial<Record<'menuName' | 'path' | 'component' | 'perms', string>>;

type Option = { label: string; value: string };

const TRUE_FALSE: Option[] = [
  { label: 'True', value: 'True' },
  { label: 'False', value: 'False' }
];

const STATUS: Option[] = [
  { label: 'Normal', value: 'Normal' },
  { label: 'Disabled', value: 'Disabled' }
];

const toKebab = (input: string) => {
  const s = (input ?? '').trim();
  if (!s) return '';
  return s
    .replace(/[_\s]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const genPathFromName = (name: string) => {
  const slug = toKebab(name);
  return slug ? `/${slug}` : '';
};

const normalizePath = (p: string) => {
  const v = (p ?? '').trim();
  if (!v) return '';
  return v.startsWith('/') ? v : `/${v.replace(/^\/+/, '')}`;
};

const normalizeType = (t?: string): UiMenuType => {
  if (t === 'M' || t === 'Module') return 'Module';
  if (t === 'C' || t === 'Menu') return 'Menu';
  if (t === 'F' || t === 'Function') return 'Function';
  return 'Menu';
};

export type MenuItemModalProps = {
  open: boolean;
  mode: 'create' | 'edit';

  parentId: number;

  /** create only: from plus selection */
  createType?: 'Menu' | 'Function';

  /** for perms auto-gen */
  permContext?: {
    moduleName?: string;
    menuName?: string; // nearest menu name (for function)
  };

  /** edit only */
  initial?: Partial<RawMenu> & { menuId: number };

  onClose: () => void;
  onSuccess: () => void;
};

const MenuItemModal: React.FC<MenuItemModalProps> = ({ open, mode, parentId, createType, permContext, initial, onClose, onSuccess }) => {
  const isEdit = mode === 'edit';

  const initialType = normalizeType(initial?.menuType);
  const resolvedCreateType: UiMenuType = isEdit ? initialType : createType ?? 'Menu';

  const [menuType, setMenuType] = useState<UiMenuType>(resolvedCreateType);

  const [menuName, setMenuName] = useState(initial?.menuName ?? '');
  const [path, setPath] = useState(initial?.path ?? '');
  const [pathTouched, setPathTouched] = useState(false);

  const [component, setComponent] = useState((initial?.component as any) ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '');

  const [perms, setPerms] = useState(initial?.perms ?? '');
  const [permsTouched, setPermsTouched] = useState(false);

  const [visible, setVisible] = useState<'True' | 'False'>((initial?.visible as any) ?? 'True');
  const [status, setStatus] = useState<'Normal' | 'Disabled'>((initial?.status as any) ?? 'Normal');
  const [isFrame, setIsFrame] = useState<'True' | 'False'>((initial?.isFrame as any) ?? 'False');
  const [isCache, setIsCache] = useState<'True' | 'False'>((initial?.isCache as any) ?? 'False');

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const showPath = menuType !== 'Function';
  const showComponent = menuType === 'Menu';
  const showIcon = menuType !== 'Function';
  const showPerms = menuType !== 'Module'; // module normally no perms

  const title = useMemo(() => {
    if (isEdit) return `Edit ${menuType === 'Function' ? 'Button' : menuType}`;
    return menuType === 'Function' ? 'Add Button' : 'Add Menu';
  }, [isEdit, menuType]);

  const autoPerms = (name: string) => {
    const modulePart = toKebab(permContext?.moduleName || '');
    const menuPartFromCtx = toKebab(permContext?.menuName || '');
    const selfPart = toKebab(name);

    if (menuType === 'Menu') {
      // module:menu:view
      if (!modulePart || !selfPart) return '';
      return `${modulePart}:${selfPart}:view`;
    }

    if (menuType === 'Function') {
      // module:menu:function
      if (!modulePart || !menuPartFromCtx || !selfPart) return '';
      return `${modulePart}:${menuPartFromCtx}:${selfPart}`;
    }

    return '';
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!menuName.trim()) e.menuName = 'Please enter name.';
    if (showPath) {
      if (!path.trim()) e.path = 'Please enter path.';
      else if (!path.startsWith('/')) e.path = "Path must start with '/'.";
    }
    if (showComponent && !String(component ?? '').trim()) e.component = 'Please enter component path.';
    if (showPerms && menuType === 'Function' && !perms.trim()) e.perms = 'Please enter permission flag.';
    return e;
  };

  const clearError = (k: keyof Errors) => setErrors((prev) => ({ ...prev, [k]: undefined }));

  const reset = () => {
    setMenuType(resolvedCreateType);
    setMenuName(initial?.menuName ?? '');
    setPath(initial?.path ?? '');
    setPathTouched(false);
    setComponent((initial?.component as any) ?? '');
    setIcon(initial?.icon ?? '');
    setPerms(initial?.perms ?? '');
    setPermsTouched(false);
    setVisible((initial?.visible as any) ?? 'True');
    setStatus((initial?.status as any) ?? 'Normal');
    setIsFrame((initial?.isFrame as any) ?? 'False');
    setIsCache((initial?.isCache as any) ?? 'False');
    setErrors({});
  };

  const handleCancel = () => {
    if (submitting) return;
    onClose();
    reset();
  };

  const handleOk = async () => {
    const e = validate();
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;

    const payload: any = {
      parentId,
      menuType,
      menuName: menuName.trim(),
      orderNum: isEdit ? initial?.orderNum ?? 0 : 0, // ✅ no UI, default 0 on create
      visible,
      status,
      isFrame,
      isCache
    };

    payload.perms = showPerms ? perms.trim() || undefined : undefined;

    payload.path = showPath ? normalizePath(path) : '';
    payload.component = showComponent ? String(component).trim() : null;
    payload.icon = showIcon ? icon?.trim() || undefined : undefined;

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateMenu({ menuId: initial!.menuId, ...payload });
        message.success('Updated');
      } else {
        await createMenu(payload);
        message.success('Created');
      }
      onClose();
      reset();
      onSuccess();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('MENU_MODAL_SUBMIT_FAILED', err, payload);
      message.error(isEdit ? 'Update failed' : 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={submitting}
      destroyOnClose
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-[24px]">
        <TextInput
          label="Name"
          value={menuName}
          onChange={(e) => {
            const nextName = e.target.value;
            setMenuName(nextName);
            clearError('menuName');

            // path auto
            if (showPath && !pathTouched) {
              const auto = genPathFromName(nextName);
              setPath(auto);
              if (auto) clearError('path');
            }

            // perms auto
            if (showPerms && !permsTouched) {
              const p = autoPerms(nextName);
              setPerms(p);
              if (p) clearError('perms');
            }
          }}
          error={errors.menuName}
          placeholder="Please enter a name..."
        />

        {showPath ? (
          <TextInput
            label="Path"
            value={path}
            onChange={(e) => {
              const v = e.target.value;
              setPath(v);
              clearError('path');

              if (v.trim() === '') {
                setPathTouched(false);
                setPath(genPathFromName(menuName));
              } else {
                setPathTouched(true);
              }
            }}
            onBlur={(e) => {
              const fixed = normalizePath(e.target.value);
              if (fixed !== path) setPath(fixed);
            }}
            error={errors.path}
            placeholder="Please enter a path..."
          />
        ) : (
          <TextInput label="Path" value="(Button has no route)" disabled />
        )}

        {showComponent ? (
          <TextInput
            label="Component"
            value={component}
            onChange={(e) => {
              setComponent(e.target.value);
              clearError('component');
            }}
            error={errors.component}
            placeholder='e.g., "@/views/xxx"'
          />
        ) : (
          <TextInput label="Component" value="-" disabled />
        )}

        {showPerms ? (
          <TextInput
            label="Permission Flag"
            value={perms}
            onChange={(e) => {
              setPermsTouched(true); // ✅ user manually overrides
              setPerms(e.target.value);
              clearError('perms');
            }}
            error={errors.perms}
            placeholder={menuType === 'Function' ? 'e.g., module:menu:function' : 'e.g., module:menu:view'}
          />
        ) : (
          <TextInput label="Permission Flag" value="-" disabled />
        )}

        {showIcon ? <IconPicker label="Icon" value={icon} onChange={setIcon} /> : <TextInput label="Icon" value="-" disabled />}

        <Dropdown label="Visible" value={visible} onChange={(v) => setVisible(v as any)} options={TRUE_FALSE} />
        <Dropdown label="Status" value={status} onChange={(v) => setStatus(v as any)} options={STATUS} />
        <Dropdown label="Is Frame" value={isFrame} onChange={(v) => setIsFrame(v as any)} options={TRUE_FALSE} />
        <Dropdown label="Is Cache" value={isCache} onChange={(v) => setIsCache(v as any)} options={TRUE_FALSE} />
      </div>
    </Modal>
  );
};

export default MenuItemModal;
