'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { ActionButton } from '@/components/common/button';
import { useZodForm } from '@/components/common/forms/hooks/use-form';
import { changePasswordSchema, profileSchema } from '@/components/common/forms/schemas/account';
import { PageHeader } from '@/components/common/page-header/page-header';
import { UserAvatar } from '@/components/common/user-avatar/user-avatar';
import { PasswordForm, ProfileForm, SettingsCard } from '@/components/features/account/account-forms';
import { ThemePicker } from '@/components/features/account/theme-picker';
import { LOGIN_PATH } from '@/auth/jwt/config';
import { useAuth } from '@/hooks/use-auth';
import { applyServerErrors } from '@/lib/http/form-errors';
import { useChangePassword, useUpdateProfile } from './service';

export default function AccountContainer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, refreshUser } = useAuth();

  // Profile
  const [profileError, setProfileError] = useState<string | null>(null);
  const profileForm = useZodForm(profileSchema, { defaultValues: { name: user?.name ?? '' } });
  // Names show up on tasks and comments, so refresh everything after a rename.
  const updateProfile = useUpdateProfile(() => {
    void refreshUser();
    void queryClient.invalidateQueries();
  });

  useEffect(() => {
    if (user) profileForm.reset({ name: user.name });
  }, [user, profileForm]);

  const onProfileSubmit = profileForm.handleSubmit(async (values) => {
    setProfileError(null);
    try {
      await updateProfile.mutateAsync({ name: values.name });
    } catch (error) {
      setProfileError(applyServerErrors(error, profileForm.setError));
    }
  });

  // Password
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const passwordForm = useZodForm(changePasswordSchema, {
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const changePassword = useChangePassword(() => passwordForm.reset());

  const onPasswordSubmit = passwordForm.handleSubmit(async (values) => {
    setPasswordError(null);
    try {
      await changePassword.mutateAsync({ currentPassword: values.currentPassword, newPassword: values.newPassword });
    } catch (error) {
      setPasswordError(applyServerErrors(error, passwordForm.setError));
    }
  });

  const signOut = async () => {
    await logout();
    queryClient.clear();
    router.replace(LOGIN_PATH);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account"
        description="Your profile, password and appearance."
        actions={
          <ActionButton variant="outline" icon={<LogOut />} handleOpen={signOut}>
            Sign out
          </ActionButton>
        }
      />

      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <UserAvatar user={{ name: user.name, avatarUrl: user.avatar }} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <SettingsCard title="Profile" description="This name is shown on tasks, comments and activity.">
        <ProfileForm
          form={profileForm}
          onSubmit={onProfileSubmit}
          isPending={updateProfile.isPending}
          error={profileError}
          email={user.email}
        />
      </SettingsCard>

      <SettingsCard title="Password" description="Use at least 8 characters with a letter and a number.">
        <PasswordForm form={passwordForm} onSubmit={onPasswordSubmit} isPending={changePassword.isPending} error={passwordError} />
      </SettingsCard>

      <SettingsCard title="Appearance" description="Choose how TaskForge looks on this device.">
        <ThemePicker />
      </SettingsCard>
    </div>
  );
}
