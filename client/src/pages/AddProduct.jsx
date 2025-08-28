import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL;


const AddProduct = () => {
  const [form, setForm] = useState({ 
    title: "", 
    price: "", 
    description: "", 
    imageUrl: "", 
    category: "" 
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [categories] = useState([
    "Electronics",
    "Clothing",
    "Footwear",
    "Books",
    "Beauty"
  ]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`${BASE_URL}/api/products/${id}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        setForm(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    try {
      if (id) {
        await axios.put(`${BASE_URL}/api/products/${id}`, form, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        setSuccessMessage("Product updated successfully!");
      } else {
       await axios.post(`${BASE_URL}/api/products`, form, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        setSuccessMessage("Product added successfully!");
      }
      setTimeout(() => setSuccessMessage(""), 3000);
      navigate("/dashboard/products");
    } catch (err) {
      console.error("Error submitting product:", err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {id ? "Edit Product" : "Add Product"}
      </h1>

      {successMessage && (
        <div className="bg-green-500 text-white p-4 rounded-lg mb-4 text-center">
          {successMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 shadow-lg rounded-2xl"
      >
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="border p-2 rounded-lg"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="border p-2 rounded-lg"
          required
        />
        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={handleChange}
          className="border p-2 rounded-lg"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded-lg"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded-lg md:col-span-2"
          rows="4"
          required
        />
        <button
          type="submit"
          className="md:col-span-2 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
        >
          {id ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;