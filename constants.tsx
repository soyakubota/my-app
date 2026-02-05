
import React from 'react';

export const FLASK_SKELETON = `from flask import Flask, jsonify, request
import time
import random

app = Flask(__name__)

# Mock Database
DATABASE = {
    "items": [
        {"id": 1, "name": "Item A", "status": "active"},
        {"id": 2, "name": "Item B", "status": "pending"}
    ]
}

@app.route('/', methods=['GET'])
def root():
    """Root endpoint to avoid 404 on base URL."""
    return jsonify({
        "message": "Welcome to the LoadTest Mastery API",
        "endpoints": ["/api/health", "/api/data", "/api/process"],
        "status": "online"
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": time.time()})

@app.route('/api/data', methods=['GET'])
def get_data():
    # Simulate variable processing time (10ms to 200ms)
    time.sleep(random.uniform(0.01, 0.2))
    return jsonify(DATABASE)

@app.route('/api/process', methods=['POST'])
def process_task():
    data = request.json
    # Simulate heavy computation or DB write (100ms to 500ms)
    time.sleep(random.uniform(0.1, 0.5))
    return jsonify({"message": "Processed", "received": data}), 201

if __name__ == '__main__':
    # Use host='0.0.0.0' to allow external access if needed
    app.run(debug=True, port=5000)
`;

export const LOCUST_SKELETON = `from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    # Wait time between tasks (1 to 5 seconds)
    wait_time = between(1, 5)

    @task(5)  # Weight 5: Most frequent
    def check_root(self):
        self.client.get("/")

    @task(3)  # Weight 3: Frequent task
    def view_items(self):
        self.client.get("/api/data")

    @task(1)  # Weight 1: Occasional task
    def create_task(self):
        self.client.post("/api/process", json={
            "user_id": 42,
            "action": "load_test_trial"
        })

    @task(2)
    def check_health(self):
        self.client.get("/api/health")

# CLI Usage: locust -f locustfile.py --host http://localhost:5000
`;

export const SETUP_COMMANDS = [
  {
    title: "1. Install Dependencies",
    command: "pip install flask locust",
    description: "Installs the web framework and the load testing tool."
  },
  {
    title: "2. Start Flask Server",
    command: "python app.py",
    description: "Launches the API on http://127.0.0.1:5000."
  },
  {
    title: "3. Run Locust Test",
    command: "locust -f locustfile.py",
    description: "Opens the Locust web interface on http://localhost:8089."
  }
];
