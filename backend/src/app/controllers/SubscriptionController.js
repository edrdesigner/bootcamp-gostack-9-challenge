import { isBefore, addMonths, parseISO, startOfDay } from 'date-fns';
import * as Yup from 'yup';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';
import Subscription from '../models/Subscription';
import User from '../models/User';
import Plan from '../models/Plan';
import Student from '../models/Student';

class SubscriptionController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const params = {
      order: ['start_date'],
      limit,
      offset: (page - 1) * limit,
      attributes: ['id', 'start_date', 'end_date', 'price', 'acive'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    };

    const subscriptions = await Subscription.findAll(params);

    return res.json(subscriptions);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      stutend_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: error.errors, error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(400).json({ error: 'Student does not exists' });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists' });
    }

    const startDate = parseISO(start_date);

    if (isBefore(startOfDay(startDate), startOfDay(new Date()))) {
      return res.status(400).json({ error: 'Past dates are not allowed' });
    }

    const end_date = addMonths(startDate, plan.duration);
    const price = plan.price * plan.duration;

    const { id } = await Subscription.create({
      user_id: req.userId,
      start_date: startDate,
      end_date,
      student_id,
      plan_id,
      price,
    });

    const subscription = await Subscription.findByPk(id, {
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    await Queue.add(SubscriptionMail.key, { subscription });

    return res.json(subscription);
  }

  async show(req, res) {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id, {
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(subscription);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      stutend_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: error.errors, error: 'Validation fails' });
    }

    const { id } = req.params;
    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(400).json({ error: 'Subscription does not exists' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(400).json({ error: 'Student does not exists' });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists' });
    }

    const startDate = parseISO(start_date);

    if (isBefore(startOfDay(startDate), startOfDay(new Date()))) {
      return res.status(400).json({ error: 'Past dates are not allowed' });
    }

    const end_date = addMonths(startDate, plan.duration);
    const price = plan.price * plan.duration;

    const subscriptionUpdated = await subscription.update({
      start_date: startDate,
      end_date,
      student_id,
      plan_id,
      price,
    });

    return res.json(subscriptionUpdated);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .required(),
    });

    const { id } = req.params;

    try {
      await schema.validate({ id }, { abortEarly: true });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: error.errors, error: 'Validation fails' });
    }

    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(400).json({ error: 'Subscription does not exists' });
    }

    await Subscription.destroy({ where: { id } });

    return res.send();
  }
}

export default new SubscriptionController();
