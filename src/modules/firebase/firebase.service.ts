import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
    constructor(private readonly config: ConfigService) { }

    onModuleInit() {
        if (admin.apps.length) return;
        admin.initializeApp({ credential: this.resolveCredential() });
    }

    private resolveCredential(): admin.credential.Credential {
        const configuredPath = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
        const defaultPath = join(process.cwd(), 'firebase-service-account.json');
        const filePath = configuredPath || (existsSync(defaultPath) ? defaultPath : undefined);

        if (filePath) {
            if (!existsSync(filePath)) {
                throw new Error(`No se encontró el archivo de Service Account en: ${filePath}`);
            }
            const serviceAccount = JSON.parse(readFileSync(filePath, 'utf8'));
            return admin.credential.cert(serviceAccount);
        }

        const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
        const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');
        const privateKey = this.config
            .get<string>('FIREBASE_PRIVATE_KEY')
            ?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
            throw new Error(
                'Faltan credenciales de Firebase. Opción A (recomendada): poné el archivo "firebase-service-account.json" en la raíz de bosward-back. ' +
                'Opción B: completá FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en el .env.',
            );
        }

        return admin.credential.cert({ projectId, clientEmail, privateKey });
    }

    get auth(): admin.auth.Auth {
        return admin.auth();
    }
}
