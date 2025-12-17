import { Checkbox, Spin, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useEffect, useMemo, useState } from 'react';

import TextInput from '@/components/form/input/TextInput';
import RadioGroup from '@/components/form/radio/RadioGroup';

import inputStyles from '@/components/form/input/input.module.scss';
import styles from './RoleForm.module.scss';

import { fetchMenuList, type RawMenu as RawSysMenu } from '@/apis/menu';
import { getRoleMenuTreeselectApi } from '@/apis/role';

type Errors = Partial<Record<'roleName' | 'roleKey' | 'status', string>>;

export type RoleFormValues = {
  roleName: string;
  roleKey: string;
  status: 'Enabled' | 'Disabled';
  remark?: string;
  menuIds: number[];
};

export type RoleFormProps = {
  roleId?: number;
  initial?: Partial<RoleFormValues>;
  submitLabel?: string;
  onSubmit: (values: RoleFormValues) => void;
};

const STATUS_OPTIONS = [
  { label: 'Enabled', value: 'Enabled' },
  { label: 'Disabled', value: 'Disabled' }
];

/** ------------------------ helpers: build tree from flat menu list ------------------------ */
type MenuWithChildren = RawSysMenu & { children: MenuWithChildren[] };

const buildMenuTreeFromFlat = (rows: RawSysMenu[]): MenuWithChildren[] => {
  const map = new Map<number, MenuWithChildren>();
  rows.forEach((item) => map.set(item.menuId, { ...(item as any), children: [] }));

  const roots: MenuWithChildren[] = [];
  map.forEach((item) => {
    const pid = item.parentId;
    if (!pid || !map.has(pid)) roots.push(item);
    else map.get(pid)!.children.push(item);
  });

  const sortTree = (list: MenuWithChildren[]) => {
    list.sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
    list.forEach((n) => n.children?.length && sortTree(n.children));
  };
  sortTree(roots);

  return roots;
};

const mapMenusToTreeData = (nodes: Array<{ menuId: number; menuName: string; children?: any[] }>): DataNode[] =>
  nodes.map((n) => ({
    key: n.menuId,
    title: n.menuName,
    children: n.children?.length ? mapMenusToTreeData(n.children) : undefined
  }));

const collectAllKeys = (nodes: DataNode[], acc: React.Key[] = []) => {
  for (const n of nodes) {
    acc.push(n.key);
    if (n.children?.length) collectAllKeys(n.children, acc);
  }
  return acc;
};

const toNumberKeys = (keys: React.Key[]): number[] => keys.map((k) => Number(k)).filter((n) => Number.isFinite(n));
/** -------------------------------------------------------------------------------------- */

