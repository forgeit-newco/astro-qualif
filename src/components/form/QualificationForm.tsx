import { useState, useRef } from 'react';
import { Box, Button, Divider, CircularProgress, Alert } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';
import type { ProspectFormData } from '../../types/prospect';

// Workaround for ReCAPTCHA type issue with React 19
const ReCaptchaComponent = ReCAPTCHA as unknown as React.ComponentType<{
  ref?: React.Ref<{ reset: () => void }>;
  sitekey: string;
  onChange: (token: string | null) => void;
}>;
import { IdentityBlock } from './IdentityBlock';
import { TechEcosystemBlock } from './TechEcosystemBlock';
import { DiagnosticBlock } from './DiagnosticBlock';
import { ChallengesBlock } from './ChallengesBlock';
import { CTABlock } from './CTABlock';

// reCAPTCHA site key from environment
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

interface QualificationFormProps {
  onSubmit: (data: ProspectFormData) => void;
  isSubmitting?: boolean;
}

const defaultValues: ProspectFormData = {
  identity: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: 'Tech Lead',
  },
  techEcosystem: {
    teamSize: '<40',
    forges: [],
    clouds: [],
    deployments: [],
    ticketManagers: [],
    monitoringTools: [],
  },
  diagnostic: {
    maturityLevel: 'Industrialisation',
  },
  challenges: {
    priorities: [],
  },
  cta: {
    wantsDiagnostic: false,
    wantsTrial: false,
  },
};

export function QualificationForm({ onSubmit, isSubmitting = false }: QualificationFormProps) {
  const methods = useForm<ProspectFormData>({
    defaultValues,
    mode: 'onBlur',
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const recaptchaRef = useRef<{ reset: () => void } | null>(null);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (token) {
      setCaptchaError(false);
    }
  };

  const handleSubmit = methods.handleSubmit((data) => {
    if (!captchaToken) {
      setCaptchaError(true);
      return;
    }
    onSubmit(data);
    methods.reset(defaultValues);
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
  });

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <IdentityBlock />
        <Divider />
        <TechEcosystemBlock />
        <Divider />
        <DiagnosticBlock />
        <Divider />
        <ChallengesBlock />
        <Divider />
        <CTABlock />

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 2 }}>
          <ReCaptchaComponent
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={handleCaptchaChange}
          />
          {captchaError && (
            <Alert severity="error" sx={{ width: '100%', maxWidth: 304 }}>
              Veuillez valider le CAPTCHA
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            disabled={isSubmitting}
            sx={{ minWidth: 200 }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Soumettre la qualification'
            )}
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
}
