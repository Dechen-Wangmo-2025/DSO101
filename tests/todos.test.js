const request = require('supertest');
const app = require('../src/app');
const fs = require('fs');
const path = require('path');

const todosFilePath = path.join(__dirname, '../data/todos.json');

// Reset todos before each test
beforeEach(() => {
    fs.writeFileSync(todosFilePath, JSON.stringify([]));
});

// Clean up after all tests
afterAll(() => {
    fs.writeFileSync(todosFilePath, JSON.stringify([]));
});

describe('Todo API Tests', () => {
    
    // Test 1: GET /todos - Empty array initially
    test('GET /todos should return empty array when no todos exist', async () => {
        const response = await request(app)
            .get('/todos')
            .expect(200);
        
        expect(response.body).toEqual([]);
    });
    
    // Test 2: POST /todos - Create a new todo
    test('POST /todos should create a new todo', async () => {
        const newTodo = {
            title: 'Complete CI/CD assignment',
            description: 'Set up GitHub Actions and Docker'
        };
        
        const response = await request(app)
            .post('/todos')
            .send(newTodo)
            .expect(201);
        
        expect(response.body.title).toBe(newTodo.title);
        expect(response.body.description).toBe(newTodo.description);
        expect(response.body.completed).toBe(false);
        expect(response.body.id).toBeDefined();
    });
    
    // Test 3: POST /todos - Validation (title required)
    test('POST /todos should return 400 if title is missing', async () => {
        const response = await request(app)
            .post('/todos')
            .send({ description: 'Missing title' })
            .expect(400);
        
        expect(response.body.error).toBeDefined();
    });
    
    // Test 4: GET /todos/:id - Get a specific todo
    test('GET /todos/:id should return a specific todo', async () => {
        // First create a todo
        const createResponse = await request(app)
            .post('/todos')
            .send({ title: 'Test todo' });
        
        const todoId = createResponse.body.id;
        
        // Then fetch it
        const getResponse = await request(app)
            .get(`/todos/${todoId}`)
            .expect(200);
        
        expect(getResponse.body.title).toBe('Test todo');
    });
    
    // Test 5: GET /todos/:id - 404 for non-existent todo
    test('GET /todos/:id should return 404 for non-existent todo', async () => {
        const response = await request(app)
            .get('/todos/9999')
            .expect(404);
        
        expect(response.body.error).toBe('Todo not found');
    });
    
    // Test 6: PUT /todos/:id - Update a todo
    test('PUT /todos/:id should update an existing todo', async () => {
        // Create a todo
        const createResponse = await request(app)
            .post('/todos')
            .send({ title: 'Original title' });
        
        const todoId = createResponse.body.id;
        
        // Update it
        const updateResponse = await request(app)
            .put(`/todos/${todoId}`)
            .send({ title: 'Updated title', completed: true })
            .expect(200);
        
        expect(updateResponse.body.title).toBe('Updated title');
        expect(updateResponse.body.completed).toBe(true);
    });
    
    // Test 7: DELETE /todos/:id - Delete a todo
    test('DELETE /todos/:id should delete a todo', async () => {
        // Create a todo
        const createResponse = await request(app)
            .post('/todos')
            .send({ title: 'To be deleted' });
        
        const todoId = createResponse.body.id;
        
        // Delete it
        await request(app)
            .delete(`/todos/${todoId}`)
            .expect(200);
        
        // Verify it's gone
        await request(app)
            .get(`/todos/${todoId}`)
            .expect(404);
    });
    
    // Test 8: GET /health - Health check
    test('GET /health should return status OK', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);
        
        expect(response.body.status).toBe('OK');
    });
    
    // Test 9: Create multiple todos and list them
    test('GET /todos should return all created todos', async () => {
        // Create two todos
        await request(app)
            .post('/todos')
            .send({ title: 'First todo' });
        
        await request(app)
            .post('/todos')
            .send({ title: 'Second todo' });
        
        const response = await request(app)
            .get('/todos')
            .expect(200);
        
        expect(response.body.length).toBe(2);
        expect(response.body[0].title).toBe('First todo');
        expect(response.body[1].title).toBe('Second todo');
    });
});