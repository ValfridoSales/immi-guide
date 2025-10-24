import { Check, X } from 'lucide-react';
import { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    
    return {
      checks,
      passedChecks,
      level: passedChecks <= 1 ? 'weak' : passedChecks <= 2 ? 'medium' : 'strong',
      percentage: (passedChecks / 4) * 100,
    };
  }, [password]);

  if (!password) return null;

  const getColor = () => {
    switch (strength.level) {
      case 'weak':
        return 'bg-destructive';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-muted';
    }
  };

  const requirements = [
    { key: 'minLength', label: 'Mínimo 8 caracteres' },
    { key: 'hasUpperCase', label: 'Letra maiúscula' },
    { key: 'hasNumber', label: 'Número' },
    { key: 'hasSpecialChar', label: 'Caractere especial' },
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Força da senha</span>
          <span className={`font-medium ${
            strength.level === 'weak' ? 'text-destructive' :
            strength.level === 'medium' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {strength.level === 'weak' ? 'Fraca' :
             strength.level === 'medium' ? 'Média' :
             'Forte'}
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {requirements.map((req) => {
          const isValid = strength.checks[req.key as keyof typeof strength.checks];
          return (
            <div
              key={req.key}
              className={`flex items-center gap-1.5 transition-colors ${
                isValid ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              {isValid ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
              <span>{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
