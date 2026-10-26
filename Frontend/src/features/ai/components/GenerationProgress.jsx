import { useEffect, useState } from "react"
import "../styles/generation-progress.scss"

const GenerationProgress = ({ title, steps }) => {
  const [progress, setProgress] = useState(12)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress >= 88) return currentProgress
        const increment = currentProgress < 55 ? 6 : currentProgress < 75 ? 3 : 1
        return Math.min(currentProgress + increment, 88)
      })
    }, 1100)

    return () => window.clearInterval(timer)
  }, [])

  const activeStepIndex = steps.reduce(
    (activeIndex, step, index) => (progress >= step.at ? index : activeIndex),
    0,
  )

  return (
    <main className="generation-progress" aria-live="polite">
      <div className="generation-progress__spinner" aria-hidden="true" />
      <h1>{title}</h1>
      <p className="generation-progress__status">{steps[activeStepIndex].label}</p>

      <div
        className="generation-progress__bar"
        role="progressbar"
        aria-label="Generation progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress}
      >
        <div className="generation-progress__fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="generation-progress__percent">{progress}%</p>

      <ol className="generation-progress__steps">
        {steps.map((step, index) => (
          <li
            key={step.label}
            className={index < activeStepIndex ? "is-complete" : index === activeStepIndex ? "is-active" : ""}
          >
            {step.label}
          </li>
        ))}
      </ol>
      <p className="generation-progress__hint">Progress is estimated while the AI completes your request.</p>
    </main>
  )
}

export default GenerationProgress
