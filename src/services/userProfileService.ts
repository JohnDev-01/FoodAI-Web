import { supabaseClient } from './supabaseClient';
import { sendWelcomeEmail } from './mailService';
import type { UserProfile, UserRole, UserStatus } from '../types';

interface UserProfileDbRow {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  profile_image?: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

const mapToUserProfile = (row: UserProfileDbRow): UserProfile => ({
  id: row.id,
  authId: row.auth_id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  role: row.role,
  profileImage: row.profile_image ?? null,
  status: row.status ?? 'pending',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function getUserProfileByAuthId(authId: string) {
  const { data, error } = await supabaseClient
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapToUserProfile(data) : null;
}

export async function getUserProfileByEmail(email: string) {
  const { data, error } = await supabaseClient
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapToUserProfile(data) : null;
}

export async function upsertUserProfile(input: {
  authId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string | null;
  status?: UserStatus;
}) {
  const existing = await getUserProfileByAuthId(input.authId);

  const payload = {
    auth_id: input.authId,
    email: input.email,
    first_name: input.firstName,
    last_name: input.lastName,
    role: input.role,
    profile_image: input.profileImage ?? null,
    status: input.status ?? 'pending',
  };

  if (existing) {
    const { data, error } = await supabaseClient
      .from('users')
      .update(payload)
      .eq('auth_id', input.authId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapToUserProfile(data);
  }

  const { data, error } = await supabaseClient
    .from('users')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  const profile = mapToUserProfile(data);
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || profile.email;
  await sendWelcomeEmail({
    email: profile.email,
    fullName,
    role: profile.role,
  });

  return profile;
}
