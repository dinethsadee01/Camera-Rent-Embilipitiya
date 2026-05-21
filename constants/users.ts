import type { AppUser } from '@/lib/types';

interface UserCredential extends AppUser {
  password: string;
}

export const APP_USERS: UserCredential[] = [
  {
    id: 'owner',
    name: 'Owner',
    role: 'owner',
    email: process.env.EXPO_PUBLIC_OWNER_EMAIL ?? 'owner@camerarent.lk',
    password: process.env.EXPO_PUBLIC_OWNER_PASS ?? 'owner@2024',
  },
  {
    id: 'manager',
    name: 'Manager',
    role: 'manager',
    email: process.env.EXPO_PUBLIC_MANAGER_EMAIL ?? 'manager@camerarent.lk',
    password: process.env.EXPO_PUBLIC_MANAGER_PASS ?? 'manager@2024',
  },
];

export function findUser(email: string, password: string): AppUser | null {
  const user = APP_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return null;
  return { id: user.id, name: user.name, role: user.role, email: user.email };
}
