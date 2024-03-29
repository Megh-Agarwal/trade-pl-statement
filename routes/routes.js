const express = require('express');
const router = express.Router();

const { getIndexPage, getTradesPage, getNotificationsPage, getWorkerJs, postNotification, getNotificationLogsPage, getTechnicalsPage } = require('../controllers/controller.js');

router.get('/', getIndexPage);
router.get('/trades', getTradesPage);
router.get('/notifications', getNotificationsPage);
router.get('/worker.js', getWorkerJs);
router.post('/notify', postNotification);
router.get('/notifications/logs', getNotificationLogsPage);
router.get('/technicals', getTechnicalsPage);

module.exports = router;