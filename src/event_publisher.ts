import { connect, NatsConnection, StringCodec } from 'nats';
import { UserActionEvent } from './types/event';

export class EventPublisher {
  private nc: NatsConnection | null = null;
  private sc = StringCodec();

  async connect() {
    this.nc = await connect({ servers: process.env.NATS_URL || 'nats://localhost:4222' });
    console.log('Connected to NATS server');
  }

  async publishUserAction(event: UserActionEvent) {
    if (!this.nc) {
      throw new Error('NATS connection not established');
    }

    const subject = `user.action.${event.type}`;
    await this.nc.publish(subject, this.sc.encode(JSON.stringify(event)));
    console.log(`Published event: ${subject}`);
  }

  async close() {
    if (this.nc) {
      await this.nc.close();
    }
  }
}
