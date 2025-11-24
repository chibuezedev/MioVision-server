const mongoose = require("mongoose");

const examinationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    examinationDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    leftEyeVision: {
      type: Number,
    },
    rightEyeVision: {
      type: Number,
    },
    intraocularPressure: {
      type: Number,
    },
    imageUrl: {
      type: String,
    },
    imagePublicId: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

examinationSchema.index({ patientId: 1 });
examinationSchema.index({ createdBy: 1 });

module.exports = mongoose.model("Examination", examinationSchema);
