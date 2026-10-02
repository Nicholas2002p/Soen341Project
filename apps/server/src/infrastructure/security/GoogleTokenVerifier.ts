import { OAuth2Client } from 'google-auth-library';
import { GoogleProfile, IGoogleTokenVerifier } from '../../application/interfaces/infrastructure/IGoogleTokenVerifier.js';

export class GoogleTokenVerifier implements IGoogleTokenVerifier {
  private readonly client: OAuth2Client;

  constructor(private readonly clientId: string) {
    this.client = new OAuth2Client(clientId);
  }

  async verify(idToken: string): Promise<GoogleProfile> {
    try {
      const ticket = await this.client.verifyIdToken({ idToken, audience: this.clientId });
      const payload = ticket.getPayload();

      if (!payload?.email || !payload.email_verified) {
        throw new Error('Google account has no verified email');
      }

      return {
        email: payload.email,
        firstName: payload.given_name ?? '',
        lastName: payload.family_name ?? '',
      };
    } catch {
      const error = new Error('Invalid Google token');
      error.name = 'InvalidGoogleTokenError';
      throw error;
    }
  }
}