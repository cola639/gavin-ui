// src/routes/routes.ts
import { getRoutesApi } from '@/apis/auth';
import type { BackendRoute } from '@/routes/RouteFactory';

/**
 * Backend menu/router node returned by `/auth/getRouters` (RuoYi-like).
 * We only type the fields we use.
 */
type RawRouter = {
  menuName?: string;
  routeName?: string;
  path?: string;
  component?: string;
  query?: any;
  remark?: string | null;
  visible?: string | boolean | number | null;
  icon?: string | null;
  children?: RawRouter[];
};

type RemarkInfo = {
  redirect?: string;
  alwaysShow?: boolean;
  link?: string;
};

function toBool(v: any): boolean | undefined {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v !== 'string') return undefined;

  const s = v.trim().toLowerCase();
  if (s === 'true' || s === '1' || s === 'yes') return true;
  if (s === 'false' || s === '0' || s === 'no') return false;
  return undefined;
}

/** remark example: "redirect=noRedirect;alwaysShow=true;link=null" */
function parseRemark(remark?: string | null): RemarkInfo {
  if (!remark) return {};
  const out: RemarkInfo = {};

  remark
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [k, ...rest] = pair.split('=');
      const key = (k || '').trim();
      const value = rest.join('=').trim();

      if (!key) return;

      if (key === 'redirect') out.redirect = value;
      if (key === 'alwaysShow') out.alwaysShow = toBool(value) ?? undefined;
      if (key === 'link') out.link = value && value.toLowerCase() !== 'null' ? value : undefined;
    });

  return out;
}

/**
 * Your backend seems to use `visible: "True" | "False"` (sometimes RuoYi uses 0/1).
 * Here: hidden = !visible
 */
function calcHidden(visible: RawRouter['visible']): boolean {
  const b = toBool(visible);
  if (b === undefined) {
    // default: visible unless backend explicitly says hidden
    if (typeof visible === 'string') {
      const s = visible.trim().toLowerCase();
      if (s === 'false') return true;
      if (s === 'true') return false;
      if (s === '1') return true;
      if (s === '0') return false;
    }
    return false;
  }
  return !b;
}

/**
 * Unwraps possible request() response shapes into the backend router array.
 * Your backend JSON is: { code, msg, data: [...] }
 */
function unwrapRouters(res: any): RawRouter[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as RawRouter[];

  // axios raw response: { data: { code, msg, data: [...] } }
  const root = res?.data ?? res;

  if (Array.isArray(root)) return root as RawRouter[];
  if (Array.isArray(root?.data)) return root.data as RawRouter[];
  if (Array.isArray(root?.data?.data)) return root.data.data as RawRouter[];

  return [];
}

function mapRouter(node: RawRouter): BackendRoute {
  const remark = parseRemark(node.remark);

  const title = node.menuName || node.routeName || '';
  const name = node.routeName || node.menuName || title;

  const route: BackendRoute = {
    name,
    path: node.path || '',
    hidden: calcHidden(node.visible),
    component: node.component || '',
    meta: {
      title,
      icon: node.icon || '',
      link: remark.link
    },
    children: []
  };

  if (remark.redirect) route.redirect = remark.redirect;
  if (remark.alwaysShow !== undefined) route.alwaysShow = remark.alwaysShow;

  // keep backend query if your RouteFactory supports it
  if (node.query != null) (route as any).query = node.query;

  const children = Array.isArray(node.children) ? node.children : [];
  route.children = children.map(mapRouter);

  return route;
}

/**
 * Fetch routes from backend: GET /auth/getRouters
 * (Make sure `getRoutesApi()` points to `/auth/getRouters`.)
 */
export async function fetchRoutes(): Promise<BackendRoute[]> {
  const res: any = await getRoutesApi();
  const routers = unwrapRouters(res);
  return routers.map(mapRouter);
}
