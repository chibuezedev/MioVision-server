const Patient = require("../models/Patient");
const Examination = require("../models/Examination");
const MyopiaPrediction = require("../models/MyopiaPrediction");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;

    // Total patients
    const totalPatients = await Patient.countDocuments({ hospitalId });

    // Total examinations
    const totalExamined = await Examination.countDocuments({});

    // Total predictions
    const totalPredictions = await MyopiaPrediction.countDocuments({});

    // Positive detections (myopia detected)
    const positiveDetections = await MyopiaPrediction.countDocuments({
      myopiaRisk: { $in: ["medium", "high"] },
    });

    // Detection rate
    const detectionRate =
      totalPredictions > 0
        ? ((positiveDetections / totalPredictions) * 100).toFixed(2)
        : 0;

    // Myopia distribution
    const lowRisk = await MyopiaPrediction.countDocuments({
      myopiaRisk: "low",
    });
    const mediumRisk = await MyopiaPrediction.countDocuments({
      myopiaRisk: "medium",
    });
    const highRisk = await MyopiaPrediction.countDocuments({
      myopiaRisk: "high",
    });

    res.json({
      success: true,
      data: {
        totalExamined,
        positiveDetections,
        detectionRate: parseFloat(detectionRate),
        totalPatients,
        myopiaDistribution: {
          low: lowRisk,
          medium: mediumRisk,
          high: highRisk,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyTrends = async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const examinations = await Examination.aggregate([
      {
        $match: {
          examinationDate: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$examinationDate" },
            month: { $month: "$examinationDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    const predictions = await MyopiaPrediction.aggregate([
      {
        $match: {
          predictedAt: { $gte: twelveMonthsAgo },
          myopiaRisk: { $in: ["medium", "high"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$predictedAt" },
            month: { $month: "$predictedAt" },
          },
          detections: { $sum: 1 },
        },
      },
    ]);

    // Merge results
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const trends = examinations.map((exam) => {
      const prediction = predictions.find(
        (p) => p._id.year === exam._id.year && p._id.month === exam._id.month
      );

      return {
        month: `${monthNames[exam._id.month - 1]} ${exam._id.year}`,
        count: exam.count,
        detections: prediction ? prediction.detections : 0,
      };
    });

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAgeGroupAnalysis = async (req, res, next) => {
  try {
    const patients = await Patient.find({
      hospitalId: req.user.hospitalId,
    }).select("dateOfBirth");

    const ageGroups = {
      "0-10": 0,
      "11-20": 0,
      "21-30": 0,
      "31-40": 0,
      "41-50": 0,
      "51-60": 0,
      "61+": 0,
    };

    patients.forEach((patient) => {
      const age =
        new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

      if (age <= 10) ageGroups["0-10"]++;
      else if (age <= 20) ageGroups["11-20"]++;
      else if (age <= 30) ageGroups["21-30"]++;
      else if (age <= 40) ageGroups["31-40"]++;
      else if (age <= 50) ageGroups["41-50"]++;
      else if (age <= 60) ageGroups["51-60"]++;
      else ageGroups["61+"]++;
    });

    const result = Object.entries(ageGroups).map(([ageGroup, count]) => ({
      ageGroup,
      count,
    }));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getExaminedPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Get patients with at least one examination
    const examinedPatientIds = await Examination.distinct("patientId");

    const total = examinedPatientIds.length;
    const patients = await Patient.find({
      _id: { $in: examinedPatientIds },
      hospitalId: req.user.hospitalId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: patients,
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

exports.getAllPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await Patient.countDocuments({
      hospitalId: req.user.hospitalId,
    });

    const patients = await Patient.find({
      hospitalId: req.user.hospitalId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: patients,
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
