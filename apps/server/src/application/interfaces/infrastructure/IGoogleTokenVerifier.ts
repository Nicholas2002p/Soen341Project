export interface GoogleProfile {
  email: string;
}

export interface IGoogleTokenVerifier {
  verify(idToken: string): Promise<GoogleProfile>;
}