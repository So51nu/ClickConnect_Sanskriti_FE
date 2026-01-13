import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exportExcel, exportPdf, getEnquiries, setAuthToken } from "../../api";

type Enquiry = {
  id: number;
  name: string;
  mobile: string;
  email: string;
  created_at: string;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 20;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount]
  );

  useEffect(() => {
    const token = localStorage.getItem("admin_access");
    if (!token) {
      navigate("/admin", { replace: true });
      return;
    }
    setAuthToken(token);
  }, [navigate]);

  const fetchEnquiries = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await getEnquiries(page);
      setEnquiries(response.data?.results || []);
      setTotalCount(response.data?.count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to load enquiries:", err);
      localStorage.removeItem("admin_access");
      setAuthToken(null);
      navigate("/admin", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEnquiries = useMemo(() => {
    if (!searchQuery.trim()) return enquiries;

    const query = searchQuery.trim().toLowerCase();
    return enquiries.filter((item) =>
      [item.name, item.mobile, item.email, String(item.id)].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [enquiries, searchQuery]);

  const handleExportExcel = async () => {
    try {
      const res = await exportExcel();
      downloadBlob(res.data, "Enquiries_" + new Date().toISOString().split("T")[0] + ".xlsx");
    } catch {
      alert("Excel export failed. Please try again.");
    }
  };

  const handleExportPdf = async () => {
    try {
      const res = await exportPdf();
      downloadBlob(res.data, "Enquiries_" + new Date().toISOString().split("T")[0] + ".pdf");
    } catch {
      alert("PDF export failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_access");
    setAuthToken(null);
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700/60 bg-slate-950/70 backdrop-blur-lg sticky top-0 z-50 shadow-lg shadow-black/30">
        <div className="mx-auto max-w-7xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Total Enquiries: <span className="font-semibold text-teal-400">{totalCount}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchEnquiries(currentPage)}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Refresh
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Export PDF
            </button>

            <button
              onClick={handleExportExcel}
              disabled={isLoading}
              className="px-5 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold rounded-lg shadow-lg shadow-teal-900/30 transition-all disabled:opacity-60"
            >
              Export Excel
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-800/50 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-6">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, email or ID..."
            className="w-full sm:max-w-md bg-slate-900/60 border border-slate-700 rounded-xl px-5 py-3 outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-slate-500"
          />

          <div className="flex items-center gap-4 bg-slate-900/40 px-4 py-2 rounded-xl border border-slate-700/50">
            <button
              disabled={currentPage <= 1 || isLoading}
              onClick={() => fetchEnquiries(currentPage - 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm disabled:opacity-40 transition-colors"
            >
              ← Previous
            </button>

            <span className="text-slate-300 text-sm font-medium">
              Page <strong className="text-teal-400">{currentPage}</strong> of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => fetchEnquiries(currentPage + 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl shadow-black/30">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/70 text-slate-300">
                  <th className="text-left p-5 font-semibold">ID</th>
                  <th className="text-left p-5 font-semibold">Name</th>
                  <th className="text-left p-5 font-semibold">Mobile</th>
                  <th className="text-left p-5 font-semibold">Email</th>
                  <th className="text-left p-5 font-semibold">Created At</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                      <div className="mt-3">Loading enquiries...</div>
                    </td>
                  </tr>
                ) : filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500">
                      {searchQuery ? "No matching enquiries found" : "No enquiries yet"}
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map((enq) => (
                    <tr
                      key={enq.id}
                      className="border-t border-slate-700/50 hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-5 text-slate-400">#{enq.id}</td>
                      <td className="p-5 font-medium text-white">{enq.name || "—"}</td>
                      <td className="p-5 text-slate-300">{enq.mobile || "—"}</td>
                      <td className="p-5 text-slate-300">{enq.email || "—"}</td>
                      <td className="p-5 text-slate-400">
                        {new Date(enq.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-5 text-xs text-slate-600 text-center">
          Note: Search currently works only on the loaded page • Page size: {pageSize} records
        </p>
      </main>
    </div>
  );
}