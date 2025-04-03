export interface CreateUserDto {
  email: string;
  password: string;
  role: string;
  name: string;
  phone: string;
  gender: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ResetPasswordDto {
  code: string;
  password: string;
}
