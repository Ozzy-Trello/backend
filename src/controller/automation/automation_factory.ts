import { EventPublisher } from "@/event_publisher";
import { AutomationProcessor } from "./automation_processor";
import { AutomationSubscriber } from "./automation_subscriber";

export class AutomationServiceFactory {
  private eventPublisher!: EventPublisher;
  private automationSubscriber!: AutomationSubscriber;

  async init(automationProcessor: AutomationProcessor) {
    this.eventPublisher = new EventPublisher();
    await this.eventPublisher.connect();

    this.automationSubscriber = new AutomationSubscriber(automationProcessor);
    await this.automationSubscriber.connect();
    this.automationSubscriber.startListening();
  }

  getPublisher(): EventPublisher {
    return this.eventPublisher;
  }
}
