const cloudinaryService = require("../utils/cloudinaryService");
const Examination = require("../models/Examination");
const MyopiaPrediction = require("../models/MyopiaPrediction");

exports.createExamination = async (req, res, next) => {
  try {
    const examinationData = {
      ...req.body,
      createdBy: req.user.id,
      examinationDate: new Date(),
    };

    if (req.file) {
      const uploadResult = await cloudinaryService.uploadImage(req.file.path);
      examinationData.imageUrl = uploadResult.url;
      examinationData.imagePublicId = uploadResult.publicId;
    }

    const examination = await Examination.create(examinationData);
    await examination.populate("patientId createdBy");

    res.status(201).json({
      success: true,
      data: examination,
    });
  } catch (error) {
    next(error);
  }
};

exports.getExaminations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const patientId = req.query.patientId;

    const query = {};
    if (patientId) {
      query.patientId = patientId;
    }

    const total = await Examination.countDocuments(query);
    const examinations = await Examination.find(query)
      .populate("patientId createdBy")
      .sort({ examinationDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: examinations,
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

exports.getExamination = async (req, res, next) => {
  try {
    const examination = await Examination.findById(req.params.id).populate(
      "patientId createdBy"
    );

    if (!examination) {
      return res.status(404).json({
        success: false,
        error: "Examination not found",
      });
    }

    // Get prediction if exists
    const prediction = await MyopiaPrediction.findOne({
      examinationId: examination._id,
    });

    res.json({
      success: true,
      data: {
        ...examination.toObject(),
        prediction,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateExamination = async (req, res, next) => {
  try {
    const examination = await Examination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("patientId createdBy");

    if (!examination) {
      return res.status(404).json({
        success: false,
        error: "Examination not found",
      });
    }

    res.json({
      success: true,
      data: examination,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteExamination = async (req, res, next) => {
  try {
    const examination = await Examination.findById(req.params.id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        error: "Examination not found",
      });
    }

    // Delete image from Cloudinary
    if (examination.imagePublicId) {
      await cloudinaryService.deleteImage(examination.imagePublicId);
    }

    // Delete prediction
    await MyopiaPrediction.deleteMany({ examinationId: examination._id });
    await examination.deleteOne();

    res.json({
      success: true,
      message: "Examination deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided",
      });
    }

    const examination = await Examination.findById(req.params.id);
    if (!examination) {
      return res.status(404).json({
        success: false,
        error: "Examination not found",
      });
    }

    // Delete old image if exists
    if (examination.imagePublicId) {
      await cloudinaryService.deleteImage(examination.imagePublicId);
    }

    // Upload new image
    const uploadResult = await cloudinaryService.uploadImage(req.file.path);

    examination.imageUrl = uploadResult.url;
    examination.imagePublicId = uploadResult.publicId;
    await examination.save();

    res.json({
      success: true,
      data: {
        imageUrl: uploadResult.url,
      },
    });
  } catch (error) {
    next(error);
  }
};
