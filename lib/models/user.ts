import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "recruiter"],
      default: "user",
    },
    company: {
      type: String,
      required: function () {
        return this.role === "recruiter"
      },
    },
    resumeUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
)

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.models.User || mongoose.model("User", UserSchema)
