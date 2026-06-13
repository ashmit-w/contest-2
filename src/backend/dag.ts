import type { WorkflowStep, StepStatus } from "../types/workflow"

export function getReadySteps(
  steps: WorkflowStep[],
  stepStatus: Record<string, StepStatus>
): WorkflowStep[] {
  let readyArr: WorkflowStep[] = [];

  steps.forEach((s)=>{

    if(stepStatus[s.id] === "PENDING"){
      if (!s.dependsOn) {
        readyArr.push(s);
      } else {
        let flag: boolean = true;
        s.dependsOn.forEach((d)=>{

          if(stepStatus[d] !== "COMPLETED"){
            flag = false;
          }
        })
        if (flag) readyArr.push(s); 
      }
    }
  })
  return readyArr;
}

