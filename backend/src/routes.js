import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import CheckInController from './app/controllers/CheckInController';
import HelpOrderController from './app/controllers/HelpOrderController';
import AnswerController from './app/controllers/AnswerController';
import SubscriptionController from './app/controllers/SubscriptionController';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/students/:id', StudentController.show);
routes.get('/students/:student_id/checkins', CheckInController.index);
routes.post('/students/:student_id/checkins', CheckInController.store);
routes.get('/students/:student_id/help-orders', HelpOrderController.index);
routes.post('/students/:student_id/help-orders', HelpOrderController.store);

routes.use(authMiddleware);
routes.put('/users', UserController.update);

routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);
routes.get('/students', StudentController.index);
routes.delete('/students/:id', StudentController.delete);

routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.get('/plans', PlanController.index);
routes.get('/plans/:id', PlanController.show);
routes.delete('/plans/:id', PlanController.delete);

routes.get('/subscriptions', SubscriptionController.index);
routes.post('/subscriptions', SubscriptionController.store);
routes.get('/subscriptions/:id', SubscriptionController.show);
routes.put('/subscriptions/:id', SubscriptionController.update);
routes.delete('/subscriptions/:id', SubscriptionController.delete);

routes.get('/help-orders', AnswerController.index);
routes.put('/help-orders/:id', AnswerController.store);

export default routes;
