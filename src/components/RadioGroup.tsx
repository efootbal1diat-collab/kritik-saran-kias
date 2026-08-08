"use client";

interface RadioGroupProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function RadioGroup({ options, value, onChange, label }: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              value === option
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name={label}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm font-medium text-slate-900">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
