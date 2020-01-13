import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscritionMail';
  }

  async handle({ data }) {
    const { subscription } = data;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    await Mail.sendMail({
      to: `${subscription.student.name} <${subscription.student.email}>`,
      subject: 'Welcome to GymPoint',
      template: 'subscription',
      context: {
        plan: subscription.plan.title,
        student_id: subscription.student_id,
        name: subscription.student.name,
        startDate: format(
          parseISO(subscription.start_date),
          "MMMM dd ',' yyyy"
        ),
        endDate: format(parseISO(subscription.endDate), "MMMM dd ',' yyyy"),
        price: formatter.format(subscription.price),
      },
    });
  }
}

export default new SubscriptionMail();
