// src/views/profile/index.tsx
import { getUserDetailApi, updateUserApi } from '@/apis/user';
import { useDispatch, useSelector } from '@/store';
import { fetchUserInfo, setUserInfo } from '@/store/slice/userSlice';
import { SEXES } from '@/utils/dict';
import { message, Spin } from 'antd';
import { Camera } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type FormState = {
  nickName: string;
  phonenumber: string;
  email: string;
  sex: string;
};

type MetaState = {
  userId?: number;
  deptId?: number;
  roleIds?: number[];
  postIds?: number[];
  status?: string;
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const userInfo = useSelector((s) => s.user.userInfo);

  const [form, setForm] = useState<FormState>({ nickName: '', phonenumber: '', email: '', sex: '' });
  const [meta, setMeta] = useState<MetaState>({ status: 'Enabled', roleIds: [], postIds: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      dispatch(fetchUserInfo());
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (userInfo?.userId) {
      loadProfile(userInfo.userId);
    }
  }, [userInfo?.userId]);

  const canSubmit = useMemo(
    () => Boolean(form.nickName.trim() && form.email.trim() && form.phonenumber.trim() && form.sex),
    [form.nickName, form.email, form.phonenumber, form.sex]
  );

  async function loadProfile(userId: number) {
    setLoading(true);
    try {
      const res: any = await getUserDetailApi(userId);
      const data = res?.data ?? res?.user ?? res ?? {};

      setForm({
        nickName: data.nickName ?? userInfo?.nickName ?? '',
        phonenumber: data.phonenumber ?? userInfo?.phonenumber ?? '',
        email: data.email ?? userInfo?.email ?? '',
        sex: data.sex ?? userInfo?.sex ?? ''
      });

      setMeta({
        userId: data.userId ?? userId,
        deptId: data.deptId,
        roleIds: res?.roleIds ?? data.roleIds ?? [],
        postIds: res?.postIds ?? data.postIds ?? [],
        status: data.status ?? 'Enabled'
      });
    } catch (e) {
      console.error(e);
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      message.warning('Please fill all required fields.');
      return;
    }

    const userId = meta.userId ?? userInfo?.userId;
    if (!userId) {
      message.error('Missing user id');
      return;
    }

    const payload = {
      userId,
      nickName: form.nickName.trim(),
      email: form.email.trim(),
      phonenumber: form.phonenumber.trim(),
      sex: form.sex || 'Unknown',
      status: meta.status ?? 'Enabled',
      deptId: meta.deptId,
      roleIds: meta.roleIds ?? [],
      postIds: meta.postIds ?? []
    };

    setSaving(true);
    try {
      await updateUserApi(payload);
      message.success('Profile updated');
      if (userInfo) {
        dispatch(
          setUserInfo({
            ...userInfo,
            nickName: payload.nickName,
            email: payload.email,
            phonenumber: payload.phonenumber,
            sex: payload.sex
          })
        );
      }
    } catch (e) {
      console.error(e);
      message.error('Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="">
      <div className="w-full">
        <h1 className="mb-5 text-3xl font-semibold text-gray-900">Profile Settings</h1>

        <div className="w-full rounded-[20px] border border-[var(--card-border)] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)] p-6 md:p-10">
          <Spin spinning={loading}>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center gap-3">
                <div className="h-20 w-20 rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-xl font-semibold text-[var(--text-muted)]">
                  <Camera className="h-7 w-7 text-[var(--text-muted)]" />
                </div>
                <button type="button" className="text-sm font-semibold text-[var(--primary-strong)]">
                  Upload Photo
                </button>
                <div className="text-xs text-[var(--text-muted)]">PNG/JPG up to 2MB</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Nick Name</label>
                  <input
                    value={form.nickName}
                    onChange={(e) => handleChange('nickName', e.target.value)}
                    placeholder="Your display name"
                    className="w-full rounded-lg border border-transparent bg-[var(--bg-muted)] px-4 py-3 text-[var(--text)] text-center placeholder:text-center outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Phone</label>
                  <input
                    value={form.phonenumber}
                    onChange={(e) => handleChange('phonenumber', e.target.value)}
                    placeholder="e.g., +1 555 0123"
                    className="w-full rounded-lg border border-transparent bg-[var(--bg-muted)] px-4 py-3 text-[var(--text)] text-center placeholder:text-center outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-transparent bg-[var(--bg-muted)] px-4 py-3 text-[var(--text)] text-center placeholder:text-center outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Sex</label>
                  <select
                    value={form.sex}
                    onChange={(e) => handleChange('sex', e.target.value)}
                    className="w-full h-[52px] rounded-lg border border-transparent bg-[var(--bg-muted)] px-4 text-[var(--text)] text-center outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)]"
                  >
                    <option value="" disabled>
                      Please select
                    </option>
                    {SEXES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!canSubmit || saving}
                  className={`cursor-pointer w-full sm:w-auto rounded-lg px-6 py-3 text-sm font-semibold text-white transition sm:min-w-[200px] ${
                    canSubmit && !saving ? 'bg-[var(--primary-strong)] hover:bg-[var(--primary)]' : 'bg-[var(--muted)] cursor-not-allowed'
                  }`}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => meta.userId && loadProfile(meta.userId)}
                  className="cursor-pointer text-sm font-semibold text-[var(--text-subtle)] hover:text-[var(--text)]"
                  disabled={loading || saving}
                >
                  Reset changes
                </button>
              </div>
            </form>
          </Spin>
        </div>
      </div>
    </main>
  );
}
