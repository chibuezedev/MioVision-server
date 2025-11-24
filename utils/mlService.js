const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

class MLService {
  constructor() {
    this.baseURL = process.env.ML_MODEL_URL || "http://localhost:8000";
  }

  async predictMyopia(imagePath) {
    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(imagePath));

      const response = await axios.post(`${this.baseURL}/predict`, formData, {
        headers: formData.getHeaders(),
        timeout: 30000, // 30 seconds
      });

      return response.data;
    } catch (error) {
      console.error("ML Service Error:", error.message);
      throw new Error("Failed to get prediction from ML model");
    }
  }

  determineRiskLevel(prediction, confidence) {
    if (prediction === "NORMAL") {
      return "low";
    }

    // MYOPIA detected
    if (confidence >= 80) {
      return "high";
    } else if (confidence >= 60) {
      return "medium";
    } else {
      return "low";
    }
  }

  generateRecommendations(risk, prediction) {
    const recommendations = [];

    if (risk === "low") {
      recommendations.push("Continue regular eye check-ups every 6-12 months");
      recommendations.push("Maintain good eye health habits");
      recommendations.push("Ensure adequate outdoor time and proper lighting");
    } else if (risk === "medium") {
      recommendations.push("Schedule follow-up examination within 3 months");
      recommendations.push("Monitor closely for any vision changes");
      recommendations.push("Consider corrective measures if symptoms develop");
      recommendations.push("Limit prolonged near work and screen time");
    } else if (risk === "high") {
      recommendations.push(
        "Immediate consultation with eye specialist required"
      );
      recommendations.push("Consider corrective lenses or other interventions");
      recommendations.push("Regular monitoring every 3-6 months");
      recommendations.push("Implement myopia control strategies");
      recommendations.push("Educate on lifestyle modifications");
    }

    return recommendations;
  }
}

module.exports = new MLService();
