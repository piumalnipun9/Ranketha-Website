
'use client';

import { useState } from 'react';

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Upload successful! Created: ${data.created}, Updated: ${data.updated}`);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('An unexpected error occurred.');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Products CSV</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv" onChange={handleFileChange} className="mb-4" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Upload</button>
      </form>
      {message && <p className="mt-4">{message}</p>}

      <div className="mt-8 p-4 border rounded">
        <h2 className="text-xl font-semibold">CSV Format Instructions</h2>
        <p>The CSV file must have the following headers:</p>
        <ul className="list-disc list-inside mt-2">
          <li>name (required)</li>
          <li>price (required)</li>
          <li>cost (required)</li>
          <li>stock (required)</li>
          <li>category (required)</li>
          <li>brand (required)</li>
          <li>description (optional)</li>
          <li>imageUrl (optional)</li>
        </ul>
        <p className="mt-2">If a product with the same name already exists, it will be updated. Otherwise, a new product will be created.</p>
      </div>
    </div>
  );
}
