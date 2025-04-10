import { type SupabaseClient } from "@supabase/supabase-js"
import type { DBClient } from "~/server/db/src/client"
import { ProfilesTable, UsersTable } from "~/server/db/src/schema/user"
import { v7 as uuidv7 } from "uuid"
import type { LoginInput, SignupInput } from "./auth.types"

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