const RoleForm: React.FC<RoleFormProps> = ({ roleId, initial, submitLabel = 'Submit', onSubmit }) => {
  const [roleName, setRoleName] = useState(initial?.roleName ?? '');
  const [roleKey, setRoleKey] = useState(initial?.roleKey ?? '');
  const [status, setStatus] = useState<RoleFormValues['status']>(initial?.status ?? 'Enabled');
  const [remark, setRemark] = useState(initial?.remark ?? '');

  const [treeLoading, setTreeLoading] = useState(false);
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]); // collapsed by default
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(initial?.menuIds?.map(String) ?? []);

  const [errors, setErrors] = useState<Errors>({});

  const allKeys = useMemo(() => collectAllKeys(treeData, []), [treeData]);

  const isExpandedAll = allKeys.length > 0 && expandedKeys.length >= allKeys.length;
  const isCheckedAll = allKeys.length > 0 && checkedKeys.length >= allKeys.length;

  const validate = (): Errors => {
    const e: Errors = {};
    if (!roleName.trim()) e.roleName = 'Please enter role name.';
    if (!roleKey.trim()) e.roleKey = 'Please enter role key.';
    if (!status) e.status = 'Please choose status.';
    return e;
  };

  const clear = (k: keyof Errors) => setErrors((prev) => ({ ...prev, [k]: undefined }));

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setTreeLoading(true);
      try {
        if (roleId) {
          const res: any = await getRoleMenuTreeselectApi(roleId);

          const menus = res?.menus ?? res?.data?.menus ?? res?.data?.data?.menus ?? null;
          const checked = res?.checkedKeys ?? res?.data?.checkedKeys ?? res?.data?.data?.checkedKeys ?? [];

          if (!alive) return;

          if (Array.isArray(menus) && menus.length) {
            const data = mapMenusToTreeData(menus);
            setTreeData(data);
            setExpandedKeys([]); // ✅ first time collapsed
          } else {
            const listRes: any = await fetchMenuList();
            const flat: RawSysMenu[] = (listRes?.data as any) ?? [];
            const tree = buildMenuTreeFromFlat(flat);
            const data = mapMenusToTreeData(tree);
            setTreeData(data);
            setExpandedKeys([]); // ✅ first time collapsed
          }

          const ck = Array.isArray(checked) ? checked : [];
          setCheckedKeys(ck.map((x: any) => String(x)));
        } else {
          const listRes: any = await fetchMenuList();
          const flat: RawSysMenu[] = (listRes?.data as any) ?? [];
          const tree = buildMenuTreeFromFlat(flat);
          const data = mapMenusToTreeData(tree);

          if (!alive) return;

          setTreeData(data);
          setExpandedKeys([]); // ✅ first time collapsed
          if (initial?.menuIds?.length) setCheckedKeys(initial.menuIds.map((id) => String(id)));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('LOAD_ROLE_MENU_TREE_FAILED', e);
      } finally {
        if (alive) setTreeLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const eMap = validate();
    setErrors(eMap);
    if (Object.values(eMap).some(Boolean)) return;

    onSubmit({
      roleName: roleName.trim(),
      roleKey: roleKey.trim(),
      status,
      remark: remark?.trim() || '',
      menuIds: toNumberKeys(checkedKeys)
    });
  };

  return (
    <form className={`${styles.antdPrimary} ${styles.formPadTop}`} onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 gap-4">
        <TextInput
          label="Role Name"
          value={roleName}
          onChange={(e) => {
            setRoleName(e.target.value);
            clear('roleName');
          }}
          error={errors.roleName}
          placeholder="Please enter role name..."
        />

        <TextInput
          label="Role Key"
          value={roleKey}
          onChange={(e) => {
            setRoleKey(e.target.value);
            clear('roleKey');
          }}
          error={errors.roleKey}
          placeholder="Please enter role key..."
        />

        <RadioGroup
          label="Status"
          value={status}
          onChange={(v) => {
            setStatus(v as any);
            clear('status');
          }}
          options={STATUS_OPTIONS}
        />

        {/* Menus */}
        <div>
          <div className={`${styles.menuHeader} mb-2`}>
            <div className="text-sm font-semibold text-gray-900">Menus</div>

            <div className={styles.menuActions}>
              {/* ✅ swapped order: Select All first */}
              <Checkbox checked={isCheckedAll} onChange={(e) => setCheckedKeys(e.target.checked ? allKeys : [])} disabled={!allKeys.length}>
                Select All
              </Checkbox>

              <Checkbox checked={isExpandedAll} onChange={(e) => setExpandedKeys(e.target.checked ? allKeys : [])} disabled={!allKeys.length}>
                Expand All
              </Checkbox>
            </div>
          </div>

          <div className={`${styles.treeBox} ${styles.roleTree}`}>
            <Spin spinning={treeLoading}>
              <Tree
                checkable
                selectable={false}
                treeData={treeData}
                expandedKeys={expandedKeys}
                onExpand={(keys) => setExpandedKeys(keys as React.Key[])}
                checkStrictly={false}
                checkedKeys={checkedKeys}
                onCheck={(keys) => setCheckedKeys(keys as React.Key[])}
              />
            </Spin>
          </div>
        </div>

        {/* Remark */}
        <label className={inputStyles.field}>
          <span className={inputStyles.label}>Remark</span>
          <textarea
            className={`${inputStyles.input} ${styles.remark}`}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Please enter remark..."
          />
        </label>
      </div>

      <div className="mt-5">
        <button type="submit" className="w-full rounded-xl px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-strong)] text-white font-semibold">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default RoleForm;
