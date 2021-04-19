import nodeCron from 'node-cron';

nodeCron.schedule('* * * * *',() => {
    console.log('running a task every minute');
})