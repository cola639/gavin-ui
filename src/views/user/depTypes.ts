// page/user/depTypes.ts
export type DeptNode = {
  id: number;
  label: string;
  disabled?: boolean;
  children?: DeptNode[];
};

export const toAntTreeData = (nodes: DeptNode[] = []) =>
  nodes.map((n) => ({
    value: String(n.id),
    label: n.label,
    disabled: !!n.disabled,
    children: n.children ? toAntTreeData(n.children) : undefined
  }));

export const findDeptLabelById = (nodes: DeptNode[], id?: string | null): string | undefined => {
  if (!id) return undefined;
  for (const n of nodes) {
    if (String(n.id) === id) return n.label;
    const sub = n.children && findDeptLabelById(n.children, id);
    if (sub) return sub;
  }
  return undefined;
};

export const findDeptIdByLabel = (nodes: DeptNode[], label?: string | null): string | undefined => {
  if (!label) return undefined;
  for (const n of nodes) {
    if (n.label === label) return String(n.id);
    const sub = n.children && findDeptIdByLabel(n.children, label);
    if (sub) return sub;
  }
  return undefined;
};
