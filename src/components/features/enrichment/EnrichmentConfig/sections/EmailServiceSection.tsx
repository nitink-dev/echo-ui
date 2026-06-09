import React, { useState, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Button } from '../../../../../components/ui/button';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const isValidEmail = (email: string) => EMAIL_REGEX.test(email.trim());


interface MultiEmailInputProps {
  label: string;
  emails: string[];
  disabled: boolean;
  onChange: (emails: string[]) => void;
}

function MultiEmailInput({ label, emails, disabled, onChange }: MultiEmailInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (!isValidEmail(trimmed)) {
      setInputError('Please enter a valid email address (e.g. user@example.com)');
      return;
    }
    if (emails.includes(trimmed)) {
      setInputError('This email is already added');
      return;
    }

    onChange([...emails, trimmed]);
    setInputValue('');
    setInputError('');
  }, [inputValue, emails, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        handleAdd();
      }
    },
    [handleAdd]
  );

  const handleRemove = useCallback(
    (index: number) => {
      onChange(emails.filter((_, i) => i !== index));
    },
    [emails, onChange]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (inputError) setInputError('');
  }, [inputError]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>

      {/* Existing email tags */}
      {emails.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md bg-gray-50 min-h-[40px]">
          {emails.map((email, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700"
            >
              {email}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                  aria-label={`Remove ${email}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Add new email — only show in edit mode */}
      {!disabled && (
        <div className="space-y-1">
          <div className="flex gap-2">
            <Input
              type="email"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter email and press Enter or click Add"
              className={inputError ? 'border-red-500 focus-visible:ring-red-400 flex-1' : 'flex-1'}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAdd}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {inputError && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <span>⚠</span> {inputError}
            </p>
          )}
          <p className="text-xs text-gray-400">
            Press <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Enter</kbd> or{' '}
            <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">,</kbd> to add
          </p>
        </div>
      )}

      {/* Empty state in view mode */}
      {disabled && emails.length === 0 && (
        <p className="text-sm text-gray-400 italic">No emails configured</p>
      )}
    </div>
  );
}


export function EmailServiceSection({ data, disabled, onChange }: any) {
  return (
    <div className="space-y-6 pb-4">

      {/* Email From — single address */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Email From</Label>
        <Input
          type="email"
          value={data.emailFrom ?? ''}
          disabled={disabled}
          onChange={(e) => onChange('emailFrom', e.target.value)}
          placeholder="sender@example.com"
        />
        {/* Inline format hint shown only when editing */}
        {!disabled && data.emailFrom && !isValidEmail(data.emailFrom) && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> Please enter a valid email address
          </p>
        )}
      </div>

      {/* Email To — multi address */}
      <MultiEmailInput
        label="Registered Email Ids for Enrichment Service Notification"
        emails={Array.isArray(data.emailTo) ? data.emailTo : []}
        disabled={disabled}
        onChange={(emails) => onChange('emailTo', emails)}
      />

      {/* Email Ibex To — multi address */}
      <MultiEmailInput
        label="Email Ibex To"
        emails={Array.isArray(data.emailIbexTo) ? data.emailIbexTo : []}
        disabled={disabled}
        onChange={(emails) => onChange('emailIbexTo', emails)}
      />

    </div>
  );
}