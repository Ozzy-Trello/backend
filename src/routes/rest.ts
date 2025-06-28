import { AccessControlController } from "@/controller/access_control/access_control_controller";
import { AccountController } from "@/controller/account/account_controller";
import AccurateController from "@/controller/accurate/accurate_controller";
import { AuthController } from "@/controller/auth/auth_controller";
import { BoardController } from "@/controller/boards/board_controller";
import { CardController } from "@/controller/card/card_controller";
import { CustomFieldController } from "@/controller/custom_field/custom_field_controller";
import { ListController } from "@/controller/list/list_controller";
import { RequestController } from "@/controller/request/request_controller";
import { SplitJobController } from "@/controller/split_job/split_job_controller";
import { TriggerController } from "@/controller/trigger/trigger_controller";
import { WorkspaceController } from "@/controller/workspace/workspace_controller";
import { restJwt } from "@/middleware/rest_middleware";
import { AccurateRepository } from "@/repository/accurate/accurate_repository";
import { BoardRepository } from "@/repository/board/board_repository";
import { CardRepository } from "@/repository/card/card_repository";
import { CustomFieldRepository } from "@/repository/custom_field/custom_field_repository";
import { ListRepository } from "@/repository/list/list_repository";
import { RequestRepository } from "@/repository/request/request_repository";
import { RoleRepository } from "@/repository/role_access/role_repository";
import { SplitJobRepository } from "@/repository/split_job/split_job_repository";
import { TriggerRepository } from "@/repository/trigger/trigger_repository";
import { UserRepository } from "@/repository/user/user_repository";
import { WorkspaceRepository } from "@/repository/workspace/workspace_repository";
import AccessControlRestView from "@/views/rest/access_control_view";
import AccountRestView from "@/views/rest/account_view";
import AccurateRestView from "@/views/rest/accurate_view";
import AuthRestView from "@/views/rest/auth_view";
import BoardRestView from "@/views/rest/board_view";
import CardRestView from "@/views/rest/card_view";
import CustomFieldRestView from "@/views/rest/custom_field_view";
import ListRestView from "@/views/rest/list_view";
import RequestRestView from "@/views/rest/request_view";
import { SplitJobRestView } from "@/routes/split_job/split_job_view";
import TriggerRestView from "@/views/rest/trigger_view";
import { FileRepository } from "@/repository/file/file_repository";
import { FileController } from "@/controller/file/file_controllers";
import FileRestView from "@/views/rest/files_view";
import { CardAttachmentRepository } from "@/repository/card_attachment/card_attachment_repository";
import { CardAttachmentController } from "@/controller/card_attachment/card_attachment_controller";
import CardAttachmentRestView from "@/views/rest/card_attachment_view";
import { ChecklistRepository } from "@/repository/checklist/checklist_repository";
import { ChecklistController } from "@/controller/checklist/checklist_controller";
import ChecklistRestView from "@/views/rest/checklist_view";
import { AdditionalFieldRepository } from "@/repository/additional-field/additional_field_repository";
import { AdditionalFieldController } from "@/controller/additional-field/additional_field_controller";
import AdditionalFieldRestView from "@/views/rest/additional_field_view";
import { CardListTimeRepository } from "@/repository/card_list_time/card_list_time_repository";
import { CardBoardTimeRepository } from "@/repository/card_board_time/card_board_time_repository";
import WorkspaceRestView from "@/views/rest/workspace_view";
import { Router } from "express";
import { LabelRepository } from "@/repository/label/label_repository";
import { LabelController } from "@/controller/label/label_controller";
import { RoleController } from "@/controller/role/role_controller";
import RoleRestView from "@/views/rest/role_view";
import LabelRestView from "@/views/rest/label_view";
import { CardMemberRepository } from "@/repository/card/card_member_repository";
import { CardMemberController } from "@/controller/card/card_member_controller";
import { CardMemberRestView } from "@/views/rest/card_member_view";
import { AutomationRuleRepository } from "@/repository/automation_rule/automation_rule_repository";
import { AutomationRuleActionRepository } from "@/repository/automation_rule_action/automation_rule_action_repository";
import { AutomationRuleController } from "@/controller/automation_rule/automation_rule_controller";
import AutomationRuleRestView from "@/views/rest/automation_rule";
import { AutomationServiceFactory } from "@/controller/automation/automation_factory";
import { AutomationProcessor } from "@/controller/automation/automation_processor";
import { WhatsAppHttpService } from "@/services/whatsapp/whatsapp_http_service";
import { WhatsAppController } from "@/controller/whatsapp/whatsapp_controller";
import { SearchController } from "@/controller/search/search_controller";
import SearchRestView from "@/views/rest/search_view";

