import React, { useState } from "react";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3000/blog/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setFileUrl(data.fileUrl);
        setMessage("File uploaded successfully");
      } else {
        setMessage("Failed to upload file");
      }
    } catch (err) {
      setMessage("Error uploading file");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
      {fileUrl && (
        <div>
          <h4>Uploaded File URL:</h4>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {fileUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
