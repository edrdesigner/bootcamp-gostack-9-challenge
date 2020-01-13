import Sequelize from 'sequelize';
import databaseConfig from '../config/database';
import User from '../app/models/User';
import Student from '../app/models/Student';
import Plan from '../app/models/Plan';
import CheckIn from '../app/models/CheckIn';
import HelpOrder from '../app/models/HelpOrder';
import Subscription from '../app/models/Subscription';

const models = [User, Student, Plan, Subscription, CheckIn, HelpOrder];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
