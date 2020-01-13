import { Op } from 'sequelize';
import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .required()
        .min(5),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .positive()
        .required()
        .min(10),
      height: Yup.number()
        .positive()
        .required(),
      weight: Yup.number()
        .positive()
        .required(),
    });

    // schema validation
    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: error.errors, error: 'Validation fails' });
    }

    const studentExist = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExist) {
      return res.status(400).json({ error: 'Student already exists.' });
    }

    const student = await Student.create(req.body);

    return res.json(student);
  }

  async index(req, res) {
    const { page = 1, limit = 20, q } = req.query;

    const params = {
      order: ['name'],
      limit,
      offset: (page - 1) * limit,
    };

    if (q) {
      params.where = { name: { [Op.iLike]: `%${q}%` } };
    }

    const students = await Student.findAll(params);

    return res.json(students);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .min(1),
    });

    const { id } = req.params;

    try {
      await schema.validate({ id }, { abortEarly: false });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: error.errors, error: 'Validation fails' });
    }

    const student = await Student.findByPk(id);

    return res.json(student);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().min(5),
      email: Yup.string().email(),
      height: Yup.number().positive(),
      weight: Yup.number().positive(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res
        .status(400)
        .json({ errors: error.errors, error: 'Validation fails' });
    }

    const { id } = req.params;
    const { email } = req.body;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student doesn´t exists' });
    }

    if (email && email !== student.email) {
      const studentExist = await Student.findOne({
        where: { email },
      });

      if (studentExist) {
        return res.status(400).json({ error: 'Student already exists.' });
      }
    }

    const {
      name,
      email: studentEmail,
      age,
      height,
      weight,
    } = await student.update(req.body);

    return res.json({ id, name, email: studentEmail, age, height, weight });
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

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    await Student.destroy({ where: { id } });

    return res.send();
  }
}

export default new StudentController();
