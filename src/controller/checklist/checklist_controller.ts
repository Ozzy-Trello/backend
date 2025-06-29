import {
  IChecklistController,
  IChecklistRepository,
  ChecklistDTO,
  CreateChecklistDTO,
  UpdateChecklistDTO,
} from "./checklist_interfaces";
import { ResponseData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { EventPublisher } from "@/event_publisher";
import { v4 as uuidv4 } from "uuid";
import { UserActionEvent, EnumUserActionEvent } from "@/types/event";
import { CardDetail } from "@/repository/card/card_interfaces";
import { RepositoryContext } from "@/repository/repository_context";

export class ChecklistController implements IChecklistController {
  private repository_context: RepositoryContext;
  private event_publisher: EventPublisher | undefined;

  constructor(repository_context: RepositoryContext) {
    this.repository_context = repository_context;
  }

  SetEventPublisher(event_publisher: EventPublisher): void {
    this.event_publisher = event_publisher;
  }

  async GetChecklistsByCardId(
    cardId: string
  ): Promise<ResponseData<ChecklistDTO[]>> {
    try {
      return await this.repository_context.checklist.getChecklistsByCardId(cardId);
    } catch (error) {
      console.error(
        "Error in ChecklistController.GetChecklistsByCardId:",
        error
      );
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve checklists",
        data: [],
      };
    }
  }

  async GetChecklistById(id: string): Promise<ResponseData<ChecklistDTO>> {
    try {
      return await this.repository_context.checklist.getChecklistById(id);
    } catch (error) {
      console.error("Error in ChecklistController.GetChecklistById:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve checklist",
      };
    }
  }

  async CreateChecklist(
    user_id: string,
    data: CreateChecklistDTO,
    isAutomatedAction: boolean = false
  ): Promise<ResponseData<ChecklistDTO>> {
    try {
      // For automated actions, check if a checklist with the same name already exists
      // to prevent duplicates from automation race conditions
      if (isAutomatedAction && data.title) {
        const existingChecklists =
          await this.repository_context.checklist.getChecklistsByCardId(data.card_id);
        if (
          existingChecklists.status_code === StatusCodes.OK &&
          existingChecklists.data
        ) {
          const duplicateExists = existingChecklists.data.some(
            (checklist) => checklist.title === data.title
          );

          if (duplicateExists) {
            console.log(
              `[AUTOMATION DEDUP] Checklist "${data.title}" already exists for card ${data.card_id}, skipping creation`
            );
            // Return the existing checklist instead of creating a duplicate
            const existingChecklist = existingChecklists.data.find(
              (checklist) => checklist.title === data.title
            );
            return {
              status_code: StatusCodes.OK,
              message: "Checklist already exists",
              data: existingChecklist!,
            };
          }
        }
      }

      const result = await this.repository_context.checklist.createChecklist({
        ...data,
        created_by: user_id,
      });

      // Publish event for automation (but not for automated actions to prevent infinite loops)
      if (
        result.status_code === StatusCodes.CREATED &&
        result.data &&
        this.event_publisher &&
        !isAutomatedAction // Don't publish events for automated actions
      ) {
        const event: UserActionEvent = {
          eventId: uuidv4(),
          type: EnumUserActionEvent.ChecklistAdded,
          workspace_id: "", // fill later if needed
          user_id: user_id || "system",
          timestamp: new Date(),
          data: {
            card: new CardDetail({
              id: data.card_id
            }),
            checklist: result.data,
          },
        };
        this.event_publisher.publishUserAction(event);
      }

      return result;
    } catch (error) {
      console.error("Error in ChecklistController.CreateChecklist:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to create checklist",
      };
    }
  }

  async UpdateChecklist(
    user_id: string,
    id: string,
    data: UpdateChecklistDTO
  ): Promise<ResponseData<ChecklistDTO>> {
    try {
      // Get previous state
      const prevRes = await this.repository_context.checklist.getChecklistById(id);

      const updateRes = await this.repository_context.checklist.updateChecklist(id, {
        ...data,
        updated_by: user_id,
      });

      if (
        updateRes.status_code === StatusCodes.OK &&
        updateRes.data &&
        prevRes.status_code === StatusCodes.OK &&
        this.event_publisher
      ) {
        const isCompleted = (items: any[]): boolean => {
          if (!items || items.length === 0) return false;
          return items.every((it: any) => it.checked === true);
        };

        const prevCompleted = prevRes.data
          ? isCompleted(prevRes.data.data || [])
          : false;
        const newCompleted = isCompleted(updateRes.data.data || []);

        if (prevCompleted !== newCompleted) {
          // Determine all checklist completion status for the card
          const allChecklistsRes =
            await this.repository_context.checklist.getChecklistsByCardId(
              updateRes.data.card_id
            );
          let allCompletedFlag = false;
          if (
            allChecklistsRes.status_code === StatusCodes.OK &&
            Array.isArray(allChecklistsRes.data) &&
            allChecklistsRes.data.length > 0
          ) {
            allCompletedFlag = allChecklistsRes.data.every((cl: any) =>
              isCompleted(cl.data || [])
            );
          }

          const event: UserActionEvent = {
            eventId: uuidv4(),
            type: newCompleted
              ? EnumUserActionEvent.ChecklistCompleted
              : EnumUserActionEvent.ChecklistIncompleted,
            workspace_id: "", // to fill later
            user_id: "system", // until auth passes user
            timestamp: new Date(),
            data: {
              card: { id: updateRes.data.card_id },
              checklist: {
                id: updateRes.data.id,
                title: updateRes.data.title,
              },
              all_completed: allCompletedFlag,
            } as any,
          } as any;
          this.event_publisher.publishUserAction(event);
        }

        // === NEW: publish events for checklist item state changes ===
        try {
          const prevItems: any[] = (prevRes.data?.data || []) as any[];
          const newItems: any[] = (updateRes.data?.data || []) as any[];

          // Build map of previous items by label for quick lookup
          const prevItemMap = new Map<string, boolean>();
          prevItems.forEach((it) => {
            if (typeof it?.label === "string") {
              prevItemMap.set(it.label, !!it.checked);
            }
          });

          const publisher = this.event_publisher;
          if (publisher) {
            newItems.forEach((it) => {
              if (typeof it?.label !== "string") return;

              const prevChecked = prevItemMap.get(it.label);
              // Only proceed if the item existed before and its checked state changed
              if (prevChecked === undefined || prevChecked === !!it.checked) {
                return;
              }

              const event: UserActionEvent = {
                eventId: uuidv4(),
                type: it.checked
                  ? EnumUserActionEvent.ChecklistItemChecked
                  : EnumUserActionEvent.ChecklistItemUnchecked,
                workspace_id: "", // to fill later
                user_id: user_id || "system",
                timestamp: new Date(),
                data: {
                  card: { id: updateRes.data!.card_id },
                  checklist: {
                    id: updateRes.data!.id,
                    title: updateRes.data!.title,
                  },
                  item: {
                    label: it.label,
                    checked: !!it.checked,
                  },
                },
              } as any;

              publisher.publishUserAction(event);
            });
          }

          // Due date changes
          prevItems.forEach((prevIt) => {
            const newIt = newItems.find((n) => n.label === prevIt.label);
            if (!newIt) return;

            const prevDue = prevIt.due_date as any;
            const newDue = newIt.due_date as any;

            if (prevDue === newDue) return;

            const publisher = this.event_publisher;
            if (!publisher) return;

            const dueEvent: UserActionEvent = {
              eventId: uuidv4(),
              type: newDue
                ? EnumUserActionEvent.ChecklistItemDueDateSet
                : EnumUserActionEvent.ChecklistItemDueDateRemoved,
              workspace_id: "",
              user_id: user_id || "system",
              timestamp: new Date(),
              data: {
                card: { id: updateRes.data!.card_id },
                checklist: {
                  id: updateRes.data!.id,
                  title: updateRes.data!.title,
                },
                item: {
                  label: newIt.label,
                  due_date: newDue || null,
                },
              },
            } as any;

            publisher.publishUserAction(dueEvent);
          });

          // Added / removed items detection
          const newItemLabelSet = new Set<string>();
          newItems.forEach((it) => {
            if (typeof it?.label === "string") newItemLabelSet.add(it.label);
          });

          // Items added
          newItems.forEach((it) => {
            if (typeof it?.label !== "string") return;
            if (!prevItemMap.has(it.label)) {
              // New item
              const publisher2 = this.event_publisher;
              if (!publisher2) return;

              const addEvent: UserActionEvent = {
                eventId: uuidv4(),
                type: EnumUserActionEvent.ChecklistItemAdded,
                workspace_id: "",
                user_id: user_id || "system",
                timestamp: new Date(),
                data: {
                  card: { id: updateRes.data!.card_id },
                  checklist: {
                    id: updateRes.data!.id,
                    title: updateRes.data!.title,
                  },
                  item: {
                    label: it.label,
                    checked: !!it.checked,
                    due_date: it.due_date || null,
                  },
                },
              } as any;

              publisher2.publishUserAction(addEvent);
            }
          });

          // Items removed
          prevItems.forEach((prevIt) => {
            if (typeof prevIt?.label !== "string") return;
            if (!newItemLabelSet.has(prevIt.label)) {
              const publisher3 = this.event_publisher;
              if (!publisher3) return;

              const remEvent: UserActionEvent = {
                eventId: uuidv4(),
                type: EnumUserActionEvent.ChecklistItemRemoved,
                workspace_id: "",
                user_id: user_id || "system",
                timestamp: new Date(),
                data: {
                  card: { id: updateRes.data!.card_id },
                  checklist: {
                    id: updateRes.data!.id,
                    title: updateRes.data!.title,
                  },
                  item: {
                    label: prevIt.label,
                    checked: !!prevIt.checked,
                    due_date: prevIt.due_date || null,
                  },
                },
              } as any;

              publisher3.publishUserAction(remEvent);
            }
          });
        } catch (err) {
          console.error(
            "Failed to publish checklist item checked/unchecked event:",
            err
          );
        }
      }

      return updateRes;
    } catch (error) {
      console.error("Error in ChecklistController.UpdateChecklist:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to update checklist",
      };
    }
  }

  async DeleteChecklist(
    user_id: string,
    id: string
  ): Promise<ResponseData<null>> {
    try {
      // Fetch checklist details before deletion for event context
      const checklistRes = await this.repository_context.checklist.getChecklistById(id);

      const result = await this.repository_context.checklist.deleteChecklist(id);

      if (result === StatusCodes.NOT_FOUND) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Checklist not found",
          data: null,
        };
      }

      if (result === StatusCodes.BAD_REQUEST) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid card ID",
          data: null,
        };
      }

      // Publish event for automation if deletion was successful
      if (
        result === StatusCodes.NO_CONTENT &&
        this.event_publisher &&
        checklistRes.status_code === StatusCodes.OK &&
        checklistRes.data
      ) {
        const event: UserActionEvent = {
          eventId: uuidv4(),
          type: EnumUserActionEvent.ChecklistRemoved,
          workspace_id: "", // fill later if necessary
          user_id: user_id || "system",
          timestamp: new Date(),
          data: {
            card: new CardDetail({ id: checklistRes.data.card_id }),
            checklist: {
              id: checklistRes.data.id,
              title: checklistRes.data.title,
            },
          },
        };
        this.event_publisher.publishUserAction(event);
      }

      return {
        status_code: StatusCodes.NO_CONTENT,
        message: "Checklist deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error in ChecklistController.DeleteChecklist:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to delete checklist",
        data: null,
      };
    }
  }

  async CreateBulkChecklist(
    data: CreateChecklistDTO[]
  ): Promise<ResponseData<ChecklistDTO[]>> {
    try {
      const result = await this.repository_context.checklist.createBulkChecklist(data);
      return result;
    } catch (error) {
      console.error("Error in ChecklistController.CreateBulkChecklist:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to create bulk checklist",
        data: [],
      };
    }
  }
}
