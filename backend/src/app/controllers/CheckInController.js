import * as Yup from 'yup';
import { subDays } from 'date-fns';
import { Op } from 'sequelize';

import CheckIn from '../models/CheckIn';
import Student from '../models/Student';

class CheckInController {
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

    const checkins = await CheckIn.findAll(params);

    return res.json(checkins);
  }

  async store(req, res) {
    const { student_id } = req.params;

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

    const minDate = subDays(new Date(), 7);

    const totalChekinsLastSevenDays = await CheckIn.count({
      where: {
        student_id,
        created_at: { [Op.between]: [minDate, new Date()] },
      },
    });

    if (totalChekinsLastSevenDays >= 5) {
      return res
        .status(400)
        .json({ error: 'Maximum number of check ins in last 7 days reached' });
    }

    const checkIn = await CheckIn.create({ student_id });

    return res.json({ checkIn });
  }
}

export default new CheckInController();
