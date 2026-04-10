import crypto from 'crypto'
import {
  AuthorizePaymentOutput,
  CancelPaymentOutput,
  CapturePaymentOutput,
  DeletePaymentOutput,
  GetPaymentStatusOutput,
  InitiatePaymentOutput,
  MedusaContainer,
  RefundPaymentOutput,
  RetrievePaymentOutput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from '@medusajs/types'
import { AbstractPaymentProvider, PaymentActions, PaymentSessionStatus } from '@medusajs/utils'

type Options = {
  options: {
    bank_name: String,
    account_name: String,
    bank_account: String
  }
}

class xTransferPaymentProviderService extends AbstractPaymentProvider<
  Options
> {
  static identifier = "ttlater"
  options: Options
  constructor(container, options) {
    super(container)
    this.options = options
  }
  // TODO implement methods
  async capturePayment(): Promise<CapturePaymentOutput> {
    return { data: { } }
  }
  async authorizePayment(): Promise<AuthorizePaymentOutput> {
    return { data: {
      ...this.options
    }, status: PaymentSessionStatus.AUTHORIZED }
  }
  async cancelPayment(): Promise<CancelPaymentOutput> {
    return { data: {} }
  }
  async initiatePayment(): Promise<InitiatePaymentOutput> {
    return { data: {
      ...this.options
    }, id: crypto.randomUUID() }
  }
  async deletePayment(): Promise<DeletePaymentOutput> {
    return { data: {} }
  }
  async getPaymentStatus(): Promise<GetPaymentStatusOutput> {
    throw new Error('Method not implemented.')
  }
  async refundPayment(): Promise<RefundPaymentOutput> {
    return { data: {} }
  }
  async retrievePayment(): Promise<RetrievePaymentOutput> {
    return {}
  }
  async updatePayment(): Promise<UpdatePaymentOutput> {
    return { data: {} }
  }
  async getWebhookActionAndData(): Promise<WebhookActionResult> {
    return { action: PaymentActions.NOT_SUPPORTED }
  }
}

export default xTransferPaymentProviderService