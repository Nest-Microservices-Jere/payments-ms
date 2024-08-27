import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.STRIPE_API_KEY);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { items, currency, orderId } = paymentSessionDto;

    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId: orderId
        },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/payments/success',
      cancel_url: 'http://localhost:3000/payments/cancel',
    });
    return session;
  }

  async stripeWebhook(req: Request, res: Response) {
    const sign = req.headers['stripe-signature'];
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sign,
        envs.ENDPOINT_SECRET,
      );
    } catch (error) {
      console.log(error);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
    console.log(event);
    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object;
        console.log(chargeSucceeded.metadata.orderId);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return res.status(200).json({sign});
  }
}
