import { CardRepositoryI } from "@/repository/card/card_interfaces";
import { CustomFieldRepositoryI } from "@/repository/custom_field/custom_field_interfaces";
import { CardLabelDetail } from "@/repository/label/label_interfaces";
import { RepositoryContext } from "@/repository/repository_context";
import { UserDetail, UserRepositoryI } from "@/repository/user/user_interfaces";
import { EnumInputType, EnumSelectionType, EnumTiggerCarFilterType } from "@/types/automation_rule";
import { UserActionEvent } from "@/types/event";
import { EnumAssignmentOperator, EnumAssignmentSubjectOperator, EnumCardContentType, EnumDateStatusOperator, EnumInclusionOperator, EnumOptionsNumberComparisonOperators, EnumOptionTextComparisonOperator, EnumTimeComparisonOperator, EnumTimeRangeOperator, EnumTimeUnit } from "@/types/options";

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
   protected repositories: RepositoryContext;

  constructor(filterType: string, repositories: RepositoryContext) {
    this.filterType = filterType;
    this.repositories = repositories;
  }

  abstract evaluate(condition: FilterCondition, event: UserActionEvent, createdBy?: string, updatedAt?: Date): Promise<FilterEvaluationResult>;

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
      case EnumOptionTextComparisonOperator.StartingWith: return actualLower.startsWith(expectedLower);
      case EnumOptionTextComparisonOperator.EndingWith: return actualLower.endsWith(expectedLower);
      case EnumOptionTextComparisonOperator.Containing: return actualLower.includes(expectedLower);
      case EnumOptionTextComparisonOperator.NotStartingWith: return !actualLower.startsWith(expectedLower);
      case EnumOptionTextComparisonOperator.NotEndingWith: return !actualLower.endsWith(expectedLower);
      case EnumOptionTextComparisonOperator.NotContaining: return !actualLower.includes(expectedLower);
      default: return actualLower === expectedLower;
    }
  }

  protected compareNumber(actual: number, expected: number, operator: string): boolean {
    switch (operator) {
      case EnumOptionsNumberComparisonOperators.MoreThan: return actual > expected;
      case EnumOptionsNumberComparisonOperators.MoreOrEqual: return actual >= expected;
      case EnumOptionsNumberComparisonOperators.FewerThan: return actual < expected;
      case EnumOptionsNumberComparisonOperators.FewerOrEqual: return actual <= expected;
      default: return actual === expected;
    }
  }

  protected isInTimeRange(date: Date, range: string): boolean {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const isSameDay = (d1: Date, d2: Date) => d1.getTime() === d2.getTime();

    switch (range) {
      case EnumTimeRangeOperator.Today:
        return isSameDay(target, today);
      case EnumTimeRangeOperator.Tomorrow:
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return isSameDay(target, tomorrow);
      case EnumTimeRangeOperator.ThisWeek:
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return target >= weekStart && target <= weekEnd;
      case EnumTimeRangeOperator.NextWeek:
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() + 7 - today.getDay());
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        return target >= nextWeekStart && target <= nextWeekEnd;
      case EnumTimeRangeOperator.ThisMonth:
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return target >= monthStart && target <= monthEnd;
      case EnumTimeRangeOperator.NextMonth:
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        return target >= nextMonthStart && target <= nextMonthEnd;
      default:
        return false;
    }
  }

  protected compareList(actual: string, expected:string[], operator: string): boolean {
    if (!actual || !expected) return false;
    
    switch (operator) {
      case EnumInclusionOperator.In: return expected.includes(actual);
      case EnumInclusionOperator.NotIn: return !expected.includes(actual);
      default: return false;
    }
  }

  protected calculateDaysDifference(start: Date, end: Date, workingDaysOnly: boolean): number {
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    let diff = 0;
    while (s < e) {
      if (!workingDaysOnly || (s.getDay() !== 0 && s.getDay() !== 6)) {
        diff++;
      }
      s.setDate(s.getDate() + 1);
    }

    return diff;
  }
}

