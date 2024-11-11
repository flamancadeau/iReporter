// 'use client'

// import React, { useState } from 'react'
// import { CircleAlert, MapPin, Trash2, Edit, FileText, Calendar, X } from 'lucide-react'

// // Types for Report
// interface Report {
//   id: string
//   type: 'red-flag' | 'intervention'
//   status: 'pending' | 'under_investigation' | 'rejected' | 'resolved'
//   description: string
//   date: string // ISO date string
//   latitude?: number
//   longitude?: number
// }

// export default function ReportManagementComponent() {
//   const [reports, setReports] = useState<Report[]>([
//     { 
//       id: '1', 
//       type: 'red-flag', 
//       status: 'pending',
//       description: 'Suspicious activity observed in the area',
//       date: new Date().toISOString(),
//       latitude: 40.7128,
//       longitude: -74.0060 
//     },
//     { 
//       id: '2', 
//       type: 'intervention', 
//       status: 'pending',
//       description: 'Potential safety concern requiring immediate attention',
//       date: new Date(Date.now() - 86400000).toISOString(), // Previous day
//       latitude: 40.7489,
//       longitude: -73.9680 
//     }
//   ])

//   const [editingReport, setEditingReport] = useState<Report | null>(null)
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
//   const [newLatitude, setNewLatitude] = useState<string>('')
//   const [newLongitude, setNewLongitude] = useState<string>('')
//   const [newDescription, setNewDescription] = useState<string>('')
//   const [newDate, setNewDate] = useState<string>('')

//   // Format date for display
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   // Check if report can be edited
//   const canEditReport = (report: Report) => {
//     return report.status === 'pending'
//   }

//   // Handle report deletion
//   const handleDeleteReport = (reportId: string) => {
//     const reportToDelete = reports.find(r => r.id === reportId)
    
//     if (reportToDelete && canEditReport(reportToDelete)) {
//       setReports(reports.filter(r => r.id !== reportId))
//     } else {
//       alert('This report cannot be deleted as it is no longer in pending status.')
//     }
//   }

//   // Start editing a report
//   const startEditingReport = (report: Report) => {
//     if (canEditReport(report)) {
//       setEditingReport(report)
//       setNewLatitude(report.latitude?.toString() || '')
//       setNewLongitude(report.longitude?.toString() || '')
//       setNewDescription(report.description)
//       setNewDate(report.date.split('T')[0]) // Convert ISO date to YYYY-MM-DD
//       setIsEditModalOpen(true)
//     } else {
//       alert('This report cannot be edited as it is no longer in pending status.')
//     }
//   }

//   // Update report details
//   const updateReport = () => {
//     if (!editingReport) return

//     const updatedReports = reports.map(report => 
//       report.id === editingReport.id 
//         ? {
//             ...report, 
//             latitude: parseFloat(newLatitude), 
//             longitude: parseFloat(newLongitude),
//             description: newDescription,
//             date: new Date(newDate).toISOString()
//           }
//         : report
//     )

//     setReports(updatedReports)
//     setIsEditModalOpen(false)
//     setEditingReport(null)
//   }

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Report Management</h2>
      
//       {reports.length === 0 && (
//         <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg text-center">
//           <div className="flex justify-center mb-2">
//             <CircleAlert className="h-8 w-8 text-gray-600" />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-800">No Reports</h3>
//           <p className="text-gray-600">
//             You have no current red-flag or intervention reports to manage.
//           </p>
//         </div>
//       )}

//       {reports.map(report => (
//         <div 
//           key={report.id} 
//           className="border rounded-lg p-4 mb-4 flex items-center justify-between"
//         >
//           <div className="flex-grow">
//             <div className="flex items-center space-x-2">
//               {report.type === 'red-flag' ? (
//                 <CircleAlert className="text-red-500 mr-2" />
//               ) : (
//                 <FileText className="text-yellow-500 mr-2" />
//               )}
//               <span className="font-medium capitalize">{report.type}</span>
//               <span 
//                 className={`px-2 py-1 rounded text-xs 
//                   ${report.status === 'pending' ? 'bg-blue-100 text-blue-800' : 
//                     report.status === 'under_investigation' ? 'bg-yellow-100 text-yellow-800' :
//                     report.status === 'resolved' ? 'bg-green-100 text-green-800' : 
//                     'bg-red-100 text-red-800'}`}
//               >
//                 {report.status}
//               </span>
//             </div>
            
//             {/* Date */}
//             <div className="flex items-center text-sm text-gray-600 mt-2">
//               <Calendar className="w-4 h-4 mr-2" />
//               {formatDate(report.date)}
//             </div>
            
//             {/* Description */}
//             <div className="text-sm text-gray-600 mt-2 line-clamp-2">
//               {report.description}
//             </div>
            
//             {/* Geolocation */}
//             {report.latitude && report.longitude && (
//               <div className="flex items-center text-sm text-gray-600 mt-2">
//                 <MapPin className="w-4 h-4 mr-2" />
//                 Lat: {report.latitude}, Lon: {report.longitude}
//               </div>
//             )}
//           </div>
          
//           {/* Action Buttons */}
//           <div className="flex space-x-2 ml-4">
//             <button 
//               onClick={() => startEditingReport(report)}
//               disabled={!canEditReport(report)}
//               className={`p-2 rounded border 
//                 ${canEditReport(report) 
//                   ? 'hover:bg-yellow-50 border-yellow-300 text-yellow-600' 
//                   : 'cursor-not-allowed opacity-50 border-gray-300 text-gray-400'}`}
//             >
//               <Edit className="h-4 w-4" />
//             </button>
            
//             <button 
//               onClick={() => handleDeleteReport(report.id)}
//               disabled={!canEditReport(report)}
//               className={`p-2 rounded border 
//                 ${canEditReport(report) 
//                   ? 'hover:bg-red-50 border-red-300 text-red-600' 
//                   : 'cursor-not-allowed opacity-50 border-gray-300 text-gray-400'}`}
//             >
//               <Trash2 className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       ))}

//       {/* Custom Modal */}
//       {isEditModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h3 className="text-lg font-semibold">
//                 Edit {editingReport?.type.replace('-', ' ').toUpperCase()} Report
//               </h3>
//               <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
//                 <X className="h-6 w-6" />
//               </button>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
//                     Latitude
//                   </label>
//                   <input
//                     id="latitude"
//                     type="number"
//                     value={newLatitude}
//                     onChange={(e) => setNewLatitude(e.target.value)}
//                     placeholder="Enter latitude"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
//                     Longitude
//                   </label>
//                   <input
//                     id="longitude"
//                     type="number"
//                     value={newLongitude}
//                     onChange={(e) => setNewLongitude(e.target.value)}
//                     placeholder="Enter longitude"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>
//               <div className="mb-4">
//                 <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
//                   Date
//                 </label>
//                 <input
//                   id="date"
//                   type="date"
//                   value={newDate}
//                   onChange={(e) => setNewDate(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="mb-4">
//                 <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   id="description"
//                   value={newDescription}
//                   onChange={(e) => setNewDescription(e.target.value)}
//                   placeholder="Provide details about the report"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
//                 />
//               </div>
//               <div className="flex justify-end space-x-2">
//                 <button
//                   onClick={() => setIsEditModalOpen(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={updateReport}
//                   disabled={!newLatitude || !newLongitude || !newDescription || !newDate}
//                   className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500
//                     ${(!newLatitude || !newLongitude || !newDescription || !newDate)
//                       ? 'bg-gray-300 cursor-not-allowed'
//                       : 'bg-blue-600 hover:bg-blue-700'}`}
//                 >
//                   Update Report
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }