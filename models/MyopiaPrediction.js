const mongoose = require('mongoose');

const myopiaPredictionSchema = new mongoose.Schema({
  examinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Examination',
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  myopiaRisk: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
  },
  sphericalEquivalent: {
    type: Number,
  },
  recommendations: {
    type: [String],
    default: [],
  },
  predictedAt: {
    type: Date,
    default: Date.now,
  },
  mlPrediction: {
    type: String, // 'MYOPIA' or 'NORMAL'
  },
  probabilityMyopia: {
    type: Number,
  },
  probabilityNormal: {
    type: Number,
  },
}, {
  timestamps: true,
});

myopiaPredictionSchema.index({ patientId: 1 });
myopiaPredictionSchema.index({ examinationId: 1 });
myopiaPredictionSchema.index({ myopiaRisk: 1 });

module.exports = mongoose.model('MyopiaPrediction', myopiaPredictionSchema);
