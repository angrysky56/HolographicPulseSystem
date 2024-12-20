/**
 * Implements IBM-style Command Manager pattern for managing async operations
 */
export class CommandManager {
    constructor() {
        this.commands = new Map();
        this.commandQueue = [];
        this.compensations = new Map();
        this.lastCommandId = 0;
    }

    /**
     * Register a command type with its execution and compensation logic
     */
    registerCommandType(type, executor, compensator) {
        this.compensations.set(type, {
            execute: executor,
            compensate: compensator
        });
    }

    /**
     * Queue a command for execution
     */
    async queueCommand(type, params) {
        const commandId = `cmd_${++this.lastCommandId}`;
        const command = {
            id: commandId,
            type,
            params,
            status: 'queued',
            queuedAt: new Date(),
            history: [{
                status: 'queued',
                timestamp: new Date()
            }]
        };

        this.commands.set(commandId, command);
        this.commandQueue.push(commandId);
        
        // Start processing if it's the only command
        if (this.commandQueue.length === 1) {
            this.processQueue();
        }

        return commandId;
    }

    /**
     * Process the command queue
     */
    async processQueue() {
        while (this.commandQueue.length > 0) {
            const commandId = this.commandQueue[0];
            const command = this.commands.get(commandId);

            try {
                // Update status to running
                this.updateCommandStatus(commandId, 'running');

                // Get the executor for this command type
                const executor = this.compensations.get(command.type)?.execute;
                if (!executor) {
                    throw new Error(`No executor found for command type: ${command.type}`);
                }

                // Execute the command
                const result = await executor(command.params);

                // Update command with success
                this.updateCommandStatus(commandId, 'completed', result);
            } catch (error) {
                // Handle failure and attempt compensation
                await this.handleCommandFailure(commandId, error);
            } finally {
                // Remove from queue regardless of outcome
                this.commandQueue.shift();
            }
        }
    }

    /**
     * Handle command failure and compensation
     */
    async handleCommandFailure(commandId, error) {
        const command = this.commands.get(commandId);
        const compensator = this.compensations.get(command.type)?.compensate;

        this.updateCommandStatus(commandId, 'failed', { error: error.message });

        if (compensator) {
            try {
                await compensator(command.params);
                this.updateCommandStatus(commandId, 'compensated');
            } catch (compError) {
                this.updateCommandStatus(commandId, 'compensation_failed', {
                    error: compError.message
                });
            }
        }
    }

    /**
     * Update command status and history
     */
    updateCommandStatus(commandId, status, result = null) {
        const command = this.commands.get(commandId);
        if (command) {
            command.status = status;
            command.history.push({
                status,
                timestamp: new Date(),
                result
            });
            if (['completed', 'failed', 'compensated', 'compensation_failed'].includes(status)) {
                command.completedAt = new Date();
            }
        }
    }

    /**
     * Get command status and history
     */
    getCommandStatus(commandId) {
        const command = this.commands.get(commandId);
        if (!command) return null;

        return {
            id: command.id,
            type: command.type,
            status: command.status,
            queuedAt: command.queuedAt,
            completedAt: command.completedAt,
            history: command.history
        };
    }

    /**
     * Clear completed commands older than specified age
     */
    clearOldCommands(maxAgeMs = 24 * 60 * 60 * 1000) { // Default 24 hours
        const now = new Date();
        for (const [commandId, command] of this.commands.entries()) {
            if (command.completedAt && (now - command.completedAt > maxAgeMs)) {
                this.commands.delete(commandId);
            }
        }
    }
}