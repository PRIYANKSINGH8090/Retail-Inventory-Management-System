import { useState } from "react";
import axios from "axios";

export default function CreateAccounts() {
  const [staff, setStaff] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [supplier, setSupplier] = useState({
    supplierName: "",
    address: "",
    email: "",
    phone: "",
  });

  const [staffMessage, setStaffMessage] = useState("");
  const [staffError, setStaffError] = useState("");

  const [supplierMessage, setSupplierMessage] = useState("");
  const [supplierError, setSupplierError] = useState("");

  const handleStaff = (e) => {
    setStaff({
      ...staff,
      [e.target.name]: e.target.value,
    });

    setStaffMessage("");
    setStaffError("");
  };

  const handleSupplier = (e) => {
    setSupplier({
      ...supplier,
      [e.target.name]: e.target.value,
    });

    setSupplierMessage("");
    setSupplierError("");
  };

  const createStaff = async (e) => {
    e.preventDefault();

    setStaffMessage("");
    setStaffError("");

    if (!staff.fullName || !staff.email || !staff.password) {
      setStaffError("Please fill all staff fields.");
      return;
    }

    try {
      const username = staff.email
        .split("@")[0]
        .toLowerCase()
        .trim();

      const response = await axios.post(
        "http://localhost:8000/api/v1/users/register",
        {
          fullName: staff.fullName,
          username,
          email: staff.email,
          password: staff.password,
          role: "staff",
        }
      );

      setStaffMessage(
        response.data?.message ||
          "Staff account created successfully."
      );

      setStaff({
        fullName: "",
        email: "",
        password: "",
      });
    } catch (error) {
      if (error.response) {
        setStaffError(
          error.response.data?.message ||
            "Unable to create staff account."
        );
      } else {
        setStaffError(
          "Server se connect nahi ho pa raha."
        );
      }
    }
  };



const registerSupplier = async (e) => {
  e.preventDefault();

  setSupplierMessage("");
  setSupplierError("");

  if (
    !supplier.supplierName ||
    !supplier.address ||
    !supplier.email ||
    !supplier.phone
  ) {
    setSupplierError("Please fill all supplier fields.");
    return;
  }

  try {
    const response = await axios.post(
  "http://localhost:8000/api/v1/supplier/register",
  {
    name: supplier.supplierName,
    email: supplier.email.toLowerCase().trim(),
    phone: supplier.phone.trim(),
    address: supplier.address.trim(),
  } 
);

    console.log("Supplier response:", response.data);

    setSupplierMessage("Supplier added successfully.");

    setSupplier({
      supplierName: "",
      address: "",
      email: "",
      phone: "",
    });

  } catch (error) {
    console.log("Supplier error:", error);

    setSupplierError(
      error.response?.data?.message || "Supplier already exists or unable to add supplier."
    );
  }
};
  return (
    <div className="min-h-screen bg-[#0c171e] text-white p-6 md:p-10">

      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Create Accounts
          </h1>

          <p className="text-[#8faec2] mt-2">
            Manage staff accounts and supplier details.
          </p>
        </div>

        <div className="space-y-8">

          {/* STAFF SECTION */}

          <section className="bg-[#162731] border border-[#294554] rounded-2xl overflow-hidden">

            <div className="px-6 py-5 border-b border-[#294554]">
              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-semibold">
                    Staff Account
                  </h2>

                  <p className="text-sm text-[#8faec2] mt-1">
                    Create a login account for a staff member.
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-[#ffb91f]/10 border border-[#ffb91f]/30 text-[#ffb91f] text-sm">
                  Staff
                </div>

              </div>
            </div>

            <form
              onSubmit={createStaff}
              className="p-6"
            >

              {staffMessage && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                  {staffMessage}
                </div>
              )}

              {staffError && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {staffError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm text-[#8faec2] mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={staff.fullName}
                    onChange={handleStaff}
                    placeholder="Enter full name"
                    className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#8faec2] mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={staff.email}
                    onChange={handleStaff}
                    placeholder="staff@example.com"
                    className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#8faec2] mb-2">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={staff.password}
                    onChange={handleStaff}
                    placeholder="Create password"
                    className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#8faec2] mb-2">
                    Role
                  </label>

                  <input
                    type="text"
                    value="Staff"
                    disabled
                    className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-[#8faec2] outline-none cursor-not-allowed"
                  />
                </div>

              </div>

              <div className="mt-6 flex justify-end">

                <button
                  type="submit"
                  className="px-6 h-11 rounded-lg bg-[#ffb91f] text-[#111] font-semibold hover:bg-[#ffc83d] transition"
                >
                  Create Staff
                </button>

              </div>

            </form>

          </section>


          {/* SUPPLIER SECTION */}

          <section className="bg-[#162731] border border-[#294554] rounded-2xl overflow-hidden">

            <div className="px-6 py-5 border-b border-[#294554]">

              <div>
                <h2 className="text-xl font-semibold">
                  Supplier Details
                </h2>

                <p className="text-sm text-[#8faec2] mt-1">
                  Add supplier information for inventory management.
                </p>
              </div>

            </div>

            <form
              onSubmit={registerSupplier}
              className="p-6"
            >

              {supplierMessage && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                  {supplierMessage}
                </div>
              )}

              {supplierError && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {supplierError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm text-[#8faec2] mb-2">
                    Supplier Name
                  </label>

                  <input
                    type="text"
                    name="supplierName"
                    value={supplier.supplierName}
                    onChange={handleSupplier}
                    placeholder="Enter supplier name"
                    className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#8faec2] mb-2">
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={supplier.address}
                    onChange={handleSupplier}
                    placeholder="Enter supplier address"
                    className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#8faec2] mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={supplier.email}
                    onChange={handleSupplier}
                    placeholder="supplier@example.com"
                    className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#8faec2] mb-2">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={supplier.phone}
                    onChange={handleSupplier}
                    placeholder="Enter phone number"
                    className="w-full h-11 px-4 rounded-lg bg-[#0c171e] border border-[#294554] text-white outline-none focus:border-[#ffb91f]"
                  />
                </div>

              </div>

              <div className="mt-6 flex items-center justify-between">

                <p className="text-xs text-[#607d8b]">
                  Supplier details will be managed by Priyank.
                </p>

                <button
                  type="submit"
                  className="px-6 h-11 rounded-lg border border-[#ffb91f] text-[#ffb91f] font-semibold hover:bg-[#ffb91f] hover:text-[#111] transition"
                >
                  Add Supplier
                </button>

              </div>

            </form>

          </section>

        </div>

      </div>

    </div>
  );
}