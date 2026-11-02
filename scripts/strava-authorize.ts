/**
 * Autorisation Strava, à faire UNE SEULE FOIS.
 *
 *   npm run strava:auth            → affiche l'URL à ouvrir dans le navigateur
 *   npm run strava:auth -- <code>  → échange le code contre un refresh token
 *
 * Le refresh token obtenu ne périme pas : il va dans .env.local, puis dans les
 * variables d'environnement de l'hébergeur. Ensuite `fetch:data` se débrouille seul.
 */
import './load-env';

const REDIRECT_URI = 'http://localhost/exchange_token';
const SCOPE = 'activity:read';

function fail(message: string): never {
  console.error(`\n[strava-authorize] ${message}\n`);
  process.exit(1);
}

async function exchange(clientId: string, clientSecret: string, code: string): Promise<void> {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });

  const payload = (await response.json()) as {
    refresh_token?: string;
    athlete?: { firstname?: string };
    message?: string;
    errors?: unknown;
  };

  if (!response.ok || !payload.refresh_token) {
    fail(
      `exchange failed (${response.status}): ${payload.message ?? 'unknown error'}\n` +
        'Un code d’autorisation ne sert qu’une fois — relance sans argument pour en obtenir un nouveau.',
    );
  }

  const who = payload.athlete?.firstname ? ` for ${payload.athlete.firstname}` : '';
  console.log(`\n✅ Refresh token obtained${who}. Add this line to .env.local:\n`);
  console.log(`STRAVA_REFRESH_TOKEN=${payload.refresh_token}\n`);
}

async function main(): Promise<void> {
  const clientId = process.env.STRAVA_CLIENT_ID?.trim();
  const clientSecret = process.env.STRAVA_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    fail(
      'Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in .env.local first.\n' +
        'Create the API application at https://www.strava.com/settings/api',
    );
  }

  const code = process.argv[2]?.trim();

  if (!code) {
    const url = new URL('https://www.strava.com/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('approval_prompt', 'force');
    url.searchParams.set('scope', SCOPE);

    console.log('\n1. Ouvre cette URL dans ton navigateur et autorise :\n');
    console.log(`   ${url.toString()}\n`);
    console.log('2. Strava renvoie vers une page en erreur (c’est normal, rien n’écoute');
    console.log('   sur localhost). Copie la valeur de `code=` dans la barre d’adresse.\n');
    console.log('3. Relance :\n');
    console.log('   npm run strava:auth -- LE_CODE\n');
    return;
  }

  await exchange(clientId, clientSecret, code);
}

main().catch((error: unknown) => {
  fail((error as Error).message);
});