export default async function (): Promise<Router> {
  const root_router = Router();
  const automationServiceFactory = new AutomationServiceFactory();
  const automationProcessor = new AutomationProcessor();

  const whatsapp_service = new WhatsAppHttpService();

  // Repositories
  const user_repo = new UserRepository();
  const role_repo = new RoleRepository();
  const workspace_repo = new WorkspaceRepository();
  const board_repo = new BoardRepository();
  const list_repo = new ListRepository();
  const card_repo = new CardRepository();
  const custom_field_repo = new CustomFieldRepository();
  const trigger_repo = new TriggerRepository();
  const file_repository = new FileRepository();
  const card_attachment_repository = new CardAttachmentRepository();
  const checklist_repository = new ChecklistRepository();
  const additional_field_repository = new AdditionalFieldRepository();
  const card_list_time_history_repo = new CardListTimeRepository();
  const card_board_time_history_repo = new CardBoardTimeRepository();
  const accurate_repo = new AccurateRepository();
  const request_repo = new RequestRepository();
  const label_repo = new LabelRepository();
  const card_member_repo = new CardMemberRepository();
  const automation_rule_repo = new AutomationRuleRepository();
  const automation_rule_action_repo = new AutomationRuleActionRepository();

  // Controllers
  const card_attachment_controller = new CardAttachmentController(
    card_attachment_repository,
    file_repository
  );
  const checklist_controller = new ChecklistController(checklist_repository);
  const additional_field_controller = new AdditionalFieldController(
    additional_field_repository
  );
  const trigger_controller = new TriggerController(
    workspace_repo,
    trigger_repo,
    card_repo,
    list_repo,
    user_repo,
    board_repo
  );
  const account_controller = new AccountController(user_repo);
  const access_control_controller = new AccessControlController(role_repo);
  const auth_controller = new AuthController(
    user_repo,
    workspace_repo,
    role_repo
  );
  const workspace_controller = new WorkspaceController(
    workspace_repo,
    role_repo,
    user_repo
  );
  const board_controller = new BoardController(
    board_repo,
    workspace_repo,
    role_repo
  );
  const list_controller = new ListController(list_repo, board_repo);
  const whatsapp_controller = new WhatsAppController(
    whatsapp_service,
    user_repo,
    card_repo,
    custom_field_repo
  );

  const card_controller = new CardController(
    card_repo,
    list_repo,
    custom_field_repo,
    trigger_controller,
    card_attachment_repository,
    card_list_time_history_repo,
    card_board_time_history_repo,
    whatsapp_controller
  );
  const custom_field_controller = new CustomFieldController(
    custom_field_repo,
    workspace_repo,
    trigger_repo,
    trigger_controller
  );
  const file_controller = new FileController(file_repository);
  const accurate_controller = new AccurateController(accurate_repo);
  const request_controller = new RequestController(request_repo, accurate_repo);
  const label_controller = new LabelController(label_repo, workspace_repo);
  const role_controller = new RoleController(role_repo);
  const card_member_controller = new CardMemberController(
    card_member_repo,
    card_repo,
    user_repo
  );
  const automation_rule_controller = new AutomationRuleController(
    automation_rule_repo,
    automation_rule_action_repo,
    card_controller,
    whatsapp_controller,
    custom_field_repo,
    user_repo,
    checklist_controller,
    card_member_controller
  );
  card_controller.SetAutomationRuleController(automation_rule_controller);

  const search_controller = new SearchController(
    card_repo,
    board_repo,
    card_attachment_repository
  );

  // Setup split job repository and controller
  const split_job_repo = new SplitJobRepository();
  const split_job_controller = new SplitJobController(
    split_job_repo,
    workspace_repo,
    custom_field_repo
  );

  // Setup automation
  automationProcessor.setController(automation_rule_controller);
  await automationServiceFactory.init(automationProcessor);

  // Link publisher
  const eventPublisher = automationServiceFactory.getPublisher();
  card_controller.SetEventPublisher(eventPublisher);
  card_controller.SetAutomationRuleController(automation_rule_controller);
  custom_field_controller.SetEventPublisher(eventPublisher);
  list_controller.SetEventPublisher(eventPublisher);
  list_controller.SetAutomationRuleController(automation_rule_controller);
  checklist_controller.SetEventPublisher(eventPublisher);

  // Views
  const trigger_rest_view = new TriggerRestView(trigger_controller);
  const account_rest_view = new AccountRestView(account_controller);
  const access_control_rest_view = new AccessControlRestView(
    access_control_controller
  );
  const auth_rest_view = new AuthRestView(auth_controller);
  const workspace_rest_view = new WorkspaceRestView(workspace_controller);
  const board_rest_view = new BoardRestView(board_controller);
  const list_rest_view = new ListRestView(list_controller);
  const card_rest_view = new CardRestView(card_controller);
  const custom_field_rest_view = new CustomFieldRestView(
    custom_field_controller
  );
  const file_rest_view = new FileRestView(file_controller);
  const card_attachment_rest_view = new CardAttachmentRestView(
    card_attachment_controller
  );
  const label_rest_view = new LabelRestView(label_controller);
  const role_rest_view = new RoleRestView(role_controller);
  const card_member_rest_view = new CardMemberRestView(card_member_controller);

  const checklist_rest_view = new ChecklistRestView(checklist_controller);
  const additional_field_rest_view = new AdditionalFieldRestView(
    additional_field_controller
  );

  const accurate_rest_view = new AccurateRestView(accurate_controller);
  const request_rest_view = new RequestRestView(request_controller);
  const automation_rule_rest_view = new AutomationRuleRestView(
    automation_rule_controller
  );

  const search_rest_view = new SearchRestView(search_controller);

  const router_account = Router();
  {
    router_account.get("/", restJwt, account_rest_view.GetMyAccount);
    router_account.put("/", restJwt, account_rest_view.UpdateMyAccount);
    router_account.get("/list", restJwt, account_rest_view.GetAccountList);
    router_account.get("/:id", restJwt, account_rest_view.GetAccount);
  }

  const router_auth = Router();
  {
    router_auth.post("/login", auth_rest_view.Login);
    router_auth.post("/register", auth_rest_view.Register);
    router_auth.post("/refresh-token", auth_rest_view.RefreshToken);
  }

  const router_workspace = Router();
  {
    router_workspace.post("/", restJwt, workspace_rest_view.CreateWorkspace);
    router_workspace.get("/", restJwt, workspace_rest_view.GetWorkspaceList);
    router_workspace.get(
      "/default",
      restJwt,
      workspace_rest_view.GetDefaultWorkspace
    );
    router_workspace.put(
      "/default",
      restJwt,
      workspace_rest_view.UpdateDefaultWorkspace
    );
    router_workspace.get("/:id", restJwt, workspace_rest_view.GetWorkspace);
    router_workspace.put("/:id", restJwt, workspace_rest_view.UpdateWorkspace);
    router_workspace.delete(
      "/:id",
      restJwt,
      workspace_rest_view.DeleteWorkspace
    );
  }

  const router_board = Router();
  {
    router_board.post("/", restJwt, board_rest_view.CreateBoard);
    router_board.get("/", restJwt, board_rest_view.GetListBoard);
    router_board.get("/:id", restJwt, board_rest_view.GetBoard);
    router_board.put("/:id", restJwt, board_rest_view.UpdateBoard);
    router_board.delete("/:id", restJwt, board_rest_view.DeleteBoard);
  }

  const router_card = Router();
  {
    router_card.post("/", restJwt, card_rest_view.CreateCard);
    router_card.get("/", restJwt, card_rest_view.GetListCard);
    router_card.get("/search", restJwt, card_rest_view.SearchCard);
    router_card.get("/:id", restJwt, card_rest_view.GetCard);
    router_card.put("/:id", restJwt, card_rest_view.UpdateCard);
    router_card.get("/:id/activity", restJwt, card_rest_view.GetCardActivity);
    router_card.delete("/:id", restJwt, card_rest_view.DeleteCard);
    router_card.post("/:id/move", restJwt, card_rest_view.MoveCard);
    router_card.post("/:id/copy", restJwt, card_rest_view.CopyCard);
    router_card.post("/:id/archive", restJwt, card_rest_view.ArchiveCard);
    router_card.post("/:id/unarchive", restJwt, card_rest_view.UnArchiveCard);
    // router_card.post("/:id/custom-field/:custom_field_id", restJwt, card_rest_view.AddCustomField);
    router_card.put(
      "/:id/custom-field/:custom_field_id",
      restJwt,
      card_rest_view.UpdateCustomField
    );
    router_card.delete(
      "/:id/custom-field/:custom_field_id",
      restJwt,
      card_rest_view.RemoveCustomField
    );
    // router_card.get("/:id/custom-field", restJwt, card_rest_view.GetCustomField);
    router_card.get(
      "/:id/custom-field",
      restJwt,
      custom_field_rest_view.GetListCardCustomField
    );
    router_card.post(
      "/:id/custom-field/:custom_field_id",
      restJwt,
      custom_field_rest_view.SetCardCustomFieldValue
    );

    router_card.get(
      "/:id/time-in-lists",
      restJwt,
      card_rest_view.GetCardTimeInList
    );
    router_card.get(
      "/:id/time-in-board/:board_id",
      restJwt,
      card_rest_view.GetCardTimeInBoard
    );
    router_card.get(
      "/:id/dashcard/count/:workspace_id",
      restJwt,
      card_rest_view.GetDashcardCount
    );
    router_card.post("/:id/complete", restJwt, card_rest_view.CompleteCard);
    router_card.post("/:id/incomplete", restJwt, card_rest_view.IncompleteCard);
    router_card.post(
      "/:id/make-mirror",
      restJwt,
      card_rest_view.MakeMirrorCard
    );
    router_card.get("/:id/member", restJwt, card_member_rest_view.getMembers);
    router_card.post("/:id/member", restJwt, card_member_rest_view.addMembers);
    router_card.delete(
      "/:id/member/:user_id",
      restJwt,
      card_member_rest_view.removeMember
    );
    router_card.get(
      "/:id/label",
      restJwt,
      label_rest_view.GetAssignedLabelInCard
    );
    router_card.delete(
      "/:id/label/:label_id",
      restJwt,
      label_rest_view.RemoveLabelFromCard
    );
    router_card.post("/:id/label", restJwt, label_rest_view.AddLabelToCard);
    router_card.get(
      "/:id/list-dashcard/:workspace_id",
      restJwt,
      card_rest_view.GetListDashcard
    );
  }

  const router_list = Router();
  {
    router_list.post("/", restJwt, list_rest_view.CreateList);
    router_list.get("/", restJwt, list_rest_view.GetListList);
    router_list.get("/:id", restJwt, list_rest_view.GetList);
    router_list.put("/:id", restJwt, list_rest_view.UpdateList);
    router_list.delete("/:id", restJwt, list_rest_view.DeleteList);
    router_list.post("/:id/move", restJwt, list_rest_view.MoveList);
  }

  const router_access_control = Router();
  {
    router_access_control.post(
      "/",
      restJwt,
      access_control_rest_view.CreateAccessControl
    );
    router_access_control.get(
      "/",
      restJwt,
      access_control_rest_view.GetAccessControlList
    );
    router_access_control.get(
      "/:id",
      restJwt,
      access_control_rest_view.GetAccessControl
    );
    router_access_control.put(
      "/:id",
      restJwt,
      access_control_rest_view.UpdateAccessControl
    );
    router_access_control.delete(
      "/:id",
      restJwt,
      access_control_rest_view.DeleteAccessControl
    );
  }

  const router_custom_field = Router();
  {
    router_custom_field.post(
      "/",
      restJwt,
      custom_field_rest_view.CreateCustomField
    );
    router_custom_field.get(
      "/",
      restJwt,
      custom_field_rest_view.GetListCustomField
    );
    router_custom_field.get(
      "/:id",
      restJwt,
      custom_field_rest_view.GetCustomField
    );
    router_custom_field.put(
      "/:id",
      restJwt,
      custom_field_rest_view.UpdateCustomField
    );
    router_custom_field.delete(
      "/:id",
      restJwt,
      custom_field_rest_view.DeleteCustomField
    );

    // Add reorder endpoint
    router_custom_field.post(
      "/:customFieldId/reorder",
      restJwt,
      custom_field_rest_view.ReorderCustomFields
    );
  }

  const router_trigger = Router();
  {
    router_trigger.post("/", restJwt, trigger_rest_view.CreateTrigger);
    router_trigger.get("/", restJwt, trigger_rest_view.GetListTrigger);
    router_trigger.get("/:id", restJwt, trigger_rest_view.GetTrigger);
    router_trigger.put("/:id", restJwt, trigger_rest_view.UpdateTrigger);
    router_trigger.delete("/:id", restJwt, trigger_rest_view.DeleteTrigger);
  }

  const router_file = Router();
  {
    router_file.post(
      "/",
      restJwt,
      file_rest_view.uploadMiddleware(),
      file_rest_view.uploadFile
    );
    router_file.get("/", restJwt, file_rest_view.getFileList);
    router_file.get("/:id", restJwt, file_rest_view.getFile);
    router_file.delete("/:id", restJwt, file_rest_view.deleteFile);
  }

  const router_card_attachment = Router();
  {
    router_card_attachment.post(
      "/",
      restJwt,
      card_attachment_rest_view.CreateCardAttachment
    );
    router_card_attachment.get(
      "/",
      restJwt,
      card_attachment_rest_view.GetCardAttachmentList
    );
    router_card_attachment.get(
      "/:id",
      restJwt,
      card_attachment_rest_view.GetCardAttachment
    );
    router_card_attachment.delete(
      "/:id",
      restJwt,
      card_attachment_rest_view.DeleteCardAttachment
    );
  }

  const router_checklist = Router();
  {
    router_checklist.post("/", restJwt, checklist_rest_view.CreateChecklist);
    router_checklist.get(
      "/card/:cardId",
      restJwt,
      checklist_rest_view.GetChecklistsByCardId
    );
    router_checklist.get("/:id", restJwt, checklist_rest_view.GetChecklistById);
    router_checklist.put("/:id", restJwt, checklist_rest_view.UpdateChecklist);
    router_checklist.delete(
      "/:id",
      restJwt,
      checklist_rest_view.DeleteChecklist
    );
  }

  const router_accurate = Router();
  {
    router_accurate.post("/webhook", accurate_rest_view.Webhook);
    router_accurate.get(
      "/item-category-list",
      restJwt,
      accurate_rest_view.GetItemCategoryList
    );
    router_accurate.get(
      "/item-category/:id",
      restJwt,
      accurate_rest_view.GetItemCategoryDetail
    );
    router_accurate.get("/item/:id", restJwt, accurate_rest_view.GetItemDetail);
    router_accurate.get("/item-list", restJwt, accurate_rest_view.GetItemList);
    router_accurate.get(
      "/glaccount-list",
      restJwt,
      accurate_rest_view.GetGlaccountList
    );
    router_accurate.post(
      "/item-adjustment",
      restJwt,
      accurate_rest_view.SaveItemAdjustment
    );
  }

  const router_request = Router();
  {
    router_request.post("/", restJwt, request_rest_view.Create);
    router_request.get("/", restJwt, request_rest_view.GetAllRequests);
    router_request.get(
      "/card/:cardId",
      restJwt,
      request_rest_view.GetRequestsByCardId
    );
    router_request.post("/:id/verify", restJwt, request_rest_view.Verify);
    router_request.patch("/:id", restJwt, request_rest_view.Patch);
  }

  const router_additional_field = Router();
  {
    router_additional_field.post(
      "/",
      restJwt,
      additional_field_rest_view.CreateAdditionalField
    );
    router_additional_field.get(
      "/card/:cardId",
      restJwt,
      additional_field_rest_view.GetAdditionalFieldsByCardId
    );
    router_additional_field.get(
      "/:id",
      restJwt,
      additional_field_rest_view.GetAdditionalFieldById
    );
    router_additional_field.put(
      "/:id",
      restJwt,
      additional_field_rest_view.UpdateAdditionalField
    );
    router_additional_field.delete(
      "/:id",
      restJwt,
      additional_field_rest_view.DeleteAdditionalField
    );
  }

  const router_label = Router();
  {
    router_label.post("/", restJwt, label_rest_view.CreateLabel);
    router_label.get("/", restJwt, label_rest_view.GetLabels);
    router_label.get("/:id", restJwt, label_rest_view.GetLabel);
    router_label.put("/:id", restJwt, label_rest_view.UpdateLabel);
    router_label.delete("/:id", restJwt, label_rest_view.DeleteLabel);
  }

  const router_role = Router();
  {
    router_role.get("/", restJwt, role_rest_view.GetRoleList);
    router_role.get("/:id", restJwt, role_rest_view.GetRole);
  }

  const automation_rule_router = Router();
  {
    automation_rule_router.post(
      "/",
      restJwt,
      automation_rule_rest_view.CreateAutomationRule
    );
    automation_rule_router.get(
      "/",
      restJwt,
      automation_rule_rest_view.GetListAutomationRule
    );
  }

  const router_search = Router();
  {
    router_search.get("/", restJwt, search_rest_view.UnifiedSearch);
  }

  // Initialize split job view with controller
  const split_job_rest_view = new SplitJobRestView(split_job_controller);

  root_router.use("/auth", router_auth);
  root_router.use("/account", router_account);
  root_router.use("/workspace", router_workspace);
  root_router.use("/board", router_board);
  root_router.use("/list", router_list);
  root_router.use("/card", router_card);
  root_router.use("/custom-field", router_custom_field);
  root_router.use("/split-job", split_job_rest_view.router);
  root_router.use("/file", router_file);
  root_router.use("/card-attachment", router_card_attachment);
  root_router.use("/checklist", router_checklist);
  root_router.use("/accurate", router_accurate);
  root_router.use("/request", router_request);
  root_router.use("/additional-field", router_additional_field);
  root_router.use("/label", router_label);
  root_router.use("/roles", router_role);
  root_router.use("/automation-rule", automation_rule_router);
  root_router.use("/search", router_search);

  return root_router;
}
