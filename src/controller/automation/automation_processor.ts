import { UserActionEvent } from "@/types/event";
import { AutomationRuleController } from "../automation_rule/automation_rule_controller";
import { AutomationRuleFilter, RecentUserAction } from "../automation_rule/automation_rule_interface";


export class AutomationProcessor {
  private automationController!: AutomationRuleController;

  setController(controller: AutomationRuleController) {
    this.automationController = controller;
  }

  async processAutomationEvent(event: UserActionEvent) {
    try {
      console.log('Processing automation for event:', event.type);
      
      // Create filter based on event
      const filter = new AutomationRuleFilter({
        workspace_id: event.workspace_id,
        condition: {action: event.type},
      });

      // Process automation rules
      await this.automationController.FindMatchingRules(event, filter);
      
    } catch (error) {
      console.error('Error processing automation:', error);
    }
  }
}
