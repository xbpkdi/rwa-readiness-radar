import { CheckCircle2 } from 'lucide-react'

interface Step {
  label: string
}

interface StepProgressProps {
  steps: Step[]
  currentStep: number
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <nav aria-label="Publication progress" className="mb-8">
      <ol className="hidden md:flex items-center glass rounded-full px-3 py-2">
        {steps.map((step, i) => {
          const done = currentStep > i
          const active = currentStep === i
          return (
            <li key={step.label} className="flex-1 flex items-center">
              <div className="flex items-center gap-1.5">
                <div
                  aria-current={active ? 'step' : undefined}
                  className={`h-7 w-7 rounded-full grid place-items-center text-xs font-semibold transition-colors ${
                    done
                      ? 'bg-[var(--success)] text-white'
                      : active
                      ? 'bg-gradient-to-br from-[var(--avax)] to-[var(--azure)] text-white'
                      : 'bg-white/6 text-[var(--muted-fg)]'
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden lg:block ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted-fg)]'}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 ${done ? 'bg-[var(--success)]/50' : 'bg-white/10'}`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
      <div className="md:hidden glass rounded-full px-4 py-2 text-xs text-[var(--muted-fg)] text-center">
        Step {currentStep + 1} of {steps.length} — {steps[currentStep]?.label}
      </div>
    </nav>
  )
}
