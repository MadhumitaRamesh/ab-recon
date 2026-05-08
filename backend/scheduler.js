const cron = require('node-cron');
const db = require('./db');
const { runReconciliation } = require('./ReconEngine');

/**
 * Maps product frequency to standard cron expressions
 */
const getCronExpression = (frequency) => {
    switch (frequency) {
        case 'Daily': return '0 0 * * *';   // Midnight every day
        case 'Weekly': return '0 0 * * 1';  // Monday at Midnight
        case 'Monthly': return '0 0 1 * *'; // 1st of every month at Midnight
        case 'Hourly': return '0 * * * *';  // Top of every hour
        default: return null;
    }
};

/**
 * Initializes all automated reconciliation schedules
 */
async function initScheduler() {
    console.log('[SCHEDULER] Initializing automated reconciliation jobs...');

    try {
        const [masters] = await db.promise().query('SELECT * FROM masters WHERE status = "Active"');
        
        masters.forEach(master => {
            const expression = getCronExpression(master.frequency);
            
            if (expression) {
                console.log(`[SCHEDULER] Scheduled: ${master.name} | Frequency: ${master.frequency} | Cron: ${expression}`);
                
                cron.schedule(expression, async () => {
                    console.log(`[SCHEDULER] Triggering Cron Run for: ${master.name}`);
                    
                    try {
                        const runDate = new Date().toISOString().split('T')[0];
                        
                        // Simulation: For a real automated run, we would fetch data from the sources 
                        // configured in master.source_config here.
                        const simulatedSourceData = {
                            source1: [
                                { amount: 1500.50, reference_number: 'TXN-001', unique_reference_number: 'U-999' },
                                { amount: 200.00, reference_number: 'TXN-002', unique_reference_number: 'U-888' }
                            ],
                            source2: [
                                { amount: 1500.50, reference_number: 'TXN-001', unique_reference_number: 'U-999' }
                                // TXN-002 is missing -> will create an exception
                            ]
                        };

                        await runReconciliation(master, simulatedSourceData, runDate, 'Cron');
                        console.log(`[SCHEDULER] Cron Run Successful: ${master.name}`);
                    } catch (err) {
                        console.error(`[SCHEDULER] Cron Run Failed for ${master.name}:`, err.message);
                    }
                });
            } else {
                console.warn(`[SCHEDULER] Unsupported frequency for ${master.name}: ${master.frequency}`);
            }
        });

    } catch (err) {
        console.error('[SCHEDULER] Initialization Failed:', err.message);
    }
}

module.exports = { initScheduler };
