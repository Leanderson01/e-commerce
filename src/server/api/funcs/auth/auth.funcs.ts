import { type SupabaseClient } from "@supabase/supabase-js";
import type { DBClient } from "~/server/db/src/client";
import { ProfilesTable, UsersTable } from "~/server/db/src/schema/user";
import { v7 as uuidv7 } from "uuid";
import type {
  LoginInput,
  SignupInput,
  UpdateUserProfileInput,
  DeleteUserAccountInput,
} from "./auth.types";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const login = async (
  input: LoginInput,
  db: DBClient,
  supabase: SupabaseClient,
) => {
  try {
    // Check if user exists in our database first
    const user = await db.query.UsersTable.findFirst({
      where: (users, { eq }) => eq(users.email, input.email),
      with: {
        _profile: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Usuário não encontrado",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Conta inativa",
      });
    }

    // Use Supabase to validate credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Credenciais inválidas",
        cause: error,
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user._profile,
      },
      session: data.session,
    };
  } catch (error) {
    console.error("Error during login:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao fazer login",
      cause: error,
    });
  }
};

export const signup = async (
  input: SignupInput,
  db: DBClient,
  supabase: SupabaseClient,
) => {
  try {
    // Check if user already exists
    const existingUser = await db.query.UsersTable.findFirst({
      where: (users, { eq }) => eq(users.email, input.email),
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Usuário com este email já existe",
        cause: existingUser,
      });
    }

    // Register with Supabase - they handle password hashing
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (authError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao registrar com Supabase",
        cause: authError,
      });
    }

    // Generate a new user ID
    const userId = uuidv7();

    // Create transaction to insert user and profile
    const [newUser] = await db.transaction(async (tx) => {
      // Insert user with password placeholder
      const [user] = await tx
        .insert(UsersTable)
        .values({
          id: userId,
          email: input.email,
          password: "SUPABASE_MANAGED", // We don't store actual passwords, Supabase handles that
          role: input.role,
        })
        .returning();

      // Create profile with full name derived from first and last name
      const fullName = `${input.profile.firstName} ${input.profile.lastName}`;

      // Insert profile
      const [profile] = await tx
        .insert(ProfilesTable)
        .values({
          id: uuidv7(),
          userId: user?.id ?? userId, // Use userId as fallback
          firstName: input.profile.firstName,
          lastName: input.profile.lastName,
          fullName,
          phone: input.profile.phone,
          address: input.profile.address,
          city: input.profile.city,
          state: input.profile.state,
          zipCode: input.profile.zipCode,
          country: input.profile.country,
        })
        .returning();

      return [{ ...user, _profile: profile }];
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        profile: newUser._profile,
      },
      session: authData.session,
    };
  } catch (error) {
    console.error("Error during signup:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao registrar usuário",
      cause: error,
    });
  }
};

export const logout = async (supabase: SupabaseClient) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao fazer logout",
        cause: error,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error during logout:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao fazer logout",
      cause: error,
    });
  }
};

export const getUserLogged = async (db: DBClient, supabase: SupabaseClient) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Nenhuma sessão ativa encontrada",
      });
    }

    const userEmail = sessionData.session.user.email;

    if (!userEmail) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Email do usuário não encontrado na sessão",
      });
    }

    const user = await db.query.UsersTable.findFirst({
      where: (users, { eq }) => eq(users.email, userEmail),
      with: {
        _profile: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Usuário não encontrado no banco de dados",
      });
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user._profile,
    };
  } catch (error) {
    console.error("Error getting logged user:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao obter usuário logado",
      cause: error,
    });
  }
};

export const getUserProfile = async (userId: string, db: DBClient) => {
  try {
    const profile = await db.query.ProfilesTable.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, userId),
    });

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Perfil não encontrado",
      });
    }

    return profile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao obter perfil do usuário",
      cause: error,
    });
  }
};

export const updateUserProfile = async (
  userId: string,
  input: UpdateUserProfileInput,
  db: DBClient,
) => {
  try {
    // Verificar se o perfil existe
    const existingProfile = await db.query.ProfilesTable.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, userId),
    });

    if (!existingProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Perfil não encontrado",
      });
    }

    // Atualizar o nome completo baseado no primeiro e último nome
    const fullName = `${input.firstName} ${input.lastName}`;

    // Atualizar o perfil
    const [updatedProfile] = await db
      .update(ProfilesTable)
      .set({
        firstName: input.firstName,
        lastName: input.lastName,
        fullName,
        phone: input.phone,
        address: input.address,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        country: input.country,
        updatedAt: new Date(),
      })
      .where(eq(ProfilesTable.userId, userId))
      .returning();

    return updatedProfile;
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao atualizar perfil do usuário",
      cause: error,
    });
  }
};

export const deleteUserAccount = async (
  userId: string,
  input: DeleteUserAccountInput,
  db: DBClient,
  supabase: SupabaseClient,
) => {
  try {
    // Buscar usuário para verificar se existe
    const user = await db.query.UsersTable.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Usuário não encontrado",
      });
    }

    // Verificar senha com Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: input.password,
      });

    if (authError || !authData.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Senha inválida",
        cause: authError,
      });
    }

    // Excluir o usuário no Supabase
    const { error: deleteSupabaseError } = await supabase.auth.admin.deleteUser(
      authData.user.id,
    );

    if (deleteSupabaseError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao excluir usuário no Supabase",
        cause: deleteSupabaseError,
      });
    }

    // Excluir o usuário no banco de dados
    // Nota: A exclusão em cascata deve excluir automaticamente o perfil
    await db.delete(UsersTable).where(eq(UsersTable.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir conta de usuário:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao excluir conta de usuário",
      cause: error,
    });
  }
};
