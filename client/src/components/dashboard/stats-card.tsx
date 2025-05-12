
import { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: number | string | ReactNode;
  bgColor: string;
  textColor: string;
}

export default function StatsCard({ icon, title, value, bgColor, textColor }: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${bgColor}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">
                {title}
              </dt>
              <dd>
                <div className={`text-lg font-medium ${textColor}`}>
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
