import { useState, FormEvent } from 'react';
import { C, RADII } from '@/design/tokens';
import { Field, inputStyle } from '@/components/ui/Field';
import { useAuth } from './authStore';

export function LoginPage() {
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email, password);
      // Bei Erfolg übernimmt onAuthStateChange das Weiterleiten (AuthGate rendert die App).
    } catch (err) {
      setError(
        (err as Error).message === 'Invalid login credentials'
          ? 'E-Mail oder Passwort ist falsch.'
          : (err as Error).message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form
        onSubmit={onSubmit}
        style={{ width: '100%', maxWidth: 360, background: C.surface, borderRadius: RADII.lg, padding: 28, boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48 }}>태</div>
          <h1 style={{ color: C.primary, margin: '6px 0 2px', fontSize: 22 }}>TKD Trainer</h1>
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>Trainer-Anmeldung</p>
        </div>

        <Field label="E-Mail">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            style={inputStyle}
          />
        </Field>
        <Field label="Passwort">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            style={inputStyle}
          />
        </Field>

        {error && (
          <div style={{ color: C.danger, fontSize: 13, marginBottom: 10 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: '100%', padding: '11px 12px', marginTop: 4,
            background: busy ? C.borderStrong : C.primary, color: '#fff',
            border: 'none', borderRadius: RADII.sm, fontSize: 15, fontWeight: 600,
            cursor: busy ? 'default' : 'pointer'
          }}
        >
          {busy ? 'Anmelden …' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
