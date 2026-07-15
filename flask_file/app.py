from flask import Flask, jsonify, request
from flask_cors import CORS
import time

# Initialize the Flask application
app = Flask(__name__)

# Enable CORS to allow your Java Spring Boot backend to communicate with this API
CORS(app)

@app.route('/api/status', methods=['GET'])
def check_status():
    """Health check endpoint to verify the Flask server is running."""
    return jsonify({
        "status": "success",
        "message": "EduAI Python Microservice is online and ready on Port 5000!"
    }), 200

@app.route('/api/ml/predict', methods=['POST'])
def run_ml_prediction():
    """
    Receives data from the Java Spring Boot backend, 
    runs the Machine Learning models (BERT/XGBoost), 
    and returns the analyzed results.
    """
    # 1. Capture the incoming data
    incoming_data = request.get_json()
    print(f"Received data for analysis: {incoming_data}")
    
    # 2. Simulate AI processing time (Replace this later with your real ML models)
    time.sleep(1.5) 
    
    # 3. Construct the result to send back to Java
    prediction_result = {
        "status": "success",
        "readiness_score": 92,
        "prediction": "Highly Employable",
        "identified_skills": ["SQL", "Database Management", "Java"],
        "skill_gaps": ["Advanced System Design"],
        "shap_explanation": "Consistent attendance and high assessment scores positively influenced this prediction."
    }
    
    return jsonify(prediction_result), 200

if __name__ == '__main__':
    # Start the Flask server on port 5000
    print("Starting EduAI Machine Learning Microservice...")
    app.run(debug=True, host='0.0.0.0', port=5000)