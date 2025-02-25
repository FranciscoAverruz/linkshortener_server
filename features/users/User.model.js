const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require ("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    urls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Url' }],
    scheduledForDeletion: { type: Date, default: null }, 
    isCancellationPending: { type: Boolean, default: false }, 
    cancellationRequestedAt: { type: Date, default: null }, 
  },
  {
    timestamps: true,
  }
);

UserSchema.statics.signup = async function (username, email, isAdmin, urls, password) {

  const exists = await this.findOne({email})

  if (exists) {
    throw Error ('this email address is already registered')
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  const user = await this.create({username, email, isAdmin, urls, password:hash})

  return user
}

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJWT = function () {

  let payload = {
    id: this._id,
    email: this.email,
    username: this.username,
    isAdmin: this.isAdmin,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '2d',
  });
};

module.exports = mongoose.model("User", UserSchema);