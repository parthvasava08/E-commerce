import { useState, useEffect } from "react";
import axios from "axios";

function Category() {
  const [catName, setCatName] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/categories", {
        cat_name: catName,
      });
      setMessage("Category added successfully");
      setCatName("");
      fetchCategories(); // refresh the table
    } catch (error) {
      setMessage("Failed to add category");
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Categories</h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Category name"
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          className="border rounded px-3 py-2 w-64"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Category
        </button>
      </form>

      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">ID</th>
            <th className="py-2">Name</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.cat_id} className="border-b">
              <td className="py-2">{cat.cat_id}</td>
              <td className="py-2">{cat.cat_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Category;
