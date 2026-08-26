import { EventEmitter } from 'events';
import { auditService } from '../../modules/audit/audit.service';

export interface DomainEvent {
  name: string;
  payload: any;
  timestamp: Date;
}

class DomainEventBus extends EventEmitter {
  constructor() {
    super();
    this.registerAuditListeners();
  }

  private registerAuditListeners() {
    // Automatically log any admin mutation event without tight coupling
    this.on('admin.funds_adjusted', (data) => {
      auditService.log({
        actorId: data.actorId,
        actorRole: data.actorRole,
        action: data.type === 'ADD' ? 'ADD_DEMO_FUNDS' : 'REMOVE_DEMO_FUNDS',
        targetEntity: 'ACCOUNT',
        targetId: data.accountId,
        stateBefore: data.stateBefore,
        stateAfter: data.stateAfter,
        ipAddress: data.ipAddress,
      });
    });

    this.on('admin.status_changed', (data) => {
      auditService.log({
        actorId: data.actorId,
        actorRole: data.actorRole,
        action: data.status === 'ACTIVE' ? 'ACTIVATE_USER' : 'SUSPEND_USER',
        targetEntity: 'USER',
        targetId: data.targetUserId,
        stateBefore: data.stateBefore,
        stateAfter: data.stateAfter,
        ipAddress: data.ipAddress,
      });
    });

    this.on('admin.order_executed', (data) => {
      auditService.log({
        actorId: data.actorId,
        actorRole: data.actorRole,
        action: `CRM_ORDER_${data.order.side}`,
        targetEntity: 'ORDER',
        targetId: data.order.orderId,
        stateBefore: null,
        stateAfter: { symbol: data.order.symbol, quantity: data.order.quantity, price: data.order.executedPrice, targetUserId: data.targetUserId },
        ipAddress: data.ipAddress,
      });
    });

    this.on('admin.position_closed', (data) => {
      auditService.log({
        actorId: data.actorId,
        actorRole: data.actorRole,
        action: 'CRM_POSITION_CLOSE',
        targetEntity: 'POSITION',
        targetId: data.positionId,
        stateBefore: null,
        stateAfter: { result: data.result, targetUserId: data.targetUserId },
        ipAddress: data.ipAddress,
      });
    });
  }
}

export const eventBus = new DomainEventBus();
