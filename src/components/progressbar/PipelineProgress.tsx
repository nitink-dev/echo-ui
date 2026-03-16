
import * as React from 'react';
import * as Progress from '@radix-ui/react-progress';
import './pipeline-progress.css';

type PipelineStep = {
  label: string;
  value: number; // percentage from 0 to 100
};

const PIPELINE_STEPS: PipelineStep[] = [
  { label: 'DICOM file received', value: 12.5 },
  { label: 'LIS query Generated', value: 25 },
  { label: 'LIS Query Sent', value: 37.5 },
  { label: 'In Progress', value: 50 },
  { label: 'Enrichment completed', value: 62.5 },
  { label: 'DICOM series pushed to Synapse Folder', value: 75 },
  { label: 'File sent to Visiopharm', value: 87.5 },
  { label: 'File sent to IBEX', value: 100 },
];

const clamp = (n: number, min = 0, max = 100) => Math.min(Math.max(n, min), max);
const formatPct = (n: number) => `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}%`;

export interface PipelineProgressProps {
  steps?: PipelineStep[];
  /** Initial selected step index (default: highest-value step) */
  initialStepIndex?: number;
  /** Emit selected step index/value to parent (optional) */
  onChange?: (payload: { index: number; step: PipelineStep }) => void;
  /** Show labels above the bar */
  showHeader?: boolean;
  /** If true, enable horizontal scrolling for the milestones row */
  scrollRow?: boolean;
}

export const PipelineProgress: React.FC<PipelineProgressProps> = ({
  steps = PIPELINE_STEPS,
  initialStepIndex,
  onChange,
  showHeader = true,
  scrollRow = false,
}) => {
  // infer initial selected index: highest step by value
  const inferredIndex =
    initialStepIndex ??
    steps.reduce((maxI, s, i, arr) => (s.value >= arr[maxI].value ? i : maxI), 0);

  const [selectedIndex, setSelectedIndex] = React.useState<number>(inferredIndex);

  // derive value from selected step
  const selectedStep = steps[selectedIndex];
  const clamped = clamp(selectedStep?.value ?? 0);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onChange?.({ index, step: steps[index] });
  };

  return (
    <div className="pipeline-progress">
      {showHeader && (
        <div className="pp-header">
          <div className="pp-title">Pipeline Progress</div>
          <div className="pp-percent" aria-live="polite">
            {formatPct(clamped)}
          </div>
        </div>
      )}

      {/* Overall progress bar */}
      <Progress.Root
        className="pp-root"
        value={clamped}
        max={100}
        aria-label="Pipeline progress"
      >
        <Progress.Indicator
          className="pp-indicator"
          style={{ transform: `translateX(-${100 - clamped}%)` }}
        />
        <div className="pp-stripes" aria-hidden="true" />
      </Progress.Root>

      {/* Milestones in a ROW */}
      <div className={['pp-row-wrap', scrollRow ? 'pp-row-wrap--scroll' : ''].join(' ')}>
        <ol className="pp-steps-row" aria-label="Pipeline milestones">
          {/* connector line behind dots */}
          <div className="pp-row-connector" aria-hidden="true" />

          {steps.map((step, i) => {
            const isActive = i === selectedIndex;
            const reached = step.value <= clamped;
            return (
              <li
                key={`${step.label}-${step.value}`}
                className={[
                  'pp-row-step',
                  reached ? 'pp-row-step--reached' : '',
                  isActive ? 'pp-row-step--active' : '',
                ].join(' ')}
              >
                <button
                  type="button"
                  className="pp-row-button"
                  onClick={() => handleSelect(i)}
                  aria-pressed={isActive}
                  aria-label={`Select milestone "${step.label}" at ${formatPct(step.value)}`}
                >
                  <span className="pp-row-dot" />
                  <span className="pp-row-label">{step.label}</span>
                  <span className="pp-row-value">{formatPct(step.value)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
