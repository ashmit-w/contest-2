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
        let flag: boolean = true;
        for(let d in steps[s].dependsOn){
          if(stepStatus[steps[s].dependsOn[d]] !== "COMPLETED"){
            flag = false;
          }
        }
        if (flag) readyArr.push(steps[s]); 
      }
    }
  }
  return readyArr;
}

// const a :WorkflowStep = {
//   id : "A",
//   command : "hehehe",
// }

// const b :WorkflowStep = {
//   id : "B",
//   command : "hehehe",
// }

// const c :WorkflowStep = {
//   id : "C",
//   command : "hehehe",
//   dependsOn : ["B"]
// }


// const stat: Record<string, StepStatus> = {
//   "A" : "PENDING",
//   "B" : "COMPLETED",
//   "C" : "PENDING"
// }

// console.log(getReadySteps([a,b,c],stat));

