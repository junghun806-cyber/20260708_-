interface TrashTypeStyle {
  icon: string;
  classes: string;
}

const TRASH_TYPE_STYLES: Record<string, TrashTypeStyle> = {
  일반쓰레기: {
    icon: "🗑️",
    classes: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  재활용쓰레기: {
    icon: "♻️",
    classes:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  담배꽁초: {
    icon: "🚬",
    classes:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  },
};

const FALLBACK_STYLE: TrashTypeStyle = {
  icon: "❔",
  classes: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export interface TrashTypeBadge extends TrashTypeStyle {
  label: string;
}

export function getTrashTypeBadges(type: string): TrashTypeBadge[] {
  return type
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((label) => ({
      label,
      ...(TRASH_TYPE_STYLES[label] ?? FALLBACK_STYLE),
    }));
}
