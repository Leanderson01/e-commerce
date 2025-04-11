import { type SupabaseClient } from "@supabase/supabase-js"
import type { DBClient } from "~/server/db/src/client"
import { ProfilesTable, UsersTable } from "~/server/db/src/schema/user"
import { v7 as uuidv7 } from "uuid"
import type { LoginInput, SignupInput, UpdateUserProfileInput, DeleteUserAccountInput } from "./auth.types"
import { eq } from "drizzle-orm"

export const login = async (
  input: LoginInput,
  db: DBClient,
  supabase: SupabaseClient
) => {
  try {
    // Check if user exists in our database first
    const user = await db.query.UsersTable.findFirst({
      where: (users, { eq }) => eq(users.email, input.email),
      with: {
        _profile: true
      }
    })

    if (!user) {
      return {
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "User not found"
        }
      }
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "Account is inactive"
        }
      }
    }

    // Use Supabase to validate credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password
    })

    if (error) {
      return {
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
          cause: error
        }
      }
    }

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user._profile
        },
        session: data.session
      },
      error: null
    }
  } catch (error) {
    console.error("Error during login:", error)
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to login",
        cause: error
      }
    }
  }
}

export const signup = async (
  input: SignupInput,
  db: DBClient,
  supabase: SupabaseClient
) => {
  try {
    // Check if user already exists
    const existingUser = await db.query.UsersTable.findFirst({
      where: (users, { eq }) => eq(users.email, input.email)
    })

    if (existingUser) {
      return {
        data: null,
        error: {
          code: "CONFLICT",
          message: "User with this email already exists",
          cause: existingUser
        }
      }
    }

    // Register with Supabase - they handle password hashing
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password
    })

    if (authError) {
      return {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to register with Supabase",
          cause: authError
        }
      }
    }

    // Generate a new user ID
    const userId = uuidv7()

    // Create transaction to insert user and profile
    const [newUser] = await db.transaction(async (tx) => {
      // Insert user with password placeholder
      const [user] = await tx
        .insert(UsersTable)
        .values({
          id: userId,
          email: input.email,
          password: "SUPABASE_MANAGED", // We don't store actual passwords, Supabase handles that
          role: input.role
        })
        .returning()

      // Create profile with full name derived from first and last name
      const fullName = `${input.profile.firstName} ${input.profile.lastName}`
      
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
          country: input.profile.country
        })
        .returning()

      return [{ ...user, _profile: profile }]
    })

    return {
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          profile: newUser._profile
        },
        session: authData.session
      },
      error: null
    }
  } catch (error) {
    console.error("Error during signup:", error)
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to register user",
        cause: error
      }
    }
  }
}

export const logout = async (supabase: SupabaseClient) => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to logout",
          cause: error
        }
      }
    }

    return {
      data: { success: true },
      error: null
    }
  } catch (error) {
    console.error("Error during logout:", error)
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to logout",
        cause: error
      }
    }
  }
}

export const getUserLogged = async (
  db: DBClient,
  supabase: SupabaseClient
) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    
    if (!sessionData.session) {
      return {
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "No active session found"
        }
      }
    }
    
    const userEmail = sessionData.session.user.email
    
    if (!userEmail) {
      return {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "User email not found in session"
        }
      }
    }
    
    const user = await db.query.UsersTable.findFirst({
      where: (users, { eq }) => eq(users.email, userEmail),
      with: {
        _profile: true
      }
    })
    
    if (!user) {
      return {
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "User not found in database"
        }
      }
    }
    
    return {
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user._profile
      },
      error: null
    }
  } catch (error) {
    console.error("Error getting logged user:", error)
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get logged user",
        cause: error
      }
    }
  }
}

export const getUserProfile = async (
  userId: string,
  db: DBClient
) => {
  try {
    const profile = await db.query.ProfilesTable.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, userId)
    })
    
    if (!profile) {
      return {
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found"
        }
      }
    }
    
    return {
      data: profile,
      error: null
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get user profile",
        cause: error
      }
    }
  }
}

export const updateUserProfile = async (
  userId: string,
  input: UpdateUserProfileInput,
  db: DBClient
) => {
  try {
    // Verificar se o perfil existe
    const existingProfile = await db.query.ProfilesTable.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, userId)
    })
    
    if (!existingProfile) {
      return {
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found"
        }
      }
    }
    
    // Atualizar o nome completo baseado no primeiro e último nome
    const fullName = `${input.firstName} ${input.lastName}`
    
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
        updatedAt: new Date()
      })
      .where(eq(ProfilesTable.userId, userId))
      .returning()
    
    return {
      data: updatedProfile,
      error: null
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user profile",
        cause: error
      }
    }
  }
}

export const deleteUserAccount = async (
  userId: string,
  input: DeleteUserAccountInput,
  db: DBClient,
  supabase: SupabaseClient
) => {
  try {
    // Buscar usuário para verificar se existe
    const user = await db.query.UsersTable.findFirst({
      where: (users, { eq }) => eq(users.id, userId)
    })
    
    if (!user) {
      return {
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "User not found"
        }
      }
    }
    
    // Verificar senha com Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: input.password
    })
    
    if (authError || !authData.session) {
      return {
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid password",
          cause: authError
        }
      }
    }
    
    // Excluir o usuário no Supabase
    const { error: deleteSupabaseError } = await supabase.auth.admin.deleteUser(
      authData.user.id
    )
    
    if (deleteSupabaseError) {
      return {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user in Supabase",
          cause: deleteSupabaseError
        }
      }
    }
    
    // Excluir o usuário no banco de dados
    // Nota: A exclusão em cascata deve excluir automaticamente o perfil
    await db.delete(UsersTable).where(eq(UsersTable.id, userId))
    
    return {
      data: { success: true },
      error: null
    }
  } catch (error) {
    console.error("Error deleting user account:", error)
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete user account",
        cause: error
      }
    }
  }
} 