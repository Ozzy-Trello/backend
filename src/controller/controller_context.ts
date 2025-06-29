import { RepositoryContext } from "@/repository/repository_context";
import { CardAttachmentControllerI } from "./card_attachment/card_attachment_interface";
import { CardAttachmentController } from "./card_attachment/card_attachment_controller";
import { ChecklistController } from "./checklist/checklist_controller";
import { AccountControllerI } from "./account/account_interfaces";
import { AdditionalFieldController } from "./additional-field/additional_field_controller";
import { AccountController } from "./account/account_controller";
import { AccessControlController } from "./access_control/access_control_controller";
import { AuthController } from "./auth/auth_controller";
import { WorkspaceController } from "./workspace/workspace_controller";
import { AccessControlControllerI } from "./access_control/access_control_interfaces";
import { AuthControllerI } from "./auth/auth_interfaces";
import { WorkspaceControllerI } from "./workspace/workspace_interfaces";
import { BoardControllerI } from "./boards/board_interfaces";
import { BoardController } from "./boards/board_controller";
import { ListController } from "./list/list_controller";
import { WhatsAppController, WhatsAppControllerI } from "./whatsapp/whatsapp_controller";
import { CardController } from "./card/card_controller";
import { CustomFieldController } from "./custom_field/custom_field_controller";
import { ListControllerI } from "./list/list_interfaces";
import { CardControllerI } from "./card/card_interfaces";
import { CustomFieldControllerI } from "./custom_field/custom_field_interfaces";
import { FileController } from "./file/file_controllers";
import AccurateController from "./accurate/accurate_controller";
import { RequestController } from "./request/request_controller";
import { LabelController } from "./label/label_controller";
import { RoleController } from "./role/role_controller";
import { CardMemberController } from "./card/card_member_controller";
import { AutomationRuleController } from "./automation_rule/automation_rule_controller";
import { AutomationServiceFactory } from "./automation/automation_factory";
import { AutomationProcessor } from "./automation/automation_processor";
import { WhatsAppHttpService } from "@/services/whatsapp/whatsapp_http_service";
import { FileControllerI } from "./file/file_interfaces";
import { RoleControllerI } from "./role/role_interfaces";
import { LabelControllerI } from "./label/label_interfaces";
import { CardMemberControllerI } from "./card/card_member_interfaces";
import { SearchControllerI } from "./search/search_interfaces";
import { SearchController } from "./search/search_controller";
import { SplitJobController } from "./split_job/split_job_controller";
import { AutomationRuleControllerI } from "./automation_rule/automation_rule_interface";
import { IChecklistController } from "./checklist/checklist_interfaces";

export class ControllerContext {
  public repository_context: RepositoryContext;
  public automation_service_factory: AutomationServiceFactory;
  public whatsapp_http_service: WhatsAppHttpService;

  public card_attachment: CardAttachmentControllerI;
  public checklist: IChecklistController;
  public account: AccountControllerI;
  public additional_field: AdditionalFieldController;
  public access_control: AccessControlControllerI;
  public auth: AuthControllerI;
  public workspace: WorkspaceControllerI;
  public board: BoardControllerI;
  public list: ListControllerI;
  public whatsapp: WhatsAppControllerI;
  public card: CardControllerI;
  public custom_field: CustomFieldControllerI;
  public file: FileControllerI;
  public accurate: AccurateController;
  public request: RequestController;
  public label: LabelControllerI;
  public role: RoleControllerI
  public card_member: CardMemberControllerI;
  public automation : AutomationRuleControllerI;
  public search: SearchControllerI;
  public split_job: SplitJobController;

  constructor(
    repository_context: RepositoryContext, 
    automation_service_factory: AutomationServiceFactory,
    whatsapp_http_service: WhatsAppHttpService
  ) {
    this.repository_context = repository_context;
    this.automation_service_factory = automation_service_factory;
    this.whatsapp_http_service = whatsapp_http_service;

    this.card_attachment = new CardAttachmentController(repository_context);
    this.checklist = new ChecklistController(repository_context);
    this.additional_field = new AdditionalFieldController(repository_context);
    this.account = new AccountController(repository_context);
    this.access_control = new AccessControlController(repository_context);
    this.auth = new AuthController(repository_context);
    this.workspace = new WorkspaceController(repository_context);
    this.board = new BoardController(repository_context);
    this.list = new ListController(repository_context);
    this.whatsapp = new WhatsAppController(whatsapp_http_service, repository_context);
    
    this.custom_field = new CustomFieldController(repository_context);
    this.file = new FileController(repository_context);
    this.accurate = new AccurateController(repository_context);
    this.request = new RequestController(repository_context);
    this.label = new LabelController(repository_context);
    this.role = new RoleController(repository_context);
    this.card_member = new CardMemberController(repository_context);
    let automationInstance = new AutomationRuleController(repository_context);


    let cardInstance = new CardController(repository_context, this.whatsapp);
    cardInstance.SetAutomationRuleController(automationInstance);
    this.card = cardInstance;
    this.automation = automationInstance;

    this.search = new SearchController(repository_context);
    this.split_job = new SplitJobController(repository_context);
  }
}