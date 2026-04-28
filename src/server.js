const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Todo Server is running on port ${PORT}`);
    console.log(`📝 API available at http://localhost:${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
});"// Trigger CI/CD" 
