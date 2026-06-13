import type { WorkflowStep, StepStatus } from "../types/workflow"

export function getReadySteps(
  steps: WorkflowStep[],
  stepStatus: Record<string, StepStatus>
): WorkflowStep[] {
  let readyArr: WorkflowStep[] = [];
  for(let s in steps){
    if(stepStatus[steps[s].id] === "PENDING"){
      if (!steps[s].dependsOn) {
        readyArr.push(steps[s]);
      } else {
        for(let d in steps[s].dependsOn){
          if(stepStatus[steps[s].dependsOn[d]] === "COMPLETED"){
            readyArr.push(steps[s]);
          }
        }
      }
    }
  }
  return readyArr;
}




