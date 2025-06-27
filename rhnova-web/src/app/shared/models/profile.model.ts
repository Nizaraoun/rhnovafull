export interface ProfileDto {
  id?: string;
  userId: string;
  dateDeNaissance?: string;
  ville?: string;
  pays?: string;
  codePostal?: string;
  phoneNumber?: string;
  profession?: string;
  formations?: string[];
  experiences?: string[];
  competences?: string[];
  langues?: string[];
  certifications?: string[];
  projets?: string[];
  description?: string;
  photoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProfileRequest {
  dateDeNaissance?: string;
  ville?: string;
  pays?: string;
  codePostal?: string;
  phoneNumber?: string;
  profession?: string;
  formations?: string[];
  experiences?: string[];
  competences?: string[];
  langues?: string[];
  certifications?: string[];
  projets?: string[];
  description?: string;
}

export interface UpdateProfileRequest extends Partial<CreateProfileRequest> {}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data?: ProfileDto;
}

export interface UploadPhotoResponse {
  success: boolean;
  message: string;
  photoUrl?: string;
}
