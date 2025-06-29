import CardLabel, { CardLabelAttributes } from "@/database/schemas/card_label";
import { CardLabelDetail } from "@/repository/label/label_interfaces";
import { UserDetail } from "@/repository/user/user_interfaces";
import { EnumTiggerCarFilterType } from "@/types/automation_rule";
import { UserActionEvent } from "@/types/event";

type FilterCondition = {
  [key: string]: any;
};

interface FilterEvaluationResult {
  matches: boolean;
  reason?: string;
  error?: string;
}

// Abstract base class for all filter evaluators
abstract class BaseAutomationRuleFilterEvaluator {
  protected filterType: string;

  constructor(filterType: string) {
    this.filterType = filterType;
  }

  abstract evaluate(condition: FilterCondition, event: UserActionEvent, createdBy?: string, updatedAt?: Date): FilterEvaluationResult;

  protected getInclusionValue(condition: FilterCondition, key = 'inclusion'): string {
    return condition[key]?.value || condition[key] || 'with';
  }

  protected getCustomFieldValue(event: UserActionEvent, fieldName: string): any {
    // return event.data?.custom_field?.;
  }

  protected isCompleted(event: UserActionEvent): boolean {
    return event.data?.card?.is_complete === true;
  }

  protected hasCustomFields(event: UserActionEvent): boolean {
    let retrievedCardCustomFields = [];
    return retrievedCardCustomFields.length > 0;
  }

  protected compareText(actual: string, expected: string, operator: string): boolean {
    if (!actual || !expected) return false;
    
    const actualLower = actual.toLowerCase();
    const expectedLower = expected.toLowerCase();
    
    switch (operator) {
      case 'starting-with': return actualLower.startsWith(expectedLower);
      case 'ending-with': return actualLower.endsWith(expectedLower);
      case 'containing': return actualLower.includes(expectedLower);
      case 'not-starting-with': return !actualLower.startsWith(expectedLower);
      case 'not-ending-with': return !actualLower.endsWith(expectedLower);
      case 'not-containing': return !actualLower.includes(expectedLower);
      default: return actualLower === expectedLower;
    }
  }

  protected compareNumber(actual: number, expected: number, operator: string): boolean {
    switch (operator) {
      case 'more-than': return actual > expected;
      case 'more-or-equal': return actual >= expected;
      case 'fewer-than': return actual < expected;
      case 'fewer-or-equal': return actual <= expected;
      default: return actual === expected;
    }
  }

  protected isInTimeRange(date: Date, range: string): boolean {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    switch (range) {
      case 'today': 
        return targetDate.getTime() === today.getTime();
      case 'tomorrow': 
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return targetDate.getTime() === tomorrow.getTime();
      case 'this-week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return targetDate >= weekStart && targetDate <= weekEnd;
      // Add more ranges as needed
      default: return false;
    }
  }
}

// Card Inclusion in List Filter
class CardInclusionInListEvaluator extends BaseAutomationRuleFilterEvaluator {
  constructor() {
    super('card-inclusion-in-list');
  }

