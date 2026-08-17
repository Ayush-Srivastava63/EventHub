import pool from '../db/pool';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, UserPublic, CreateUserDTO, LoginDTO, UpdateUserDTO, JwtPayload } from '../types';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 10;

/**
 * Generates a JWT for a given user.
 */
function generateToken(user: User): string {
  const payload: JwtPayload = { userId: user.id, role: user.role };
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', options);
}

/**
 * Strips password_hash from a user record before sending to the client.
 */
function sanitizeUser(user: User): UserPublic {
  const { password_hash, ...publicUser } = user;
  return publicUser;
}

// ─── Register ───

export async function registerUser(data: CreateUserDTO): Promise<{ user: UserPublic; token: string }> {
  // Check if email already exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [data.email]);
  if (existing.rows.length > 0) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const role = data.role || 'user';
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.name, data.email, passwordHash, role]
  );

  const user = result.rows[0] as User;
  const token = generateToken(user);

  return { user: sanitizeUser(user), token };
}

// ─── Login ───

export async function loginUser(data: LoginDTO): Promise<{ user: UserPublic; token: string }> {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [data.email]);

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = result.rows[0] as User;
  const isMatch = await bcrypt.compare(data.password, user.password_hash);

  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

// ─── Get Current User ───

export async function getUserById(userId: number): Promise<UserPublic> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  return sanitizeUser(result.rows[0] as User);
}

// ─── Update User Profile ───

export async function updateUser(userId: number, data: UpdateUserDTO): Promise<UserPublic> {
  // If changing email, check uniqueness
  if (data.email) {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [data.email, userId]);
    if (existing.rows.length > 0) {
      throw new AppError('Email already in use', 409);
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.email) {
    fields.push(`email = $${paramIndex++}`);
    values.push(data.email);
  }

  if (fields.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return sanitizeUser(result.rows[0] as User);
}
