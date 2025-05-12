import { Button } from "@/components/ui/button";

interface PlanCardProps {
  name: string;
  price: number;
  features: string[];
  isActive?: boolean;
  isPopular?: boolean;
  onSelect: () => void;
}

export default function PlanCard({
  name,
  price,
  features,
  isActive = false,
  isPopular = false,
  onSelect,
}: PlanCardProps) {
  return (
    <div
      className={`relative rounded-lg overflow-hidden border transition-all duration-200 ${
        isActive
          ? "border-primary shadow-md bg-primary-50"
          : isPopular
          ? "border-primary shadow-md"
          : "border-neutral-200"
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 inset-x-0 px-4 py-1 bg-primary text-white text-center text-xs font-medium">
          Most Popular
        </div>
      )}

      <div className={`p-6 ${isPopular ? "pt-8" : ""}`}>
        <h3 className="text-lg font-semibold text-neutral-900">{name}</h3>

        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold tracking-tight text-neutral-900">
            ${price}
          </span>
          {price > 0 && (
            <span className="ml-1 text-sm font-medium text-neutral-500">/month</span>
          )}
        </div>

        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="shrink-0 flex items-center h-6">
                <svg
                  className="h-5 w-5 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="ml-3 text-neutral-600">{feature}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Button
            className="w-full"
            variant={isActive ? "outline" : isPopular ? "default" : "secondary"}
            onClick={onSelect}
            disabled={isActive}
          >
            {isActive ? "Current Plan" : "Select Plan"}
          </Button>
        </div>
      </div>
    </div>
  );
}