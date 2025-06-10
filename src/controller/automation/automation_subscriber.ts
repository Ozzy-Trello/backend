import { connect, NatsConnection, StringCodec } from 'nats';
import { AutomationProcessor } from './automation_processor';
import { UserActionEvent } from '@/types/event';

export class AutomationSubscriber {
  private nc: NatsConnection | null = null;
  private sc = StringCodec();
  private processor: AutomationProcessor;

  constructor(processor: AutomationProcessor) {
    this.processor = processor;
  }

  async connect() {
    this.nc = await connect({ servers: process.env.NATS_URL || 'nats://localhost:4222' });
    console.log('Automation subscriber connected to NATS');
  }

  async startListening() {
    if (!this.nc) {
      throw new Error('NATS connection not established');
    }

    const sub = this.nc.subscribe('user.action.>'); // Make sure it catches all events
    console.log(`Subscribed to NATS on subject: ${sub.getSubject()}`);

    for await (const msg of sub) {
      try {
        const data = JSON.parse(this.sc.decode(msg.data)) as UserActionEvent;
        console.log("Got event:", data);
        await this.processor.processAutomationEvent(data);
      } catch (err) {
        console.error('Failed to handle message:', err);
      }
    }
  }
  
  async close() {
    if (this.nc) {
      await this.nc.close();
    }
  }
}
