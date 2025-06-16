import { Role } from './role.model';
import { EquipeDto } from './equipe.model';
import { CandidatureDto } from './candidature.model';

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  password?: string;  // Optional to make it not required for responses
  role: Role;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;  // Optional since it's not always returned in responses
  role: Role;
  equipe?: EquipeDto;  // Optional - referenced via DBRef
  candidatures?: CandidatureDto[];  // Optional - referenced via DBRef
  
  // Additional fields used in the UI
  status?: 'active' | 'inactive' | 'pending';
  department?: string;
  joinDate?: Date;
  lastLogin?: Date;
}
