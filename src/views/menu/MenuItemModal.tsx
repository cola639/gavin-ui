import { Modal, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { createMenu, updateMenu, type RawMenu } from '@/apis/menu';
import Dropdown from '@/components/form/dropdown/Dropdown';
import TextInput from '@/components/form/input/TextInput';
import IconPicker from '@/components/Icons/IconPicker';

export type UiMenuType = 'Module' | 'Menu' | 'Function';

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
    moduleName?: string; // top module name
    menuName?: string; // nearest menu name (for function)
  };

  /** edit only */
  initial?: Partial<RawMenu> & { menuId: number };

  onClose: () => void;
  onSuccess: () => void;
};

const MenuItemModal: React.FC<MenuItemModalProps> = ({ open, mode, parentId, createType, permContext, initial, onClose, onSuccess }) => {
  const isEdit = mode === 'edit';

  // ✅ IMPORTANT: derive menuType from props (no stale state)
  const menuType: UiMenuType = useMemo(() => {
    if (isEdit) return normalizeType(initial?.menuType);
    return createType === 'Function' ? 'Function' : 'Menu';
  }, [isEdit, initial?.menuType, createType]);

  const isButton = menuType === 'Function';

  const showPath = !isButton; // hide for button
  const showComponent = menuType === 'Menu'; // only for menu
  const showIcon = !isButton; // hide for button
  const showPerms = menuType !== 'Module'; // module usually no perms
  const showFrameCache = !isButton; // hide for button (per your screenshot)

  const title = useMemo(() => {
    if (isEdit) return `Edit ${menuType === 'Function' ? 'Button' : menuType}`;
    return menuType === 'Function' ? 'Add Button' : 'Add Menu';
  }, [isEdit, menuType]);

  const [menuName, setMenuName] = useState('');
  const [path, setPath] = useState('');
  const [pathTouched, setPathTouched] = useState(false);

  const [component, setComponent] = useState('');
  const [icon, setIcon] = useState('');

  const [perms, setPerms] = useState('');
  const [permsTouched, setPermsTouched] = useState(false);

  const [visible, setVisible] = useState<'True' | 'False'>('True');
  const [status, setStatus] = useState<'Normal' | 'Disabled'>('Normal');
  const [isFrame, setIsFrame] = useState<'True' | 'False'>('False');
  const [isCache, setIsCache] = useState<'True' | 'False'>('False');

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // ✅ reset form every time modal opens (fixes “Add Menu then Add Button shows wrong modal”)
  useEffect(() => {
    if (!open) return;

    setSubmitting(false);
    setErrors({});
    setPathTouched(false);
    setPermsTouched(false);

    if (isEdit) {
      setMenuName(initial?.menuName ?? '');
      setPath(initial?.path ?? '');
      setComponent(String((initial?.component as any) ?? ''));
      setIcon(initial?.icon ?? '');
      setPerms(initial?.perms ?? '');

      setVisible((initial?.visible as any) ?? 'True');
      setStatus((initial?.status as any) ?? 'Normal');
      setIsFrame((initial?.isFrame as any) ?? 'False');
      setIsCache((initial?.isCache as any) ?? 'False');
      return;
    }

    // create defaults
    setMenuName('');
    setPath('');
    setComponent('');
    setIcon('');
    setPerms('');

    setVisible('True');
    setStatus('Normal');
    setIsFrame('False');
    setIsCache('False');
  }, [open, isEdit, menuType, initial?.menuId]);

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

    if (menuType === 'Menu' || menuType === 'Module') {
      if (!path.trim()) e.path = 'Please enter path.';
      else if (!path.startsWith('/')) e.path = "Path must start with '/'.";
    }

    if (menuType === 'Menu') {
      if (!String(component ?? '').trim()) e.component = 'Please enter component path.';
    }

    if (menuType === 'Function') {
      if (!perms.trim()) e.perms = 'Please enter permission flag.';
    }

    return e;
  };

  const clearError = (k: keyof Errors) => setErrors((prev) => ({ ...prev, [k]: undefined }));

  const handleCancel = () => {
    if (submitting) return;
    onClose();
  };

  const handleOk = async () => {
    const e = validate();
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;

    const payload: any = {
      parentId,
      menuType,
      menuName: menuName.trim(),
      orderNum: isEdit ? initial?.orderNum ?? 0 : 0, // ✅ no UI, default 0
      visible,
      status,
      isFrame,
      isCache
    };

    // perms
    payload.perms = showPerms ? perms.trim() || undefined : undefined;

    // path/component/icon per type
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

            // path auto (Menu/Module only)
            if (showPath && !pathTouched) {
              const auto = genPathFromName(nextName);
              setPath(auto);
              if (auto) clearError('path');
            }

            // perms auto (Menu/Function only)
            if (showPerms && !permsTouched) {
              const p = autoPerms(nextName);
              setPerms(p);
              if (p) clearError('perms');
            }
          }}
          error={errors.menuName}
          placeholder="Please enter a name..."
        />

        {/* ✅ Button: remove Path completely */}
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
        ) : null}

        {/* ✅ Button: remove Component completely */}
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
        ) : null}

        {/* perms (Menu & Button) */}
        {showPerms ? (
          <TextInput
            label="Permission Flag"
            value={perms}
            onChange={(e) => {
              setPermsTouched(true);
              setPerms(e.target.value);
              clearError('perms');
            }}
            error={errors.perms}
            placeholder={menuType === 'Function' ? 'e.g., module:menu:function' : 'e.g., module:menu:view'}
          />
        ) : null}

        {/* ✅ Button: remove Icon completely */}
        {showIcon ? <IconPicker label="Icon" value={icon} onChange={setIcon} /> : null}

        {/* keep these for button */}
        <Dropdown label="Visible" value={visible} onChange={(v) => setVisible(v as any)} options={TRUE_FALSE} />
        <Dropdown label="Status" value={status} onChange={(v) => setStatus(v as any)} options={STATUS} />

        {/* ✅ Button: remove Is Frame / Is Cache completely */}
        {showFrameCache ? (
          <>
            <Dropdown label="Is Frame" value={isFrame} onChange={(v) => setIsFrame(v as any)} options={TRUE_FALSE} />
            <Dropdown label="Is Cache" value={isCache} onChange={(v) => setIsCache(v as any)} options={TRUE_FALSE} />
          </>
        ) : null}
      </div>
    </Modal>
  );
};

export default MenuItemModal;
