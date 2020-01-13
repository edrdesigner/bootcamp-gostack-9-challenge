import * as Yup from 'yup';
import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
  async index(req, res) {
    const { student_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
    });

    try {
      await schema.validate({ student_id }, { abortEarly: false });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: error.errors, error: 'Validation fails' });
    }

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exits' });
    }

    const params = {
      order: [['id', 'desc']],
      limit,
      where: { student_id },
      offset: (page - 1) * limit,
    };

    const helpOrders = await HelpOrder.findAll(params);

    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string()
        .required()
        .min(3),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: error.errors, error: 'Validation fails' });
    }

    const { student_id } = req.params;
    const { question } = req.body;

    const helpOrder = await HelpOrder.create({ student_id, question });

    return res.json(helpOrder);
  }
}

export default new HelpOrderController();
