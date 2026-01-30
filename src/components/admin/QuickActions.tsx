import Link from 'next/link';
import { 
  ClipboardList, 
  Building2, 
  Star, 
  Users, 
  BarChart3,
  Settings
} from 'lucide-react';

interface Props {
  pendingCount: number;
}

const actions = [
  {
    name: 'Review Submissions',
    href: '/admin/submissions',
    icon: ClipboardList,
    color: 'bg-amber-500 hover:bg-amber-600', // Muted amber
  },
  {
    name: 'Brand Applications',
    href: '/admin/brand-applications',
    icon: Building2,
    color: 'bg-amber-800 hover:bg-amber-900', // Warm brown / sand
  },
  {
    name: 'Featured Content',
    href: '/admin/featured',
    icon: Star,
    color: 'bg-rose-500 hover:bg-rose-600', // Dusty mauve
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    color: 'bg-lime-700 hover:bg-lime-800', // Olive
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    color: 'bg-sky-600 hover:bg-sky-700',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    color: 'bg-gray-600 hover:bg-gray-700',
  },
];

export default function QuickActions({ pendingCount }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions. map((action) => {
          const Icon = action.icon;
          const isPending = action.href === '/admin/submissions' || action.href === '/admin/brand-applications';
          
          return (
            <Link
              key={action.name}
              href={action.href}
              className="relative group"
            >
              <div className={`${action.color} text-white p-6 rounded-xl transition-all transform group-hover:scale-105`}>
                <Icon className="w-8 h-8 mb-3" />
                <p className="text-sm font-medium">{action.name}</p>
                {isPending && pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}