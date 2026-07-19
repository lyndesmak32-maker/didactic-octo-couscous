import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import type { NetWorthData } from "~/types/finances";

interface SummaryCardsProps {
  netWorth: NetWorthData;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
}

export function SummaryCards({
  netWorth,
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
}: SummaryCardsProps) {
  const netWorthValue = netWorth.assets - netWorth.liabilities;

  const cards = [
    {
      label: "Net Worth",
      value: `$${netWorthValue.toLocaleString()}`,
      sub: `Assets $${netWorth.assets.toLocaleString()} · Liabilities $${netWorth.liabilities.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      ring: "ring-emerald-200 dark:ring-emerald-800",
    },
    {
      label: "Monthly Income",
      value: `$${monthlyIncome.toLocaleString()}`,
      sub: "After tax · All sources",
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      ring: "ring-blue-200 dark:ring-blue-800",
    },
    {
      label: "Monthly Expenses",
      value: `$${monthlyExpenses.toLocaleString()}`,
      sub: `This month · ${monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0}% of income`,
      icon: TrendingDown,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      ring: "ring-amber-200 dark:ring-amber-800",
    },
    {
      label: "Savings Rate",
      value: `${savingsRate}%`,
      sub: savingsRate >= 20 ? "Excellent — above 20% target" : savingsRate >= 10 ? "Good — keep pushing" : "Below target — review expenses",
      icon: PiggyBank,
      color: savingsRate >= 20 ? "text-emerald-500" : savingsRate >= 10 ? "text-amber-500" : "text-red-500",
      bg: savingsRate >= 20 ? "bg-emerald-50 dark:bg-emerald-950/40" : savingsRate >= 10 ? "bg-amber-50 dark:bg-amber-950/40" : "bg-red-50 dark:bg-red-950/40",
      ring: savingsRate >= 20 ? "ring-emerald-200 dark:ring-emerald-800" : savingsRate >= 10 ? "ring-amber-200 dark:ring-amber-800" : "ring-red-200 dark:ring-red-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`rounded-2xl border border-surface-200 bg-white p-5 transition-all duration-200 hover:border-surface-300 hover:shadow-lg dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 ${card.ring}`}
          >
            <div className="mb-3 flex items-center gap-2">
              <div className={`flex size-8 items-center justify-center rounded-lg ${card.bg}`}>
                <Icon className={`size-4 ${card.color}`} />
              </div>
              <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                {card.label}
              </span>
            </div>
            <p className="text-xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
              {card.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}