  evaluate(condition: FilterCondition, event: UserActionEvent): FilterEvaluationResult {
    try {
      const inclusionOperator = this.getInclusionValue(condition);
      const listValue = condition.list?.value || condition.list;
      const cardListId = event.data?.card?.list_id|| event.data?.list?.id;

      if (!listValue) {
        return { matches: false, reason: 'No list specified in condition' };
      }

      const isInList = cardListId === listValue;
      const shouldInclude = inclusionOperator === 'in';

      return {
        matches: shouldInclude ? isInList : !isInList,
        reason: `Card is ${isInList ? 'in' : 'not in'} the specified list`
      };
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating list inclusion: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Label Inclusion in Card Filter
class LabelInclusionInCardEvaluator extends BaseAutomationRuleFilterEvaluator {
  constructor() {
    super('label-inclusion-in-card');
  }

  evaluate(condition: FilterCondition, event: UserActionEvent): FilterEvaluationResult {
    try {
      const inclusionOperator = this.getInclusionValue(condition);
      const labelValue = condition.card_label?.value || condition.card_label;
      const retrieveCardLabels: CardLabelDetail[] = [];

      if (!labelValue) {
        return { matches: false, reason: 'No label specified in condition' };
      }

      const hasLabel = retrieveCardLabels.filter(item => item.name.toLocaleLowerCase() === labelValue)?.length > 0;
      const shouldHaveLabel = inclusionOperator === 'with';

      return {
        matches: shouldHaveLabel ? hasLabel : !hasLabel,
        reason: `Card ${hasLabel ? 'has' : 'does not have'} the specified label`
      };
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating label inclusion: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Card Assignment Filter
class CardAssignmentEvaluator extends BaseAutomationRuleFilterEvaluator {
  constructor() {
    super('card-assignment');
  }

  evaluate(condition: FilterCondition, event: UserActionEvent, createdBy?: string): FilterEvaluationResult {
    try {
      const assignmentOperator = condition.assignment?.value || condition.assignment;
      const assignmentSubject = condition.assignment_subject?.value || condition.assignment_subject;
      const conditionUserId = condition?.user;
      const recentlyAssignedUser = event.data?.member;

      const userId = assignmentSubject === 'me' ? createdBy : assignmentSubject;

      if (!userId && assignmentSubject === 'me') {
        return { matches: false, reason: 'Created by user ID required for "me" assignment' };
      }

      switch (assignmentOperator) {
        case 'assigned-to':
          return {
            matches: recentlyAssignedUser?.id === userId,
            reason: `Card is ${recentlyAssignedUser?.id === userId ? '' : 'not '}assigned to the user`
          };
        case 'assigned-only-to':
          const retrieveMembes: UserDetail[] = [];
          return {
            matches: retrieveMembes.length === 1 && recentlyAssignedUser?.id === retrieveMembes[0]["id"],
            reason: `Card is ${retrieveMembes.length === 1 && recentlyAssignedUser?.id === retrieveMembes[0]["id"] ? '' : 'not '}assigned only to the user`
          };
        case 'not-assigned-to':
          return {
            matches: recentlyAssignedUser?.id !== userId,
            reason: `Card is ${recentlyAssignedUser?.id !== userId ? '' : 'not '}assigned to the user`
          };
        default:
          return { matches: false, reason: `Unknown assignment operator: ${assignmentOperator}` };
      }
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating assignment: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Custom Field 1: with/without all custom fields completed
class CardCustomField1Evaluator extends BaseAutomationRuleFilterEvaluator {
  constructor() {
    super('card-custom-field-1');
  }

  evaluate(condition: FilterCondition, event: UserActionEvent): FilterEvaluationResult {
    try {
      const inclusionOperator = this.getInclusionValue(condition);
      const completionStatus = condition.completion?.value || condition.completion;
      
      const hasCustomFields = this.hasCustomFields(event);
      const isCompleted = this.isCompleted(event);

      if (!hasCustomFields) {
        return {
          matches: inclusionOperator === 'without',
          reason: 'No custom fields found'
        };
      }

      const shouldInclude = inclusionOperator === 'with';
      const matchesCompletion = completionStatus === 'completed' ? isCompleted : !isCompleted;

      return {
        matches: shouldInclude === matchesCompletion,
        reason: `Card ${hasCustomFields ? 'has' : 'does not have'} custom fields and is ${isCompleted ? 'completed' : 'incomplete'}`
      };
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating custom field 1: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Custom Field 2: with/without specific custom field completed
class CardCustomField2Evaluator extends BaseAutomationRuleFilterEvaluator {
  constructor() {
    super('card-custom-field-2');
  }

  evaluate(condition: FilterCondition, event: UserActionEvent): FilterEvaluationResult {
    try {
      const inclusionOperator = this.getInclusionValue(condition);
      const customFieldName = condition.custom_field?.value || condition.custom_field;
      const completionStatus = condition.completion?.value || condition.completion;

      if (!customFieldName) {
        return { matches: false, reason: 'No custom field specified' };
      }

      const fieldValue = this.getCustomFieldValue(event, customFieldName);
      const hasField = fieldValue !== undefined && fieldValue !== null;
      const isCompleted = this.isCompleted(event);

      const shouldInclude = inclusionOperator === 'with';
      const matchesCompletion = completionStatus === 'completed' ? isCompleted : !isCompleted;

      return {
        matches: shouldInclude === (hasField && matchesCompletion),
        reason: `Custom field '${customFieldName}' is ${hasField ? 'present' : 'missing'} and card is ${isCompleted ? 'completed' : 'incomplete'}`
      };
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating custom field 2: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Custom Field 4: with/without custom field set to specific text
class CardCustomField4Evaluator extends BaseAutomationRuleFilterEvaluator {
  constructor() {
    super('card-custom-field-4');
  }

  evaluate(condition: FilterCondition, event: UserActionEvent): FilterEvaluationResult {
    try {
      const inclusionOperator = this.getInclusionValue(condition);
      const customFieldName = condition.custom_field?.value || condition.custom_field;
      const expectedText = condition.text || condition.text_input;

      if (!customFieldName) {
        return { matches: false, reason: 'No custom field specified' };
      }

      const fieldValue = this.getCustomFieldValue(event, customFieldName);
      const fieldText = String(fieldValue || '');
      const expectedTextStr = String(expectedText || '');

      const matches = fieldText === expectedTextStr;
      const shouldInclude = inclusionOperator === 'with';

      return {
        matches: shouldInclude === matches,
        reason: `Custom field '${customFieldName}' ${matches ? 'matches' : 'does not match'} expected text`
      };
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating custom field 4: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Custom Field 6: with/without custom field number comparison
class CardCustomField6Evaluator extends BaseAutomationRuleFilterEvaluator {
  constructor() {
    super('card-custom-field-6');
  }

  evaluate(condition: FilterCondition, event: UserActionEvent): FilterEvaluationResult {
    try {
      const inclusionOperator = this.getInclusionValue(condition);
      const customFieldName = condition.custom_field?.value || condition.custom_field;
      const numberComparison = condition.number_comparison?.value || condition.number_comparison;
      const expectedNumber = Number(condition.number || 0);

      if (!customFieldName) {
        return { matches: false, reason: 'No custom field specified' };
      }

      const fieldValue = this.getCustomFieldValue(event, customFieldName);
      const fieldNumber = Number(fieldValue || 0);

      if (isNaN(fieldNumber)) {
        return {
          matches: inclusionOperator === 'without',
          reason: `Custom field '${customFieldName}' is not a valid number`
        };
      }

      const comparisonResult = this.compareNumber(fieldNumber, expectedNumber, numberComparison);
      const shouldInclude = inclusionOperator === 'with';

      return {
        matches: shouldInclude === comparisonResult,
        reason: `Custom field '${customFieldName}' (${fieldNumber}) ${comparisonResult ? 'satisfies' : 'does not satisfy'} ${numberComparison} ${expectedNumber}`
      };
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating custom field 6: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Content Title/Description Filter
class CardContentTitleDescriptionEvaluator extends BaseAutomationRuleFilterEvaluator {
  constructor() {
    super('card-content-title-description');
  }

  evaluate(condition: FilterCondition, event: UserActionEvent): FilterEvaluationResult {
    try {
      const contentType = condition.card_content_type?.value || condition.card_content_type;
      const textComparison = condition.text_comparison?.value || condition.text_comparison;
      const searchText = condition.text || condition.text_input;

      if (!searchText) {
        return { matches: false, reason: 'No search text provided' };
      }

      let targetText = '';
      
      switch (contentType) {
        case 'a-name':
          targetText = event.data?.card?.name || '';
          break;
        case 'a-description':
          targetText = event.data?.card?.description || '';
          break;
        case 'a-name-or-description':
          targetText = (event.data?.card?.name || '') + ' ' + (event.data?.card?.description || '');
          break;
        default:
          return { matches: false, reason: `Unknown content type: ${contentType}` };
      }

      const matches = this.compareText(targetText, searchText, textComparison);

      return {
        matches,
        reason: `Content ${matches ? 'matches' : 'does not match'} the text comparison criteria`
      };
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating content filter: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}


class AutomationRuleTriggerFilterEvaluatorFactory {
  private static evaluatorMap: Record<string, new () => BaseAutomationRuleFilterEvaluator> = {

    // trigger filter
    [EnumTiggerCarFilterType.CardInclusionInList]: CardInclusionInListEvaluator,
    [EnumTiggerCarFilterType.LabelInclusionInCard]: LabelInclusionInCardEvaluator,
    [EnumTiggerCarFilterType.CardAssignment]: CardAssignmentEvaluator,
    [EnumTiggerCarFilterType.CardCustomField1]: CardCustomField1Evaluator,
    [EnumTiggerCarFilterType.CardCustomField2]: CardCustomField2Evaluator,
    [EnumTiggerCarFilterType.CardCustomField4]: CardCustomField4Evaluator,
    [EnumTiggerCarFilterType.CardCustomField6]: CardCustomField6Evaluator,
    [EnumTiggerCarFilterType.CardContentTileDescription]: CardContentTitleDescriptionEvaluator,
  };

  static create(filterType: string): BaseAutomationRuleFilterEvaluator {
    const EvaluatorClass = this.evaluatorMap[filterType];
    
    if (!EvaluatorClass) {
      throw new Error(`Unknown filter type: ${filterType}`);
    }
    
    return new EvaluatorClass();
  }

  static getSupportedTypes(): string[] {
    return Object.keys(this.evaluatorMap);
  }
}

// Main service class
class AutomationRuleFilterService {
  static evaluate(filterType: string, condition: FilterCondition, event: UserActionEvent, createdBy?: string): FilterEvaluationResult {
    try {
      const evaluator = AutomationRuleTriggerFilterEvaluatorFactory.create(filterType);
      console.log(`AutomationRuleFilterService: evaluator: %o`, evaluator);
      return evaluator.evaluate(condition, event, createdBy);
    } catch (error) {
      return {
        matches: false,
        error: `Filter evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export { AutomationRuleFilterService, BaseAutomationRuleFilterEvaluator, AutomationRuleTriggerFilterEvaluatorFactory };