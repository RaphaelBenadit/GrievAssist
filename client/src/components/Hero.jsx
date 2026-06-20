import React from "react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="flex flex-col items-center justify-center flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center p-10">
      <h2 className="text-4xl font-bold mb-4">Welcome to GrievAssist</h2>
      <p className="max-w-2xl mb-6">
        Submit your complaints easily and let our AI-powered system 
        categorize and prioritize them for faster resolution.
      </p>
      <Link
        to="/login"
        className="bg-white text-blue-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200"
      >
        Post a Complaint
      </Link>
    </section>
  );
}

export default Hero;
