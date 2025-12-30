
// import * as React from 'react';
// import * as Progress from '@radix-ui/react-progress';
// import './pipeline-progress.css';

// type PipelineStep = {
//   label: string;
//   value: number; // percentage from 0 to 100
// };

// const PIPELINE_STEPS: PipelineStep[] = [
//   { label: 'DICOM file received', value: 12.5 },
//   { label: 'LIS query Generated', value: 25 },
//   { label: 'LIS Query Sent', value: 37.5 },
//   { label: 'In Progress', value: 50 },
//   { label: 'Enrichment completed', value: 62.5 },
//   { label: 'DICOM series pushed to Synapse Folder', value: 75 },
//   { label: 'File sent to Visiopharm', value: 87.5 },
//   { label: 'File sent to IBEX', value: 100 },
// ];

// // Helper to clamp and format
// const clamp = (n: number, min = 0, max = 100) => Math.min(Math.max(n, min), max);
// const formatPct = (n: number) => `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}%`;

// export interface PipelineProgressProps {
//   /** Current overall progress (0–100). Default: derived from highest completed step. */
//   value?: number;
//   /** If provided, the index of the current step (0-based). Used to highlight the list. */
//   currentStepIndex?: number;
//   /** Override the steps (optional). */
//   steps?: PipelineStep[];
//   /** Show labels above the bar. */
//   showHeader?: boolean;
// }

// export const PipelineProgress: React.FC<PipelineProgressProps> = ({
//   value,
//   currentStepIndex,
//   steps = PIPELINE_STEPS,
//   showHeader = true,
// }) => {
//   // If value not provided, infer from steps (pick max value of reached step)
//   const inferredValue = value ?? Math.max(...steps.map(s => s.value));
//   const clamped = clamp(inferredValue);

//   // Determine active step by closest step <= value
//   const activeIndex =
//     currentStepIndex ??
//     steps.reduce((idx, s, i) => (s.value <= clamped ? i : idx), -1);

//   return (
//     <>
//     <div className="pipeline-progress">
//       {showHeader && (
//         <div className="pp-header">
//           <div className="pp-title">Pipeline Progress</div>
//           <div className="pp-percent" aria-live="polite">
//             {formatPct(clamped)}
//           </div>
//         </div>
//       )}

//       {/* Overall progress bar */}
//       <Progress.Root
//         className="pp-root"
//         value={clamped}
//         max={100}
//         aria-label="Pipeline progress"
//       >
//         <Progress.Indicator
//           className="pp-indicator"
//           style={{ transform: `translateX(-${100 - clamped}%)` }}
//         />
//         {/* Optional stripes overlay */}
//         <div className="pp-stripes" aria-hidden="true" />
//       </Progress.Root>

//       {/* Steps list */}
//       <ol className="pp-steps" aria-label="Pipeline steps">
//         {steps.map((step, i) => {
//           const reached = step.value <= clamped;
//           const isActive = i === activeIndex;
//           return (
//             <li
//               key={`${step.label}-${step.value}`}
//               className={[
//                 'pp-step',
//                 reached ? 'pp-step--reached' : '',
//                 isActive ? 'pp-step--active' : '',
//               ].join(' ')}
//             >
//               <div className="pp-step-status">
//                 <span className="pp-dot" />
//               </div>
//               <div className="pp-step-content">
//                 <div className="pp-step-label">{step.label}</div>
//                 <div className="pp-step-value">{formatPct(step.value)}</div>
//               </div>
//             </li>
//           );
//         })}
//       </ol>
//     </div>
//     </>
//   );}
