import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '..', 'firebase-service-account.json'), 'utf8'),
);

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const email = process.argv[2];
const role = process.argv[3] ?? 'SUPERADMIN';

if (!email) {
    console.error('Uso: node scripts/set-admin.mjs tu-email@ejemplo.com [ROL]');
    console.error('Roles: CLIENTE | ADMINISTRADOR | SUPERADMIN (default: SUPERADMIN)');
    process.exit(1);
}

try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role });
    console.log(`✅ ${email} ahora tiene rol ${role}.`);
    console.log('⚠️ Cerrá sesión y volvé a iniciar sesión para refrescar el token.');
    process.exit(0);
} catch (error) {
    if (error.code === 'auth/user-not-found') {
        console.error(`❌ No existe un usuario con el email ${email}.`);
        console.error('   Primero iniciá sesión una vez en la app (con Google o email) para crear la cuenta, y volvé a correr esto.');
    } else {
        console.error('❌ Error:', error.message);
    }
    process.exit(1);
}
