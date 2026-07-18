import { createFileRoute } from "@tanstack/react-router";
import { Settings, Bell, Shield, Palette, User } from "lucide-react";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const settingsGroups = [
    {
      icon: User,
      label: "Profile",
      items: ["Name", "Email", "Avatar", "Preferences"],
    },
    {
      icon: Bell,
      label: "Notifications",
      items: ["Push", "Email", "Reminders", "Digest frequency"],
    },
    {
      icon: Palette,
      label: "Appearance",
      items: ["Theme", "Font size", "Density", "Sidebar position"],
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      items: ["Data encryption", "Export data", "Delete account", "Passkey"],
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Settings</h2>
        <p className="mt-1 text-surface-500 dark:text-surface-400">Manage your LifeOS preferences and account.</p>
      </div>

      <div className="space-y-4">
        {settingsGroups.map((group) => {
          const Icon = group.icon;
          return (
            <div
              key={group.label}
              className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900"
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon className="size-4 text-surface-400" />
                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                  {group.label}
                </h3>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-surface-500 transition-colors hover:bg-surface-50 dark:text-surface-400 dark:hover:bg-surface-800"
                  >
                    <span>{item}</span>
                    <Settings className="size-3.5 text-surface-300 dark:text-surface-600" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
