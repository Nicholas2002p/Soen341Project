export interface GoogleProfile {
  email: string;
  firstName: string;
  lastName: string;
}

export interface IGoogleTokenVerifier {
  verify(idToken: string): Promise<GoogleProfile>;
}