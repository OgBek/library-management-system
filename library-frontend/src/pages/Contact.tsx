import React from "react";

const Contact: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 font-sans leading-relaxed text-gray-700">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Contact Us</h2>

      <p className="text-lg mb-6">
        Have questions or suggestions? <br />
        Reach out to our team and we’ll get back to you shortly.
      </p>

      <ul className="list-none space-y-3 text-lg">
        <li>
          📧 Email:{" "}
          <a
            href="mailto:library@university.edu"
            className="text-blue-600 hover:underline"
          >
            library@university.edu
          </a>
        </li>
        <li>📞 Phone: +251 972718887</li>
        <li>🏢 Address: Addis Ababa , Ethiopia</li>
      </ul>
    </div>
  );
};

export default Contact;
