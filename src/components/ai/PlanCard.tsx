import { CheckCircle2, Circle, Target } from "lucide-react";
import { useState } from "react";
import type { Plan } from "~/ai/planner";
import { updatePlanStep } from "~/ai/planner";

interface PlanCardProps {
  plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const [steps, setSteps] = useState(plan.steps);

  const toggleStep = (index: number) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], completed: !newSteps[index].completed };
    setSteps(newSteps);
    updatePlanStep(plan.id, index, newSteps[index].completed);
  };

  const completed = steps.filter((s) => s.completed).length;
  const progressPct = Math.round((completed / steps.length) * 100);

  return (
    <div className="w-full rounded-xl border border-accent-200 bg-white p-4 shadow-sm dark:border-accent-800 dark:bg-surface-800/50">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/50 dark:text-accent-400">
          <Target className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
            {plan.goal}
          </p>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {completed}/{steps.length} steps · {progressPct}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1.5 w-full rounded-full bg-surface-100 dark:bg-surface-700">
        <div
          className="h-full rounded-full bg-accent-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-1.5">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => toggleStep(i)}
            className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
          >
            {step.completed ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="mt-0.5 size-4 shrink-0 text-surface-400 dark:text-surface-500" />
            )}
            <div className="min-w-0">
              <p
                className={`text-sm font-medium ${
                  step.completed
                    ? "text-surface-400 line-through dark:text-surface-500"
                    : "text-surface-900 dark:text-surface-100"
                }`}
              >
                {step.title}
              </p>
              <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
