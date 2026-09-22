import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  prefixAdornment?: React.ReactNode;
  suffixAdornment?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  errorText,
  prefixAdornment,
  suffixAdornment,
  fullWidth = true,
  className = '',
  id,
  disabled,
  ...rest
}) => {
  const generatedId = id || React.useId();

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={generatedId}
          className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono select-none flex items-center justify-between"
        >
          <span>{label}</span>
        </label>
      )}

      <div
        className={`relative flex items-center bg-slate-950 border rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-cyan-500/40 ${
          errorText
            ? 'border-rose-500/80 focus-within:border-rose-500'
            : 'border-slate-800 focus-within:border-cyan-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
      >
        {prefixAdornment && (
          <div className="pl-3 pr-2 text-slate-500 shrink-0 font-mono text-xs select-none">
            {prefixAdornment}
          </div>
        )}

        <input
          id={generatedId}
          disabled={disabled}
          className={`w-full py-2.5 px-3 bg-slate-950 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none min-h-[44px] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] [&:-webkit-autofill]:bg-slate-950 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#020617_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff] ${
            prefixAdornment ? 'pl-0' : ''
          } ${suffixAdornment ? 'pr-0' : ''} ${className}`}
          {...rest}
        />

        {suffixAdornment && (
          <div className="pr-3 pl-2 text-slate-400 shrink-0 font-mono text-xs font-bold select-none">
            {suffixAdornment}
          </div>
        )}
      </div>

      {errorText && (
        <span className="text-[11px] font-mono text-rose-400 flex items-center gap-1 mt-0.5">
          ⚠️ {errorText}
        </span>
      )}

      {!errorText && helperText && (
        <span className="text-[11px] font-mono text-slate-500 mt-0.5">{helperText}</span>
      )}
    </div>
  );
};
