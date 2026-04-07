import { useMemo } from "react";

function getScore(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const LEVELS = [
  { label: "", color: "" },
  { label: "Weak", color: "bg-red-400" },
  { label: "Fair", color: "bg-amber-400" },
  { label: "Good", color: "bg-sage-muted" },
  { label: "Strong", color: "bg-sage-dark" },
];

export default function PasswordStrengthMeter({ password }) {
  const score = useMemo(() => getScore(password), [password]);

  if (!password) return null;

  const level = LEVELS[score] || LEVELS[0];

  return (
    <div className="space-y-1.5 pt-1">
      {/* Bar track */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full bg-sand-dark/50 overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                i <= score ? level.color : "bg-transparent"
              }`}
              style={{ width: i <= score ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>
      {/* Label */}
      {score > 0 && (
        <p
          className="text-xs font-medium transition-colors duration-300"
          style={{
            color:
              score <= 1
                ? "#f87171"
                : score === 2
                  ? "#fbbf24"
                  : score === 3
                    ? "#7c8c6e"
                    : "#65755a",
          }}
        >
          {level.label}
        </p>
      )}
    </div>
  );
}