// Triggers



// Filters
// Card Inclusion in List Filter
class FilterItemCardInclusionInListEvaluator extends BaseAutomationRuleFilterEvaluator {
  constructor(repositories: RepositoryContext) {
    super(EnumTiggerCarFilterType.CardInclusionInList, repositories);
    console.log(`${EnumTiggerCarFilterType.CardInclusionInList} evaluator`);
  }

  async evaluate(condition: FilterCondition, event: UserActionEvent): Promise<FilterEvaluationResult> {
    try {
      console.log(`Evaluating [condition: %o] [event: %o]`, condition, event);
      let expected = [];
      if (typeof condition[EnumSelectionType.List] == "string") {
        expected.push(condition[EnumSelectionType.List]);
      } else {
        expected = condition[EnumSelectionType.List];
      }

      let result = this.compareList(event?.data?.list?.id || event?.data?.card?.list_id || "", expected, condition[EnumSelectionType.Inclusion]);

      return {
        matches: result,
        reason: `Card is ${result ? 'in' : 'not in'} the specified list`
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
class FilterItemLabelInclusionInCardEvaluator extends BaseAutomationRuleFilterEvaluator {
  constructor(repositories: RepositoryContext) {
    super(EnumTiggerCarFilterType.LabelInclusionInCard, repositories);
  }

  async evaluate(condition: FilterCondition, event: UserActionEvent): Promise<FilterEvaluationResult> {
    try {
      let result = false;
      let labels = await this.repositories.label.getAssignedLabelInCard(event?.workspace_id, event?.data?.card?.id || "");
      let labelIds = labels?.data?.map(item => item.id) || [];
    
      switch (condition[EnumSelectionType.Inclusion]) {
        case EnumInclusionOperator.With: result = labelIds?.includes(condition[EnumSelectionType.CardLabel]) || false;
        case EnumInclusionOperator.Without: result = !labelIds?.includes(condition[EnumSelectionType.CardLabel]) || false;
        case EnumInclusionOperator.WihtoutAny: result = labelIds?.length === 0
        default: false;
      }

      return {
        matches: result,
        reason: `Card ${result ? 'has' : 'does not have'} the specified label`
      };
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating label inclusion: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}


// CardDueDates
class FilterItemCardDueDatesEvaluator extends BaseAutomationRuleFilterEvaluator {
  constructor(repositories: RepositoryContext) {
    super(EnumTiggerCarFilterType.CardDueDates, repositories);
  }

  async evaluate(condition: FilterCondition, event: UserActionEvent): Promise<FilterEvaluationResult> {
    try {
      let result = false;
      
      const card = await this.repositories.card.getCard({id: event?.data?.card?.id || ""});
      result = card?.data?.due_date === null || card?.data?.due_date === undefined;

      return {
        matches: result,
        reason: `Card ${result ? 'has' : 'does not have'} the specified label`
      };
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating label inclusion: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// CardStartDate
class FilterItemCardStartDatesEvaluator extends BaseAutomationRuleFilterEvaluator {
  constructor(repositories: RepositoryContext) {
    super(EnumTiggerCarFilterType.CardDueDates, repositories);
  }

  async evaluate(condition: FilterCondition, event: UserActionEvent): Promise<FilterEvaluationResult> {
    try {
      let result = false;
      
      const card = await this.repositories.card.getCard({id: event?.data?.card?.id || ""});
      result = card?.data?.start_date === null || card?.data?.start_date === undefined;

      return {
        matches: result,
        reason: `Card ${result ? 'has' : 'does not have'} the specified label`
      };
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating label inclusion: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// CardDateStatus
class FilterItemCardDateStatusEvaluator extends BaseAutomationRuleFilterEvaluator {
  constructor(repositories: RepositoryContext) {
    super(EnumTiggerCarFilterType.CardDueDates, repositories);
  }

  async evaluate(condition: FilterCondition, event: UserActionEvent): Promise<FilterEvaluationResult> {
    try {
      const cardId = event?.data?.card?.id || "";
      const cardResult = await this.repositories.card.getCard({ id: cardId });

      const card = cardResult?.data;
      const cardStartDate = card?.start_date ? new Date(card.start_date) : null;
      const cardDueDate = card?.due_date ? new Date(card.due_date) : null;

      const dateStatus = condition[EnumSelectionType.DateStatus];
      const timeRange = condition[EnumSelectionType.TimeRange];
      const now = new Date();

      let targetDate: Date | null = null;

      switch (dateStatus) {
        case EnumDateStatusOperator.Due:
          targetDate = cardDueDate;
          break;
        case EnumDateStatusOperator.NotDue:
          targetDate = cardDueDate;
          break;
        case EnumDateStatusOperator.Starting:
          targetDate = cardStartDate;
          break;
        case EnumDateStatusOperator.NotStarting:
          targetDate = cardStartDate;
          break;
        default:
          return { matches: false, reason: `Invalid date status: ${dateStatus}` };
      }

      if (!targetDate) {
        return { matches: false, reason: "Card does not have a relevant date set" };
      }

      const isInRange = this.isInTimeRange(targetDate, timeRange);
      const shouldMatch = [EnumDateStatusOperator.Due, EnumDateStatusOperator.Starting].includes(dateStatus);

      return {
        matches: shouldMatch ? isInRange : !isInRange,
        reason: `Card ${shouldMatch === isInRange ? 'matches' : 'does not match'} the ${dateStatus} condition for ${timeRange}`
      };
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating date status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

class FilterItemCardDateStatusWithSpecificEvaluator extends BaseAutomationRuleFilterEvaluator {
  constructor(repositories: RepositoryContext) {
    super(EnumTiggerCarFilterType.CardDueDates, repositories);
  }

  async evaluate(condition: FilterCondition, event: UserActionEvent): Promise<FilterEvaluationResult> {
    try {
      const cardId = event?.data?.card?.id || "";
      const cardResult = await this.repositories.card.getCard({ id: cardId });
      const card = cardResult?.data;

      const cardStartDate = card?.start_date ? new Date(card.start_date) : null;
      const cardDueDate = card?.due_date ? new Date(card.due_date) : null;

      const dateStatus = condition[EnumSelectionType.DateStatus];
      const timeComparison = condition[EnumSelectionType.TimeComparison];
      const timeUnit = condition[EnumSelectionType.TimeUnit];
      const input = condition[EnumInputType.Number]; // could be number or array

      const now = new Date();

      let targetDate: Date | null = null;
      switch (dateStatus) {
        case EnumDateStatusOperator.Due:
          targetDate = cardDueDate;
          break;
        case EnumDateStatusOperator.Starting:
          targetDate = cardStartDate;
          break;
        default:
          return { matches: false, reason: `Invalid date status: ${dateStatus}` };
      }

      if (!targetDate) {
        return { matches: false, reason: "Card does not have a relevant date set" };
      }

      const daysDiff = this.calculateDaysDifference(now, targetDate, timeUnit === EnumTimeUnit.WorkingDays);

      let matches = false;
      switch (timeComparison) {
        case EnumTimeComparisonOperator.InLessThan:
          matches = daysDiff < Number(input);
          break;
        case EnumTimeComparisonOperator.InMoreThan:
          matches = daysDiff > Number(input);
          break;
        case EnumTimeComparisonOperator.In:
          matches = daysDiff === Number(input);
          break;
        case EnumTimeComparisonOperator.InBeetween:
          if (!Array.isArray(input) || input.length !== 2) {
            return { matches: false, reason: `Invalid input range format. Expected [min, max]` };
          }
          const [min, max] = input.map(Number);
          matches = daysDiff >= min && daysDiff <= max;
          break;
        default:
          return { matches: false, reason: `Unsupported time comparison: ${timeComparison}` };
      }

      return {
        matches,
        reason: `Card ${matches ? 'matches' : 'does not match'} the '${timeComparison}' condition with date difference = ${daysDiff}`,
      };
    } catch (error) {
      return {
        matches: false,
        error: `Error evaluating date status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Card Assignment Filter
class FilterItemCardAssignmentEvaluator extends BaseAutomationRuleFilterEvaluator {
  constructor(repositories: RepositoryContext) {
    super(EnumTiggerCarFilterType.CardAssignment, repositories);
  }

  async evaluate(condition: FilterCondition, event: UserActionEvent, createdBy?: string): Promise<FilterEvaluationResult> {
    try {
      let result = false;
      let members = await this.repositories.card_member.getMembersByCard(event?.data?.card?.id || "");
      let memberIds = members?.map(item => item.id) || [];

      switch (condition[EnumSelectionType.Assignment]) {
        case EnumAssignmentOperator.AssignedTo:

          if (EnumAssignmentSubjectOperator.Me) result = memberIds.includes(createdBy || "");
          if (EnumAssignmentSubjectOperator.Member) result = memberIds.includes(condition[EnumSelectionType.List]);
          if (EnumAssignmentSubjectOperator.Anyone) result = true;
          return {
            matches: result,
            reason: `Card is ${result ? '' : 'not '}${EnumAssignmentOperator.AssignedTo} to the user`
          };
        case EnumAssignmentOperator.AssignedOnlyTo:
          if (EnumAssignmentSubjectOperator.Me) result = memberIds.length === 1 && memberIds.includes(createdBy || "");
          if (EnumAssignmentSubjectOperator.Member) result = memberIds.length === 1 && memberIds.includes(condition[EnumSelectionType.List]);
          if (EnumAssignmentSubjectOperator.Anyone) result = true;
          return {
            matches: result,
            reason: `Card is ${result ? '' : 'not '}${EnumAssignmentOperator.AssignedOnlyTo} only to the user`
          };
        case EnumAssignmentOperator.NotAssignedTo:
          if (EnumAssignmentSubjectOperator.Me) result = !memberIds.includes(createdBy || "");
          if (EnumAssignmentSubjectOperator.Member) result = !memberIds.includes(condition[EnumSelectionType.List]);
          if (EnumAssignmentSubjectOperator.Anyone) result = memberIds?.length === 0;
          return {
            matches: result,
            reason: `Card is ${result ? '' : 'not '}${EnumAssignmentOperator.NotAssignedTo} to the user`
          };
        default:
          return { matches: false, reason: `Unknown assignment operator: ${condition[EnumSelectionType.Assignment]}` };
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
class FilterItemCardCustomField1Evaluator extends BaseAutomationRuleFilterEvaluator {
  constructor(repositories: RepositoryContext) {
    super(EnumTiggerCarFilterType.CardCustomField1, repositories);
  }

  async evaluate(condition: FilterCondition, event: UserActionEvent): Promise<FilterEvaluationResult> {
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
class FilterItemCardCustomField2Evaluator extends BaseAutomationRuleFilterEvaluator {
  constructor(repositories: RepositoryContext) {
    super(EnumTiggerCarFilterType.CardCustomField2, repositories);
  }

  async evaluate(condition: FilterCondition, event: UserActionEvent): Promise<FilterEvaluationResult> {
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
class FilterItemCardCustomField4Evaluator extends BaseAutomationRuleFilterEvaluator {
 constructor(repositories: RepositoryContext) {
    super(EnumTiggerCarFilterType.CardCustomField4, repositories);
  }

  async evaluate(condition: FilterCondition, event: UserActionEvent): Promise<FilterEvaluationResult> {
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

      const matches = event.data.custom_field?.value === expectedTextStr;
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
class FilterItemCardCustomField6Evaluator extends BaseAutomationRuleFilterEvaluator {
  constructor(repositories: RepositoryContext) {
    super(EnumTiggerCarFilterType.CardCustomField6, repositories);
  }

  async evaluate(condition: FilterCondition, event: UserActionEvent): Promise<FilterEvaluationResult> {
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
class FilterItemCardContentTitleDescriptionEvaluator extends BaseAutomationRuleFilterEvaluator {
  constructor(repositories: RepositoryContext) {
    super(EnumTiggerCarFilterType.CardContentTileDescription, repositories);
  }

  async evaluate(condition: FilterCondition, event: UserActionEvent): Promise<FilterEvaluationResult> {
    try {
      const contentType = condition.card_content_type?.value || condition.card_content_type;
      const textComparison = condition.text_comparison?.value || condition.text_comparison;
      const searchText = condition.text || condition.text_input;

      if (!searchText) {
        return { matches: false, reason: 'No search text provided' };
      }

      let targetText = '';
      
      switch (contentType) {
        case EnumCardContentType.AName:
          targetText = event.data?.card?.name || '';
          break;
        case EnumCardContentType.ADescription:
          targetText = event.data?.card?.description || '';
          break;
        case EnumCardContentType.ANameOrDescription:
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
  private static evaluatorMap: Record<
    string,
    (repos: RepositoryContext) => BaseAutomationRuleFilterEvaluator
  > = {
    // Trigger item

    // Filter Item
    [EnumTiggerCarFilterType.CardInclusionInList]: (repos) => new FilterItemCardInclusionInListEvaluator(repos),
    [EnumTiggerCarFilterType.LabelInclusionInCard]: (repos) => new FilterItemLabelInclusionInCardEvaluator(repos),
    [EnumTiggerCarFilterType.CardAssignment]: (repos) => new FilterItemCardAssignmentEvaluator(repos),
    [EnumTiggerCarFilterType.CardDueDates]: (repos) => new FilterItemCardDueDatesEvaluator(repos),
    [EnumTiggerCarFilterType.CardStartDate]: (repos) => new FilterItemCardStartDatesEvaluator(repos),
    [EnumTiggerCarFilterType.CardDateStatus]: (repos) => new FilterItemCardDateStatusEvaluator(repos),
    [EnumTiggerCarFilterType.CardDateStatusWithSpecificDays]: (repos) => new FilterItemCardDateStatusWithSpecificEvaluator(repos),
    [EnumTiggerCarFilterType.CardCustomField1]: (repos) => new FilterItemCardCustomField1Evaluator(repos),
    [EnumTiggerCarFilterType.CardCustomField2]: (repos) => new FilterItemCardCustomField2Evaluator(repos),
    [EnumTiggerCarFilterType.CardCustomField4]: (repos) => new FilterItemCardCustomField4Evaluator(repos),
    [EnumTiggerCarFilterType.CardCustomField6]: (repos) => new FilterItemCardCustomField6Evaluator(repos),
    [EnumTiggerCarFilterType.CardContentTileDescription]: (repos) => new FilterItemCardContentTitleDescriptionEvaluator(repos),
  };

  static create(filterType: string, repositories: RepositoryContext): BaseAutomationRuleFilterEvaluator {
    const createEvaluator = this.evaluatorMap[filterType];
    if (!createEvaluator) {
      throw new Error(`Unknown filter type: ${filterType}`);
    }
    return createEvaluator(repositories);
  }

  static getSupportedTypes(): string[] {
    return Object.keys(this.evaluatorMap);
  }
}


// Main service class
class AutomationRuleFilterService {

  static async evaluate(repositories: RepositoryContext, filterType: string, condition: FilterCondition, event: UserActionEvent, createdBy?: string): Promise<FilterEvaluationResult> {
    try {
      const evaluator = AutomationRuleTriggerFilterEvaluatorFactory.create(filterType, repositories);
      return await evaluator.evaluate(condition, event, createdBy);
    } catch (error) {
      return {
        matches: false,
        error: `Filter evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export { AutomationRuleFilterService, BaseAutomationRuleFilterEvaluator, AutomationRuleTriggerFilterEvaluatorFactory };