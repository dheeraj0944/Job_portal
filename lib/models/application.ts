import mongoose from "mongoose"

const ApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: {
      type: String,
      default: "",
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "rejected", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true },
)

export default mongoose.models.Application || mongoose.model("Application", ApplicationSchema)
