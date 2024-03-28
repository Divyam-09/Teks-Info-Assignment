/* eslint-disable no-unused-vars */
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      alert("Please enter a valid mobile number starting with 6, 7, 8, or 9");
      return;
    }

    // Mobile and Email Validation checks
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobilePattern = /^\d{10}$/;
    if (!emailPattern.test(email)) {
      setErrorMessage("Invalid email address");
      return;
    }
    if (!mobilePattern.test(mobile)) {
      setErrorMessage("Mobile number should be 10 digits long");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("mobile", mobile);
    formData.append("profileImage", profileImage);

    try {
      const response = await axios.post(
        "http://localhost:3000/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setVerificationMessage(
        "Registeration done . Please check your email for verify your email"
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
      <div className="bg-white p-3 rounded w-25">
        <h2>Register</h2>
        {verificationMessage && <p>{verificationMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>
              <strong>Name</strong>
            </label>
            <input
              type="text"
              placeholder="Enter Name"
              autoComplete="off"
              name="name"
              className="form-control rounded-0"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>
              <strong>Email</strong>
            </label>
            <input
              type="text"
              placeholder="Enter Email"
              autoComplete="off"
              name="email"
              className="form-control rounded-0"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>
              <strong>Password</strong>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              name="password"
              className="form-control rounded-0"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>
              <strong>Mobile Number</strong>
            </label>
            <input
              type="number"
              placeholder="Enter Mobile Number"
              name="mobile number"
              className="form-control rounded-0"
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          {/* file upload */}
          <div className="mb-3">
            <label htmlFor="profileImage" className="form-label">
              <strong>Profile Image</strong>
            </label>
            <input
              type="file"
              className="form-control"
              id="profileImage"
              onChange={(e) => setProfileImage(e.target.files[0])}
            />
          </div>

          {errorMessage && <p className="text-danger">{errorMessage}</p>}

          <button type="submit" className="btn btn-success w-100 rounded-0">
            Register
          </button>
        </form>
        <p>Already have an account</p>
        <Link
          to="/login"
          className="btn btn-default border w-100 bg-light rounded-0"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
