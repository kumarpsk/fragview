"use client";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordInputProps = {
  label?: string;
  value?: string;
  error?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
};

export default function PasswordInput({
  label = "Password",
  value,
  error,
  placeholder = "Enter your password",
  onChange,
}: PasswordInputProps) {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label */}
      <label className="text-lg  font-medium text-[#211F1C]">
        {label}
      </label>

      {/* Input Wrapper */}
      <div className="relative">
        <input
          type={showPw ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full h-[50px] px-4 pr-12 rounded-xl 
            bg-white text-black text-base
            border transition-all outline-none
            focus:border-[#211F1C]
            ${
              error
                ? "border-[#DC2626]"
                : "border-[#C4C4C3] hover:border-[#211F1C]"
            }
          `}
        />

        {/* Eye Button */}
        <button
          type="button"
          aria-label={showPw ? "Hide password" : "Show password"}
          onClick={() => setShowPw((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#737270] hover:text-[#211F1C] transition-colors"
        >
          {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-[#DC2626]">{error}</p>}
    </div>
  );
}
