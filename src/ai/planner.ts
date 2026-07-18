export interface PlanStep {
  title: string;
  description: string;
  completed: boolean;
}

export interface Plan {
  id: string;
  goal: string;
  steps: PlanStep[];
  createdAt: string;
  category: string;
}

const STORAGE_KEY = "lifeos-ai-plans";

export function getPlans(): Plan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePlans(plans: Plan[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function addPlan(plan: Plan): void {
  const plans = getPlans();
  plans.unshift(plan);
  savePlans(plans);
}

export function updatePlanStep(
  planId: string,
  stepIndex: number,
  completed: boolean,
): void {
  const plans = getPlans();
  const plan = plans.find((p) => p.id === planId);
  if (plan && plan.steps[stepIndex]) {
    plan.steps[stepIndex].completed = completed;
    savePlans(plans);
  }
}

export function deletePlan(planId: string): void {
  savePlans(getPlans().filter((p) => p.id !== planId));
}

/**
 * Generate a step-by-step plan from a user goal.
 * Uses pattern matching to create realistic, structured plans.
 */
export function generatePlan(input: string): Plan | null {
  const lower = input.toLowerCase();

  // Weight loss goal
  const weightMatch = input.match(
    /(?:i want to )?lose (\d+)\s*(?:pounds|lbs?|kg)/i,
  );
  if (weightMatch) {
    const amount = weightMatch[1];
    return {
      id: crypto.randomUUID(),
      goal: `Lose ${amount} pounds`,
      steps: [
        {
          title: "Set your nutrition baseline",
          description: `Track everything you eat for 1 week to understand your current calorie intake. Use a food diary or app.`,
          completed: false,
        },
        {
          title: "Create a calorie deficit",
          description: `Aim for a 500-calorie daily deficit through diet and exercise. That's about 1 lb per week — you'll reach your goal in approximately ${Math.ceil(Number(amount))} weeks.`,
          completed: false,
        },
        {
          title: "Start a consistent exercise routine",
          description:
            "Combine 3x/week strength training with 2x/week cardio. Start with 30-minute sessions and build up.",
          completed: false,
        },
        {
          title: "Increase daily movement",
          description:
            "Aim for 10,000 steps/day. Take walking breaks, use stairs, park farther away.",
          completed: false,
        },
        {
          title: "Prioritize protein and vegetables",
          description:
            "Fill half your plate with vegetables, quarter with lean protein, quarter with whole grains at every meal.",
          completed: false,
        },
        {
          title: "Track weekly progress",
          description:
            "Weigh yourself every Monday morning. Take progress photos every 2 weeks. Adjust if progress stalls.",
          completed: false,
        },
        {
          title: "Celebrate milestones",
          description: `Every 5 lbs lost, reward yourself with something non-food related — new workout gear, a massage, or a fun experience.`,
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
      category: "health",
    };
  }

  // Saving money
  const saveMatch = input.match(
    /(?:i want to )?save \$?([\d,]+)/i,
  );
  if (saveMatch) {
    const amount = saveMatch[1].replace(/,/g, "");
    const numAmount = Number(amount);
    const monthly = Math.round(numAmount / 12);
    const weekly = Math.round(numAmount / 52);

    return {
      id: crypto.randomUUID(),
      goal: `Save $${Number(amount).toLocaleString()}`,
      steps: [
        {
          title: "Audit your spending",
          description:
            "Review the last 3 months of expenses. Categorize everything and identify non-essential spending you can reduce.",
          completed: false,
        },
        {
          title: "Set up automatic savings",
          description: `Set up an automatic transfer of $${monthly.toLocaleString()}/month (about $${weekly}/week) to a dedicated savings account.`,
          completed: false,
        },
        {
          title: "Cut one major expense",
          description:
            "Review subscriptions, dining out, and impulse purchases. Target cutting $200-300/month by eliminating or reducing one category.",
          completed: false,
        },
        {
          title: "Create a monthly budget",
          description:
            "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Track every dollar for the first 2 months.",
          completed: false,
        },
        {
          title: "Find extra income streams",
          description:
            "Consider freelancing, selling unused items, or a side gig. Even $200/month extra accelerates your goal by months.",
          completed: false,
        },
        {
          title: "Monthly check-in",
          description:
            "Review your progress on the 1st of each month. Adjust your plan if you're falling behind or can save more.",
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
      category: "finance",
    };
  }

  // Start a business
  if (
    lower.includes("start a business") ||
    lower.includes("start my own business")
  ) {
    const businessType =
      input.match(/start (?:a |an |my own )?(.+?) business/i)?.[1] ?? "";
    const goal = businessType
      ? `Start a ${businessType} business`
      : "Start a business";

    return {
      id: crypto.randomUUID(),
      goal,
      steps: [
        {
          title: "Validate your idea",
          description:
            "Talk to 20 potential customers. Identify their pain points. Make sure people will actually pay for your solution.",
          completed: false,
        },
        {
          title: "Research the market",
          description:
            "Analyze competitors. Identify your unique angle. Understand pricing, target audience, and market size.",
          completed: false,
        },
        {
          title: "Create a lean business plan",
          description:
            "Write a 1-page plan: problem, solution, target market, revenue model, and key metrics. Keep it simple.",
          completed: false,
        },
        {
          title: "Set up legal & financial basics",
          description:
            "Register your business name, get an EIN, open a separate business bank account, and understand your tax obligations.",
          completed: false,
        },
        {
          title: "Build a minimum viable product",
          description:
            "Create the simplest version of your product/service that solves the core problem. Launch in 4-6 weeks max.",
          completed: false,
        },
        {
          title: "Get your first 10 customers",
          description:
            "Offer beta pricing, ask for feedback, iterate quickly. These early customers are your best source of learning.",
          completed: false,
        },
        {
          title: "Establish your online presence",
          description:
            "Set up a simple website, social media profiles, and a way for customers to find and contact you.",
          completed: false,
        },
        {
          title: "Scale what works",
          description:
            "Double down on your most effective customer acquisition channel. Systematize operations. Hire your first contractor if needed.",
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
      category: "goals",
    };
  }

  // Learn something
  const learnMatch = input.match(
    /(?:i want to )?learn (?:to |how to )?(.+)/i,
  );
  if (learnMatch) {
    const skill = learnMatch[1].trim();
    return {
      id: crypto.randomUUID(),
      goal: `Learn ${skill}`,
      steps: [
        {
          title: "Define your learning goal",
          description: `Get specific: what does "learning ${skill}" mean to you? Set a clear, measurable target (e.g., "build a web app" or "have a 5-minute conversation").`,
          completed: false,
        },
        {
          title: "Find the best resources",
          description:
            "Research the top 3-5 books, courses, or tutorials. Pick one primary resource and start there — don't get stuck in research mode.",
          completed: false,
        },
        {
          title: "Schedule dedicated practice time",
          description:
            "Block 30-60 minutes daily (or 3-4 hours weekly) for focused learning. Consistency beats intensity.",
          completed: false,
        },
        {
          title: "Apply immediately",
          description:
            "After each learning session, apply what you learned. Build something, write about it, or teach it to someone else.",
          completed: false,
        },
        {
          title: "Find a community or mentor",
          description:
            "Join online communities, find a study buddy, or get a mentor. Learning is faster with feedback and accountability.",
          completed: false,
        },
        {
          title: "Track milestones",
          description:
            "Set intermediate goals. Celebrate when you hit them. Adjust your approach if you're not making progress after 2-3 weeks.",
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
      category: "goals",
    };
  }

  // Run a marathon / race
  const raceMatch = input.match(
    /(?:i want to )?run (?:a |an )?(marathon|half marathon|10k|5k)/i,
  );
  if (raceMatch) {
    const race = raceMatch[1];
    return {
      id: crypto.randomUUID(),
      goal: `Run a ${race}`,
      steps: [
        {
          title: "Get the right gear",
          description:
            "Invest in proper running shoes (get fitted at a running store). Get moisture-wicking clothes and a running watch or app.",
          completed: false,
        },
        {
          title: "Start with a base-building phase",
          description:
            "Run 3-4 times per week for 3-4 weeks at an easy, conversational pace. Build up to running 30 minutes comfortably.",
          completed: false,
        },
        {
          title: "Follow a structured training plan",
          description: `Find a beginner ${race} training plan (typically 12-16 weeks). Include 1 long run, 2-3 easy runs, and 1 speed workout per week.`,
          completed: false,
        },
        {
          title: "Cross-train and strengthen",
          description:
            "Add 1-2 days of strength training and cross-training (cycling, swimming, yoga) to prevent injuries and build overall fitness.",
          completed: false,
        },
        {
          title: "Dial in your nutrition",
          description:
            "Practice fueling during long runs. Find what works for pre-run meals, mid-run fuel, and post-run recovery.",
          completed: false,
        },
        {
          title: "Register for the race",
          description:
            "Pick a race date that gives you enough time to train. Sign up — the commitment will keep you motivated!",
          completed: false,
        },
        {
          title: "Taper and race day prep",
          description:
            "Reduce mileage 2-3 weeks before the race. Plan your race-day logistics: what to wear, eat, and how to get there.",
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
      category: "health",
    };
  }

  // Generic goal
  if (lower.includes("i want to")) {
    const goal = input.replace(/^i want to\s+/i, "").trim();
    return {
      id: crypto.randomUUID(),
      goal: goal.charAt(0).toUpperCase() + goal.slice(1),
      steps: [
        {
          title: "Define your goal clearly",
          description: `Get specific about what "${goal}" means. What does success look like? Set a measurable target with a deadline.`,
          completed: false,
        },
        {
          title: "Break it into milestones",
          description:
            "Divide your goal into 3-5 smaller milestones. Each one should be achievable in 1-2 weeks.",
          completed: false,
        },
        {
          title: "Identify resources needed",
          description:
            "List what you'll need: time, money, tools, skills, or help from others. Start acquiring what's missing.",
          completed: false,
        },
        {
          title: "Create a weekly action plan",
          description:
            "Schedule specific actions each week. Block time on your calendar and treat it as non-negotiable.",
          completed: false,
        },
        {
          title: "Track and adjust",
          description:
            "Review progress weekly. What's working? What's not? Adjust your approach based on real data.",
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
      category: "goals",
    };
  }

  return null;
}
