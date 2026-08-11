import { useState, useEffect } from "react";
import axios from "axios";

function SubCategory() {
  const [catId, setCatId] = useState("");
  const [subCatName, setSubCatName] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:5000/api/categories");
    setCategories(res.data);
  };

  const fetchSubCategories = async () => {
    const res = await axios.get("http://localhost:5000/api/subcategories");
    setSubCategories(res.data);
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/subcategories", {
        cat_id: catId,
        sub_cat_name: subCatName,
      });
      setMessage("Subcategory added successfully");
      setSubCatName("");
      setCatId("");
      fetchSubCategories();
    } catch (error) {
      setMessage("Failed to add subcategory");
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Subcategories</h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <select
          value={catId}
          onChange={(e) => setCatId(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.cat_id} value={cat.cat_id}>
              {cat.cat_name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Subcategory name"
          value={subCatName}
          onChange={(e) => setSubCatName(e.target.value)}
          className="border rounded px-3 py-2 w-64"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Subcategory
        </button>
      </form>

      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">ID</th>
            <th className="py-2">Subcategory</th>
            <th className="py-2">Category</th>
          </tr>
        </thead>
        <tbody>
          {subCategories.map((sub) => (
            <tr key={sub.sub_cat_id} className="border-b">
              <td className="py-2">{sub.sub_cat_id}</td>
              <td className="py-2">{sub.sub_cat_name}</td>
              <td className="py-2">{sub.Category?.cat_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubCategory;
