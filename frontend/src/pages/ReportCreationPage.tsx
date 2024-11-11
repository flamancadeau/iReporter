import React, { useState, useMemo } from "react";
import {
  CircleAlert,
  MapPin,
  Trash2,
  Edit,
  FileText,
  Calendar,
  X,
  Search,
} from "lucide-react";
import Button from "./components/Button";

// Types for Report
interface Report {
  id: string;
  type: "red-flag" | "intervention";
  status: "draft" | "pending" | "under_investigation" | "rejected" | "resolved";
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  incidentDate: string;
  reportDate: string;
  images: string[];
}

export default function ReportSystem() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      type: "red-flag",
      title: "Suspicious activity",
      status: "pending",
      description: "Suspicious activity observed in the area",
      location: "Downtown",
      incidentDate: new Date().toISOString().split("T")[0],
      reportDate: new Date().toISOString().split("T")[0],
      latitude: 40.7128,
      longitude: -74.006,
      images: [],
    },
    {
      id: "2",
      type: "intervention",
      title: "Road repair needed",
      status: "pending",
      description: "Potential safety concern requiring immediate attention",
      location: "Main Street",
      incidentDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      reportDate: new Date().toISOString().split("T")[0],
      latitude: 40.7489,
      longitude: -73.968,
      images: [],
    },
  ]);

  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manage");
  const [formData, setFormData] = useState<Omit<Report, "id" | "status">>({
    type: "red-flag",
    title: "",
    description: "",
    location: "",
    latitude: undefined,
    longitude: undefined,
    incidentDate: "",
    reportDate: new Date().toISOString().split("T")[0],
    images: [],
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEditReport = (report: Report) => {
    return report.status === "pending" || report.status === "draft";
  };

  const handleDeleteReport = (reportId: string) => {
    const reportToDelete = reports.find((r) => r.id === reportId);
    if (reportToDelete && canEditReport(reportToDelete)) {
      setReports(reports.filter((r) => r.id !== reportId));
    } else {
      alert(
        "This report cannot be deleted as it is no longer in pending or draft status."
      );
    }
  };

  const startEditingReport = (report: Report) => {
    if (canEditReport(report)) {
      setEditingReport(report);
      setFormData({
        type: report.type,
        title: report.title,
        description: report.description,
        location: report.location,
        latitude: report.latitude,
        longitude: report.longitude,
        incidentDate: report.incidentDate,
        reportDate: report.reportDate,
        images: report.images,
      });
      setIsEditModalOpen(true);
    } else {
      alert(
        "This report cannot be edited as it is no longer in pending or draft status."
      );
    }
  };

  const updateReport = () => {
    if (!editingReport) return;

    const updatedReports = reports.map((report) =>
      report.id === editingReport.id ? { ...report, ...formData } : report
    );

    setReports(updatedReports);
    setIsEditModalOpen(false);
    setEditingReport(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReport) {
      updateReport();
    } else {
      try {
        // Retrieve the userId from localStorage
        const userId = localStorage.getItem("userId");

        if (!userId) {
          throw new Error("User is not logged in. User ID not found.");
        }

        // Prepare your form data
        const requestBody = {
          ...formData,
          userId: userId, // Attach the userId dynamically from localStorage
        };

        // Sending the POST request with formData and userId
        const response = await fetch("http://localhost:3000/auth/report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to submit the report");
        }

        const data = await response.json();
        const newReport: Report = {
          id: data.newReport.id,
          status: "pending",
          ...formData,
        };
        setReports([...reports, newReport]);
        resetForm();
      } catch (error) {
        console.error("Error creating report:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError("");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setIsLoadingLocation(false);
        },
        (error) => {
          setLocationError(
            "Failed to get location. Please ensure location services are enabled."
          );
          setIsLoadingLocation(false);
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "red-flag",
      title: "",
      description: "",
      location: "",
      latitude: undefined,
      longitude: undefined,
      incidentDate: "",
      reportDate: new Date().toISOString().split("T")[0],
      images: [],
    });
  };

  const filteredReports = useMemo(() => {
    return reports.filter(
      (report) =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reports, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Report System</h1>

        {/* Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("manage")}
              className={`py-2 px-4 rounded-lg font-medium ${
                activeTab === "manage"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Tracking your Reports
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`py-2 px-4 rounded-lg font-medium ${
                activeTab === "create"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Report Incident
            </button>
          </div>
        </div>

        {/* Manage Reports Section */}
        {activeTab === "manage" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Manage Reports</h2>
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {filteredReports.length === 0 && (
              <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg text-center">
                <div className="flex justify-center mb-2">
                  <CircleAlert className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  No Reports Found
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "No reports match your search criteria."
                    : "You have no current red-flag or intervention reports to manage."}
                </p>
              </div>
            )}

            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="border rounded-lg p-4 mb-4 flex items-center justify-between"
              >
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    {report.type === "red-flag" ? (
                      <CircleAlert className="text-red-500 mr-2" />
                    ) : (
                      <FileText className="text-yellow-500 mr-2" />
                    )}
                    <span className="font-medium capitalize">
                      {report.type}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        report.status === "pending"
                          ? "bg-blue-100 text-blue-800"
                          : report.status === "under_investigation"
                          ? "bg-yellow-100 text-yellow-800"
                          : report.status === "resolved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mt-2">{report.title}</h3>

                  {/* Date */}
                  <div className="flex items-center text-sm text-gray-600 mt-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(report.incidentDate)}
                  </div>

                  {/* Description */}
                  <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {report.description}
                  </div>

                  {/* Geolocation */}
                  {report.latitude && report.longitude && (
                    <div className="flex items-center text-sm text-gray-600 mt-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      Lat: {report.latitude}, Lon: {report.longitude}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => startEditingReport(report)}
                    disabled={!canEditReport(report)}
                    className={`p-2 rounded border ${
                      canEditReport(report)
                        ? "hover:bg-yellow-50 border-yellow-300 text-yellow-600"
                        : "cursor-not-allowed opacity-50 border-gray-300 text-gray-400"
                    }`}
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    disabled={!canEditReport(report)}
                    className={`p-2 rounded border ${
                      canEditReport(report)
                        ? "hover:bg-red-50 border-red-300 text-red-600"
                        : "cursor-not-allowed opacity-50 border-gray-300 text-gray-400"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Report Section */}
        {activeTab === "create" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Create New Report</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Report Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a Record Type</option>
                  <option value="RED_FLAG">Red-flag Record</option>
                  <option value="INTERVENTION">Intervention Record</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the incident or issue"
                  required
                />
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date of Incident
                  </label>
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Report Date
                  </label>
                  <input
                    type="date"
                    name="reportDate"
                    value={formData.reportDate}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Detailed Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide as much detail as possible..."
                  required
                />
              </div>

              {/* Location Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location Description
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter location details"
                    required
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium">
                      Geolocation
                    </label>
                    <Button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation
                        ? "Getting Location..."
                        : "Get Current Location"}
                    </Button>
                  </div>

                  {locationError && (
                    <div className="text-red-600 text-sm mb-4">
                      {locationError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Latitude
                      </label>
                      <input
                        type="text"
                        name="latitude"
                        value={formData.latitude?.toString() || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 51.5074"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Longitude
                      </label>
                      <input
                        type="text"
                        name="longitude"
                        value={formData.longitude?.toString() || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., -0.1278"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Evidence Images
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-400">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload files</span>
                        <input
                          type="file"
                          className="sr-only"
                          multiple
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 10MB each
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-md  hover:bg-gray-50"
                >
                  Reset Form
                </button>
                <Button type="submit">Submit Report</Button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
              <div className="flex justify-between items-center p-4 border-b border-gray-300">
                <h3 className="text-lg font-semibold text-gray-800">
                  Edit {editingReport?.type.replace("-", " ").toUpperCase()}{" "}
                  Report
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="text"
                        name="latitude"
                        value={formData.latitude?.toString() || ""}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="text"
                        name="longitude"
                        value={formData.longitude?.toString() || ""}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Incident Date
                    </label>
                    <input
                      type="date"
                      name="incidentDate"
                      value={formData.incidentDate}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-1 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Update Report
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
