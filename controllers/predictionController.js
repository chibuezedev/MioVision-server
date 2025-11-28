const mlService = require("../utils/mlService");
const Examination = require("../models/Examination");
const MyopiaPrediction = require("../models/MyopiaPrediction");

exports.createPrediction = async (req, res, next) => {
  try {
    const examination = await Examination.findById(
      req.params.examinationId
    ).populate("patientId");

    if (!examination) {
      return res.status(404).json({
        success: false,
        error: "Examination not found",
      });
    }

    if (!examination.imageUrl) {
      return res.status(400).json({
        success: false,
        error: "No image available for prediction",
      });
    }

    // Check if prediction already exists
    let prediction = await MyopiaPrediction.findOne({
      examinationId: examination._id,
    });

    // if (prediction) {
    //   return res.json({
    //     success: true,
    //     data: prediction,
    //     message: "Prediction already exists",
    //   });
    // }

    // Download image temporarily for ML prediction
    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");

    const tempPath = path.join("uploads", `temp-${Date.now()}.jpg`);
    const writer = fs.createWriteStream(tempPath);

    const response = await axios({
      url: examination.imageUrl,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Call ML service
    const mlResult = await mlService.predictMyopia(tempPath);

    // Clean up temp file
    fs.unlinkSync(tempPath);

    // Determine risk level and recommendations
    const risk = mlService.determineRiskLevel(
      mlResult.prediction,
      mlResult.confidence
    );
    const recommendations = mlService.generateRecommendations(
      risk,
      mlResult.prediction
    );

    // Create prediction record
    prediction = await MyopiaPrediction.create({
      examinationId: examination._id,
      patientId: examination.patientId._id,
      myopiaRisk: risk,
      confidence: mlResult.confidence / 100, // Convert to decimal
      recommendations,
      mlPrediction: mlResult.prediction,
      probabilityMyopia: mlResult.probability_myopia,
      probabilityNormal: mlResult.probability_normal,
    });

    res.status(201).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPredictions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const patientId = req.query.patientId;

    const query = {};
    if (patientId) {
      query.patientId = patientId;
    }

    const total = await MyopiaPrediction.countDocuments(query);
    const predictions = await MyopiaPrediction.find(query)
      .populate("patientId examinationId")
      .sort({ predictedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: predictions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPrediction = async (req, res, next) => {
  try {
    const prediction = await MyopiaPrediction.findById(req.params.id).populate(
      "patientId examinationId"
    );

    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: "Prediction not found",
      });
    }

    res.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatientPredictions = async (req, res, next) => {
  try {
    const predictions = await MyopiaPrediction.find({
      patientId: req.params.patientId,
    })
      .populate("examinationId")
      .sort({ predictedAt: -1 });

    res.json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
};
