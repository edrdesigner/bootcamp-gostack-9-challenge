import * as Yup from 'yup';
import Queue from '../../lib/Queue';
import HelpOrderMail from '../jobs/HelpOrderMail';
import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

class AnswerController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const params = {
      limit,
      where: { answer: null },
      attributes: ['id', 'question', 'created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
      offset: (page - 1) * limit,
    };

    const answers = await HelpOrder.findAll(params);

    return res.json(answers);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      answer: Yup.string().required(),
    });

    const { id } = req.params;
    const { answer } = req.body;

    try {
      await schema.validate({ id, answer }, { abortEarly: false });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: error.errors, error: 'Validation fails' });
    }

    const helpOrder = await HelpOrder.findByPk(id);

    if (!helpOrder) {
      return res.status(400).json({ error: 'Help order does not exits' });
    }

    await helpOrder.update({ answer, answer_at: Date.now() });

    const helpOrderUpdated = await HelpOrder.findByPk(id, {
      attributes: ['id', 'question', 'answer', 'created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    await Queue.add(HelpOrderMail.key, { helpOrder: helpOrderUpdated });

    return res.json(helpOrderUpdated);
  }
}

export default new AnswerController();
