import { Op } from 'sequelize';
import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const { page = 1, limit = 20, q } = req.query;
    const params = {
      order: ['title'],
      limit,
      offset: (page - 1) * limit,
    };

    if (q) {
      params.where = { title: { [Op.iLike]: `%${q}%` } };
    }

    const plans = await Plan.findAll(params);

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string()
        .required()
        .min(3),
      duration: Yup.number()
        .positive()
        .required()
        .min(1),
      price: Yup.number().min(1),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: error.errors, error: 'Validation fails' });
    }

    const { title } = req.body;

    const planExists = await Plan.findOne({ where: { title } });

    if (planExists) {
      return res.status(400).json({ error: 'Plan already exists' });
    }

    const { duration, price } = await Plan.create(req.body);

    return res.json({ title, duration, price });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string()
        .required()
        .min(3),
      duration: Yup.number()
        .positive()
        .min(1),
      price: Yup.number().min(1),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: error.errors, error: 'Validation fails' });
    }

    const { id } = req.params;
    const { title } = req.body;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan doesn´t exists' });
    }

    if (title && title !== plan.title) {
      const planExists = await Plan.findOne({
        where: { title },
      });

      if (planExists) {
        return res.status(400).json({ error: 'Plan already exists.' });
      }
    }

    const { title: planTitle, duration, price } = await plan.update(req.body);

    return res.send({ title: planTitle, duration, price });
  }

  async show(req, res) {
    const { id } = req.params;
    const plan = await Plan.findByPk(id, {
      attributes: ['id', 'title', 'duration', 'price'],
    });

    return res.json(plan);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .required(),
    });

    const { id } = req.params;

    try {
      await schema.validate({ id }, { abortEarly: false });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: error.errors, error: 'Validation fails' });
    }

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists' });
    }

    try {
      await Plan.destroy({ where: { id } });
    } catch (error) {
      return res.status(403).json({ error: 'This plan has students' });
    }

    return res.send();
  }
}

export default new PlanController();
