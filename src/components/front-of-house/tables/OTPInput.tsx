import React from 'react';
import { Slot } from '@radix-ui/react-slot';

type OTPInputProps = {
    length?: number;
    value: string;
    onChange: (value: string) => void;
};

export const OTPInput = ({ length = 6, value, onChange }: OTPInputProps) => {
    const inputsRef = React.useRef<HTMLInputElement[]>([]);
    const digits = Array.from({ length }, (_, index) => value[index] ?? '');

    const emitChange = (nextDigits: string[]) => {
        onChange(nextDigits.join('').slice(0, length));
    };

    const handleChange = (val: string, index: number) => {
        const digit = val.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = digit;
        emitChange(next);

        if (digit && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        if (e.key === 'Backspace') {
            if (digits[index]) {
                const next = [...digits];
                next[index] = '';
                emitChange(next);
                return;
            }
            if (index > 0) {
                inputsRef.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const paste = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, length);
        if (!paste) return;
        onChange(paste);
        inputsRef.current[Math.min(paste.length, length) - 1]?.focus();
    };

    return (
        <div className="mx-auto mt-4 flex gap-2" onPaste={handlePaste}>
            {digits.map((digit, index) => (
                <Slot key={index}>
                    <input
                        ref={(el) => {
                            if (el) inputsRef.current[index] = el;
                        }}
                        value={digit}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        aria-label={`PIN digit ${index + 1}`}
                        style={{
                            width: '48px',
                            height: '48px',
                            textAlign: 'center',
                            fontSize: '18px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                        }}
                    />
                </Slot>
            ))}
        </div>
    );
};
