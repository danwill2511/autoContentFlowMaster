import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number | React.ReactNode;
  bgColor: string;
  textColor: string;
}

export function StatsCard({ icon, title, value, bgColor, textColor }: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-neutral-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
