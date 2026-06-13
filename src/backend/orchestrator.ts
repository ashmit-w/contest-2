import type { StepState, StepStatus, Workflow, WorkflowState, WorkflowStep } from "../types/workflow"
import { getWorkflow, setWorkflow } from "./workflow-store"
import { getReadySteps } from "./dag"
import { stepQueue } from "../queue/step-queue"
import { resultQueue } from "../queue/result-queue"
import { podManager } from "../pod-manager/pod-manager"
import { get } from "node:http"

/**
 * TODO: Implement this class.
 *
 * The orchestrator is the brain of the system. It ties together
 * the DAG resolver, step queue, result queue, and pod manager.
 *
 * submitWorkflow(workflow):
 *   1. Store workflow in workflow-store with all steps as PENDING
 *   2. Run getReadySteps() to find immediately runnable steps
 *   3. Push each ready step into the step queue
 *   4. Mark those steps as QUEUED in workflow-store
 *
 * IMPORTANT: Store the workflow state before enqueueing the first ready step.
 * Result events can come back quickly, and the result handler must be able
 * to find the workflow in workflow-store.
 *
 * start():
 *   - Begin consuming from the result queue
 *   - Begin draining the step queue (send steps to pod manager)
 *   - For Section 1: sequential is fine
 *   - For Section 2: run parallel dispatch
 *
 * On StepResult received (from result queue consumer):
 *   1. Update the step's status in workflow-store
 *   2. If COMPLETED: run getReadySteps() again, enqueue newly unblocked steps
 *   3. Check if all steps done → update workflow status to "completed" or "failed"
 *
 * INVARIANT: Backend is the ONLY place that writes stepStatus.
 * Pod manager only pushes events. Orchestrator reads events and updates state.
 */
export class Orchestrator {
  async submitWorkflow(workflow: Workflow): Promise<void> {
    let s: Record<string, StepState> = {};
    workflow.steps.forEach((k)=>{
      s[k.id]= {
          stepId: k.id,
          status: "PENDING",
          podId : null
      }
    })

    setWorkflow(workflow.workflowId, {
      workflowId : workflow.workflowId,
      status : "pending",
      steps : workflow.steps,
      stepState : s
    })

    const status: Record<string,StepStatus> = {}

    for(const key in getWorkflow(workflow.workflowId)?.stepState){
      status[key] = getWorkflow(workflow.workflowId)?.stepState[key].status!;
    }

    let readysteps: WorkflowStep[] = getReadySteps(getWorkflow(workflow.workflowId)?.steps!, status);

    readysteps.forEach((r)=>{
      stepQueue.enqueue({
        stepId: r.id,
        workflowId: workflow.workflowId,
        command: r.command,
        enqueuedAt: Date.now()
      })
      const curr = getWorkflow(workflow.workflowId);
      curr!.stepState[r.id].status = "QUEUED";
      setWorkflow(workflow.workflowId,curr!);
    })


  }

  async start(): Promise<void> {
    void resultQueue
    void podManager
    throw new Error("TODO: implement start")
  }
}

export const orchestrator = new Orchestrator()
