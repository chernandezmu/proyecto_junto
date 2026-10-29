import { useEffect, useState } from 'react';

import { isAllowedEmail, useAuth } from './auth';
import { friendlyError } from './errors';

const RESEND_SECONDS = 45;

/** Estado compartido de "correo → código" para login y registro. */
export function useOtpFlow({ createUser, onVerified }: { createUser: boolean; onVerified?: () => Promise<void> | void }) {
  const { sendCode, verifyCode } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function send() {
    setEmailError(null);
    if (!isAllowedEmail(email)) {
      setEmailError('Por ahora Junto es solo para la Universidad El Bosque. Usa tu correo @unbosque.edu.co.');
      return false;
    }
    setBusy(true);
    try {
      await sendCode(email, createUser);
      setStep('code');
      setCode('');
      setCodeError(null);
      setWait(RESEND_SECONDS);
      return true;
    } catch (e) {
      setEmailError(friendlyError(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function verify(value = code) {
    if (value.length !== 6 || busy) return;
    setBusy(true);
    setCodeError(null);
    try {
      await verifyCode(email, value);
      await onVerified?.();
    } catch (e) {
      setCodeError(friendlyError(e, 'Ese código no coincide. Revisa el último correo que te enviamos.'));
      setCode('');
    } finally {
      setBusy(false);
    }
  }

  return {
    email,
    setEmail: (v: string) => {
      setEmail(v);
      setEmailError(null);
    },
    code,
    setCode: (v: string) => {
      setCode(v);
      setCodeError(null);
      if (v.length === 6) verify(v);
    },
    step,
    back: () => setStep('email'),
    emailError,
    codeError,
    busy,
    wait,
    send,
    verify: () => verify(),
  };
}
