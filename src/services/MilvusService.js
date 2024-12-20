import { MilvusClient } from '@zilliz/milvus2-sdk-node';

export class MilvusService {
    constructor(collectionName = 'agent_memory', dimension = 384) {
        const host = process.env.MILVUS_HOST || 'localhost';
        const port = process.env.MILVUS_PORT || '19530';
        
        this.client = new MilvusClient({
            address: `${host}:${port}`,
            username: '',
            password: ''
        });
        
        this.collectionName = collectionName;
        this.dimension = dimension;
        this.retryAttempts = 3;
        this.retryDelay = 2000;
    }

    async initialize() {
        await this.connect();
        await this.createCollection();
    }

    async connect() {
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const health = await this.client.checkHealth();
                console.log('Successfully connected to Milvus:', health);
                return true;
            } catch (error) {
                console.log(`Connection attempt ${attempt} failed:`, error.message);
                if (attempt < this.retryAttempts) {
                    console.log(`Retrying in ${this.retryDelay/1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                }
            }
        }
        throw new Error('Failed to connect to Milvus after multiple attempts');
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async createCollection() {
        try {
            console.log('Creating collection:', this.collectionName);
            
            // Drop if exists
            try {
                await this.client.dropCollection({
                    collection_name: this.collectionName
                });
                console.log('Dropped existing collection');
                // Wait for collection to be fully dropped
                await this.sleep(2000);
            } catch (error) {
                // Ignore errors if collection doesn't exist
                console.log('No existing collection to drop');
            }

            // Create new collection
            const schema = {
                collection_name: this.collectionName,
                description: "Agent memory vectors",
                fields: [
                    {
                        name: 'id',
                        description: 'Primary key',
                        data_type: 'VarChar',
                        max_length: 100,
                        is_primary_key: true,
                        auto_id: false
                    },
                    {
                        name: 'vector',
                        description: 'Vector data',
                        data_type: 'FloatVector',
                        dim: this.dimension
                    },
                    {
                        name: 'metadata',
                        description: 'Additional metadata',
                        data_type: 'VarChar',
                        max_length: 65535
                    }
                ]
            };

            await this.client.createCollection(schema);
            console.log('Collection created successfully');
            
            // Wait for collection to be fully created
            await this.sleep(2000);

            // Create index
            const indexParams = {
                collection_name: this.collectionName,
                field_name: 'vector',
                extra_params: {
                    index_type: "IVF_FLAT",
                    metric_type: "L2",
                    params: JSON.stringify({ nlist: 1024 })
                }
            };
            
            await this.client.createIndex(indexParams);
            console.log('Index created successfully');
            
            // Wait for index to be built
            await this.sleep(5000);
            console.log('Index built successfully');

            // Load collection
            await this.client.loadCollection({
                collection_name: this.collectionName,
            });
            console.log('Collection loaded successfully');

        } catch (error) {
            console.error('Error setting up collection:', error);
            throw error;
        }
    }

    async insertVector(id, vector, metadata = {}) {
        try {
            const data = {
                collection_name: this.collectionName,
                fields_data: [{
                    id: String(id),
                    vector,
                    metadata: JSON.stringify(metadata)
                }]
            };
            
            const result = await this.client.insert(data);
            console.log('Vector inserted:', id);
            return result;
        } catch (error) {
            console.error('Error inserting vector:', error);
            throw error;
        }
    }

    async searchSimilar(vector, topK = 5, filter = {}) {
        try {
            const search_params = {
                collection_name: this.collectionName,
                vector_field: 'vector',
                vectors: [vector],
                limit: topK,
                output_fields: ['id', 'metadata'],
                search_params: {
                    anns_field: "vector",
                    topk: topK,
                    metric_type: "L2",
                    params: JSON.stringify({ nprobe: 10 })
                }
            };

            if (Object.keys(filter).length > 0) {
                search_params.expr = JSON.stringify(filter);
            }

            const result = await this.client.search(search_params);
            return result;
        } catch (error) {
            console.error('Error searching vectors:', error);
            throw error;
        }
    }

    async updateVector(id, vector, metadata = {}) {
        try {
            // Delete old vector
            await this.client.deleteEntities({
                collection_name: this.collectionName,
                expr: `id == "${id}"`
            });

            // Insert new vector
            return await this.insertVector(id, vector, metadata);
        } catch (error) {
            console.error('Error updating vector:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.client.closeConnection();
            console.log('Disconnected from Milvus');
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
    }
}