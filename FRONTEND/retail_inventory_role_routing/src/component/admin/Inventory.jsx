
import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../api";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");

  // =========================
  // GET ALL INVENTORY
  // =========================
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "http://localhost:8000/api/v1/inventory/view"
      );

      console.log("Inventory response:", res.data);

      setInventory(res.data?.data || []);
    } catch (err) {
      console.log("Inventory error:", err);
      console.log("Response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // =========================
  // OPEN UPDATE MODAL
  // =========================
  const openUpdateModal = (item) => {
    setSelectedItem(item);

    setNewQuantity(
      item.quantity !== undefined && item.quantity !== null
        ? item.quantity
        : 0
    );

    setShowModal(true);
  };

  // =========================
  // UPDATE QUANTITY
  // =========================
const updateQuantity = async () => {
    try {

        const res = await axios.patch(
            `http://localhost:8000/api/v1/inventory/update/${selectedItem.productId}`,
            {
                quantity: Number(newQuantity)
            }
        );

        console.log("Update response:", res.data);

        setShowModal(false);
        setSelectedItem(null);

        await fetchInventory();

    } catch (err) {

        console.log("FULL UPDATE ERROR:", err);
        console.log("STATUS:", err.response?.status);
        console.log("BACKEND ERROR:", err.response?.data);

        alert(
            err.response?.data?.message ||
            err.message ||
            "Failed to update inventory"
        );
    }
};

  // =========================
  // REMOVE PRODUCT
  // =========================
  const removeProduct = async (item) => {
    const ok = window.confirm(
      `Remove "${item.name}" completely?\n\nIt will be deleted from the catalogue, inventory and all carts. This cannot be undone.`
    );

    if (!ok) return;

    try {
      await api.delete(`/inventory/remove/${item.productId}`);
      await fetchInventory();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to remove product"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Inventory
          </h1>

          <p className="text-gray-500 mt-2">
            Manage product stock and inventory levels
          </p>
        </div>

        <div className="bg-white border rounded-xl px-7 py-4 shadow-sm">
          <span className="text-2xl font-semibold">
            {inventory.length}
          </span>

          <span className="text-gray-500 ml-2">
            Products
          </span>
        </div>

      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="mb-6 border border-red-300 bg-red-50 text-red-600 rounded-lg px-5 py-4">
          {error}
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50 border-b">

              <tr>

                <th className="text-left px-6 py-5 text-gray-700">
                  Product Name
                </th>

                <th className="text-left px-6 py-5 text-gray-700">
                  Product ID
                </th>

                <th className="text-left px-6 py-5 text-gray-700">
                  Quantity
                </th>

                <th className="text-left px-6 py-5 text-gray-700">
                  Minimum Quantity
                </th>

                <th className="text-left px-6 py-5 text-gray-700">
                  Status
                </th>

                <th className="text-left px-6 py-5 text-gray-700">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {/* ================= LOADING ================= */}
              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="text-center py-16 text-gray-500"
                  >
                    Loading inventory...
                  </td>

                </tr>

              ) : inventory.length === 0 ? (

                /* ================= EMPTY ================= */

                <tr>

                  <td
                    colSpan="6"
                    className="text-center py-16 text-gray-500"
                  >
                    No products found
                  </td>

                </tr>

              ) : (

                /* ================= DATA ================= */

                inventory.map((item) => {

                  /*
                    Product ID can come in different forms
                    depending on backend response.
                  */

                  const productId =
                    item.productId?._id ||
                    item.productId ||
                    item.product?._id ||
                    item.product?._id ||
                    item._id;

                  const productName =
                    item.productId?.name ||
                    item.product?.name ||
                    item.name ||
                    "N/A";

                  const quantity =
                    item.quantity ?? 0;

                  const minimumQuantity =
                    item.minimumQuantity ??
                    item.minQuantity ??
                    0;

                  const lowStock =
                    Number(quantity) <
                    Number(minimumQuantity);

                  return (

                    <tr
                      key={productId}
                      className={`border-b hover:bg-gray-50 ${
                        lowStock ? "bg-red-50" : ""
                      }`}
                    >

                      {/* PRODUCT NAME */}
                      <td className="px-6 py-5 font-medium text-gray-900">
                        {productName}
                      </td>

                      {/* PRODUCT ID */}
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {productId}
                      </td>

                      {/* QUANTITY */}
                      <td className="px-6 py-5 font-medium">
                        {quantity}
                      </td>

                      {/* MINIMUM QUANTITY */}
                      <td className="px-6 py-5">
                        {minimumQuantity}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">

                        {lowStock ? (

                          <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-600">
                            Low Stock
                          </span>

                        ) : (

                          <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-600">
                            In Stock
                          </span>

                        )}

                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-5">

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              openUpdateModal(item)
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                          >
                            Update
                          </button>

                          <button
                            onClick={() =>
                              removeProduct(item)
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                          >
                            Remove
                          </button>

                        </div>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ================= UPDATE MODAL ================= */}

      {showModal && selectedItem && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">

            <h2 className="text-xl font-semibold mb-4">
              Update Quantity
            </h2>

            <p className="text-gray-500 mb-4">

              {selectedItem.productId?.name ||
                selectedItem.product?.name ||
                selectedItem.name ||
                "Product"}

            </p>

            <input
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) =>
                setNewQuantity(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3 mb-5 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedItem(null);
                  setNewQuantity("");
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={updateQuantity}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
