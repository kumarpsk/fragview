import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: number | string;
  change?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const colorClasses: Record<Props['color'], string> = {
  blue: 'bg-[#E0F2FE] text-[#1D4ED8]',
  green: 'bg-[#DCFCE7] text-[#15803D]',
  orange: 'bg-[#FFEDD5] text-[#C05621]',
  purple: 'bg-[#EDE9FE] text-[#6D28D9]',
};

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: Props) {
  const displayValue =
    typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div className="bg-[#FFF4E3] rounded-2xl border border-[#E2E1E1] p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-xs font-[var(--font-inter)] font-medium text-[#737270] mb-1 uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-3xl font-hedvig text-[#211F1C]">{displayValue}</p>
      {change && (
        <p className="text-sm font-[var(--font-inter)] text-[#4A4946] mt-2">
          {change}
        </p>
      )}
    </div>
  );
}