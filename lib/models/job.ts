import mongoose from "mongoose"

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a job title"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Please provide a company name"],
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
    },
    description: {
      type: String,
      required: [true, "Please provide a job description"],
    },
    requirements: {
      type: String,
      required: [true, "Please provide job requirements"],
    },
    salaryMin: {
      type: Number,
      required: [true, "Please provide minimum salary"],
    },
    salaryMax: {
      type: Number,
      required: [true, "Please provide maximum salary"],
    },
    category: {
      type: String,
      required: [true, "Please provide a job category"],
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Job || mongoose.model("Job", JobSchema)
