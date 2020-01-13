module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('help-orders', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'students',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          allowNull: false,
        },
      },
      question: { type: Sequelize.STRING, allowNull: false },
      answer: { type: Sequelize.STRING },
      answer_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('help-orders');
  },
};
