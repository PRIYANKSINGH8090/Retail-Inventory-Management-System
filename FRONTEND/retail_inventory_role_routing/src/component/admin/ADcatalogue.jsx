
import { useEffect, useState } from "react";
import axios from "axios";

export default function ADcatalogue() {

  const [products, setProducts] = useState([]);

  const [showAddProduct, setShowAddProduct] = useState(false);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Electronics etc. have no expiry date, medicine does
  const [hasExpiry, setHasExpiry] = useState(true);

  const [form, setForm] = useState({
    supplierEmail: "",
    name: "",
    mfg: "",
    exp: "",
    categoryId: "",
    cost: "",
    productDesc: "",
    image: null,
  });


  // =========================
  // GET PRODUCTS
  // =========================

  const fetchProducts = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:8000/api/v1/product/view"
      );

      setProducts(response.data?.data || []);

    } catch (error) {

      console.log("Fetch products error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to load products."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);


  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    setMessage("");
    setError("");
  };


  // =========================
  // HANDLE IMAGE
  // =========================

  const handleImage = (e) => {

    setForm({
      ...form,
      image: e.target.files[0],
    });

    setMessage("");
    setError("");
  };


  // =========================
  // ADD PRODUCT
  // =========================

  const addProduct = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");


    // Validation

    if (
      !form.supplierEmail ||
      !form.name ||
      !form.mfg ||
      (hasExpiry && !form.exp) ||
      !form.categoryId ||
      !form.cost ||
      !form.image
    ) {

      setError(
        "Please fill all required fields and select an image."
      );

      return;
    }


    try {

      const formData = new FormData();


      formData.append(
        "supplierEmail",
        form.supplierEmail
      );

      formData.append(
        "name",
        form.name
      );

      formData.append(
        "mfg",
        form.mfg
      );

      if (hasExpiry && form.exp) {
        formData.append(
          "exp",
          form.exp
        );
      }

      formData.append(
        "categoryId",
        form.categoryId
      );

      formData.append(
        "cost",
        form.cost
      );

      formData.append(
        "productDesc",
        form.productDesc
      );

      formData.append(
        "image",
        form.image
      );


      const response = await axios.post(
        "http://localhost:8000/api/v1/product/add",
        formData
      );


      console.log(
        "Product response:",
        response.data
      );


      setMessage(
        response.data?.message ||
        "Product added successfully."
      );


      // Clear form

      setForm({
        supplierEmail: "",
        name: "",
        mfg: "",
        exp: "",
        categoryId: "",
        cost: "",
        productDesc: "",
        image: null,
      });

      setHasExpiry(true);


      // Close form

      setShowAddProduct(false);


      // Refresh catalogue

      fetchProducts();


    } catch (error) {

      console.log(
        "Add product error:",
        error.response?.data
      );


      setError(
        error.response?.data?.message ||
        "Failed to add product."
      );

    }
  };


  return (

    <div>

      {/* =========================
          HEADER
      ========================= */}

      <div className="admin-page-header">

        <div>

          <h1>
            Catalogue
          </h1>

          <p>
            Manage products available from the warehouse.
          </p>

        </div>


        <button
          className="admin-btn"
          onClick={() => {

            setShowAddProduct(true);
            setMessage("");
            setError("");

          }}
        >
          Add product
        </button>

      </div>


      {/* =========================
          SUCCESS MESSAGE
      ========================= */}

      {message && (

        <div className="mb-5 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">

          {message}

        </div>

      )}


      {/* =========================
          ERROR MESSAGE
      ========================= */}

      {error && (

        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">

          {error}

        </div>

      )}


      {/* =========================
          ADD PRODUCT FORM
      ========================= */}

      {showAddProduct && (

        <section className="admin-panel mb-8">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-xl font-semibold">
                Add Product
              </h2>

              <p className="text-sm text-[#8faec2] mt-1">
                Add a new product to your inventory.
              </p>

            </div>


            <button
              type="button"
              onClick={() => setShowAddProduct(false)}
              className="text-[#8faec2] hover:text-white text-xl"
            >
              ✕
            </button>

          </div>


          <form
            onSubmit={addProduct}
            className="space-y-5"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              {/* SUPPLIER EMAIL */}

              <div>

                <label className="block text-sm text-[#8faec2] mb-2">
                  Supplier Email *
                </label>

                <input
                  type="email"
                  name="supplierEmail"
                  value={form.supplierEmail}
                  onChange={handleChange}
                  placeholder="Enter supplier email"
                  className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                />

              </div>


              {/* PRODUCT NAME */}

              <div>

                <label className="block text-sm text-[#8faec2] mb-2">
                  Product Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                />

              </div>


              {/* MANUFACTURING DATE */}

              <div>

                <label className="block text-sm text-[#8faec2] mb-2">
                  Manufacturing Date *
                </label>

                <input
                  type="date"
                  name="mfg"
                  value={form.mfg}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                />

              </div>


              {/* EXPIRY DATE */}

              <div>

                <label className="block text-sm text-[#8faec2] mb-2">
                  Expiry Date {hasExpiry ? "*" : "(not applicable)"}
                </label>

                <input
                  type="date"
                  name="exp"
                  value={form.exp}
                  onChange={handleChange}
                  disabled={!hasExpiry}
                  className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                />

                <label className="flex items-center gap-2 mt-2 text-sm text-[#8faec2] cursor-pointer">

                  <input
                    type="checkbox"
                    checked={!hasExpiry}
                    onChange={(e) => {
                      setHasExpiry(!e.target.checked);

                      if (e.target.checked) {
                        setForm((f) => ({ ...f, exp: "" }));
                      }
                    }}
                  />

                  No expiry date (e.g. electronics)

                </label>

              </div>


              {/* CATEGORY */}

              <div>

                <label className="block text-sm text-[#8faec2] mb-2">
                  Category ID *
                </label>

                <input
                  type="text"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  placeholder="Example: MED001"
                  className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                />

              </div>


              {/* COST */}

              <div>

                <label className="block text-sm text-[#8faec2] mb-2">
                  Cost *
                </label>

                <input
                  type="number"
                  name="cost"
                  value={form.cost}
                  onChange={handleChange}
                  placeholder="Enter product cost"
                  min="0"
                  step="0.01"
                  className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                />

              </div>


              {/* IMAGE */}

              <div>

                <label className="block text-sm text-[#8faec2] mb-2">
                  Product Image *
                </label>

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImage}
                  className="w-full h-11 px-3 py-2 rounded-lg bg-[#0c171e] border border-[#294554] text-white"
                />

              </div>


              {/* DESCRIPTION */}

              <div>

                <label className="block text-sm text-[#8faec2] mb-2">
                  Product Description
                </label>

                <input
                  type="text"
                  name="productDesc"
                  value={form.productDesc}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                />

              </div>

            </div>


            {/* BUTTONS */}

            <div className="flex justify-end gap-3 pt-3">

              <button
                type="button"
                onClick={() => setShowAddProduct(false)}
                className="px-6 h-11 rounded-lg border border-[#294554] text-[#8faec2] hover:text-white hover:border-white transition"
              >
                Cancel
              </button>


              <button
                type="submit"
                className="px-6 h-11 rounded-lg bg-[#ffb91f] text-[#111] font-semibold hover:bg-[#ffc83d] transition"
              >
                Add Product
              </button>

            </div>

          </form>

        </section>

      )}


      {/* =========================
          PRODUCTS
      ========================= */}

      <section className="admin-panel">


        {loading ? (

          <div className="admin-empty">

            <h3>
              Loading products...
            </h3>

          </div>

        ) : products.length === 0 ? (

          <div className="admin-empty">

            <h3>
              No products found
            </h3>

            <p>
              Products from your backend will appear here.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Image
                  </th>

                  <th>
                    Supplier Email
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Cost
                  </th>

                  <th>
                    MFG
                  </th>

                  <th>
                    EXP
                  </th>

                  <th>
                    Description
                  </th>

                </tr>

              </thead>


              <tbody>

                {products.map((product) => (

                  <tr key={product._id}>

                    <td>
                      {product.name}
                    </td>


                    <td>

                      {product.image ? (

                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />

                      ) : (

                        <span>
                          No image
                        </span>

                      )}

                    </td>


                    <td>
                      {product.supplierEmail || "N/A"}
                    </td>


                    <td>
                      {product.categoryId}
                    </td>


                    <td>
                      ₹
                      {product.cost?.$numberDecimal ||
                        product.cost}
                    </td>


                    <td>
                      {product.mfg
                        ? new Date(product.mfg).toLocaleDateString()
                        : "N/A"}
                    </td>


                    <td>
                      {product.exp
                        ? new Date(product.exp).toLocaleDateString()
                        : "N/A"}
                    </td>


                    <td>
                      {product.productDesc || "N/A"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}

